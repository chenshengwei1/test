import { StorageBackend } from './storage-interface.js';

export class GitHubStorage extends StorageBackend {
  constructor(config) {
    super();
    this.token = config.token;
    this.repo = config.repo;
    this.basePath = (config.basePath || 'uploads/').replace(/^\/+|\/+$/g, '') + '/';
    this.apiBase = `https://api.github.com/repos/${this.repo}/contents/`;
    this.rawBase = `https://raw.githubusercontent.com/${this.repo}/main/`;
  }

  get name() {
    return 'GitHub';
  }

  async upload(file, options = {}) {
    // 检查文件大小 (GitHub API 限制 100MB)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('文件超过 100MB，GitHub API 不支持');
    }

    const content = await this._fileToBase64(file);
    const path = this.basePath + file.name;
    const url = this.apiBase + path;

    // 检查文件是否存在，获取 sha
    let sha = null;
    try {
      const resp = await fetch(url, {
        headers: { 'Authorization': `token ${this.token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        sha = data.sha;
      }
    } catch (e) { /* 文件不存在，正常 */ }

    const body = {
      message: options.message || `Upload ${file.name}`,
      content: content.replace(/^data:.+?;base64,/, ''),
      branch: options.branch || 'main'
    };
    if (sha) body.sha = sha;

    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(`上传失败 (${resp.status}): ${err.message || resp.statusText}`);
    }

    const data = await resp.json();
    const downloadUrl = data.content?.download_url || this.rawBase + path;

    return {
      fileId: path,
      downloadUrl: downloadUrl,
      size: file.size,
      filename: file.name
    };
  }

  async download(fileId) {
    // fileId 可以是路径或完整 URL
    let url = fileId;
    if (fileId.startsWith('http')) {
      // 直接下载
      const resp = await fetch(fileId);
      if (!resp.ok) throw new Error(`下载失败 (${resp.status})`);
      const blob = await resp.blob();
      const filename = fileId.split('/').pop().split('?')[0] || 'download';
      return {
        data: blob,
        filename: filename,
        size: blob.size,
        contentType: blob.type || 'application/octet-stream'
      };
    }

    // 通过 API 获取
    const apiUrl = this.apiBase + fileId.replace(/^\/+/, '');
    const resp = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${this.token}` }
    });
    if (!resp.ok) {
      if (resp.status === 404) return null;
      throw new Error(`获取文件失败 (${resp.status})`);
    }
    const data = await resp.json();
    const base64 = data.content;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: data.encoding || 'application/octet-stream' });

    return {
      data: blob,
      filename: data.name || 'download',
      size: data.size || blob.size,
      contentType: data.encoding || 'application/octet-stream'
    };
  }

  async delete(fileId) {
    const path = fileId.replace(/^\/+/, '');
    const url = this.apiBase + path;

    // 先获取 sha
    let sha = null;
    try {
      const resp = await fetch(url, {
        headers: { 'Authorization': `token ${this.token}` }
      });
      if (!resp.ok) {
        if (resp.status === 404) return false;
        throw new Error(`获取文件信息失败 (${resp.status})`);
      }
      const data = await resp.json();
      sha = data.sha;
    } catch (e) {
      return false;
    }

    const resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Delete ${path}`,
        sha: sha,
        branch: 'main'
      })
    });

    return resp.ok;
  }

  async getInfo(fileId) {
    const path = fileId.replace(/^\/+/, '');
    const url = this.apiBase + path;
    const resp = await fetch(url, {
      headers: { 'Authorization': `token ${this.token}` }
    });
    if (!resp.ok) {
      if (resp.status === 404) return null;
      throw new Error(`获取文件信息失败 (${resp.status})`);
    }
    const data = await resp.json();
    return {
      filename: data.name || path.split('/').pop(),
      size: data.size || 0,
      contentType: data.encoding || 'application/octet-stream',
      downloadUrl: data.download_url || this.rawBase + path
    };
  }

  _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}