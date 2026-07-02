// githubFileAPI.js

/**
 * GitHub 文件操作 API 类
 * 基于 repohub 库封装的完整文件读写能力
 * 
 * @example
 * const api = new GitHubFileAPI({
 *   token: 'your_github_token',
 *   repo: 'your_repo_name',
 *   owner: 'your_username'
 * });
 * 
 * // 上传文件
 * const result = await api.upload(file, 'folder');
 * 
 * // 读取文件
 * const content = await api.readText('file.txt', 'folder');
 */
import { createRepHub } from 'https://cdn.jsdelivr.net/npm/repohub@1.0.0/+esm';

class GitHubFileAPI {
    /**
     * @param {Object} config - 配置对象
     * @param {string} config.token - GitHub Personal Access Token (需要有 repo 权限)
     * @param {string} config.repo - 仓库名称 (例如: 'username.github.io')
     * @param {string} config.owner - GitHub 用户名或组织名
     * @param {string} [config.branch='master'] - 分支名称，默认 master
     */
    constructor(config) {
        if (!config.token) throw new Error('❌ token 是必需的');
        if (!config.repo) throw new Error('❌ repo 是必需的');
        if (!config.owner) throw new Error('❌ owner 是必需的');

        this.config = {
            branch: 'master',
            ...config
        };

        // 创建 repohub 实例
        this.repoHub = createRepHub({
            ghToken: this.config.token,
            ghRepo: this.config.repo,
            ghOwner: this.config.owner
        });

        // 缓存文件信息（用于优化性能）
        this._cache = new Map();
    }

    // ================================================================
    //  私有工具方法
    // ================================================================

    /**
     * 将 File 对象转为 Base64 字符串
     * @private
     */
    _fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // 格式: "data:mime;base64,xxxxx" -> 提取逗号后的 Base64
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * 构建 GitHub API 请求 URL
     * @private
     */
    _buildApiUrl(path) {
        const cleanPath = path ? path.replace(/^\/+/, '') : '';
        const pathPart = cleanPath ? `/${cleanPath}` : '';
        return `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents${pathPart}`;
    }

    /**
     * 构建请求头
     * @private
     */
    _getHeaders(extraHeaders = {}) {
        return {
            'Authorization': `Bearer ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            ...extraHeaders
        };
    }

    /**
     * 处理 API 响应
     * @private
     */
    async _handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }
        return response.json();
    }

    /**
     * 清除缓存
     * @private
     */
    _clearCache(path) {
        if (path) {
            this._cache.delete(path);
        } else {
            this._cache.clear();
        }
    }

    // ================================================================
    //  核心公共方法
    // ================================================================

    /**
     * 上传文件（新增）
     * @param {File} file - 要上传的文件对象 (来自 input[type=file])
     * @param {string} [subfolder=''] - 目标子文件夹，空字符串表示根目录
     * @param {string} [customFileName] - 自定义文件名，不传则使用原文件名
     * @returns {Promise<{success: boolean, data?: Object, downloadUrl?: string, error?: string}>}
     */
    async upload(file, subfolder = '', customFileName = null) {
        try {
            if (!file) throw new Error('请提供要上传的文件');

            const base64Content = await this._fileToBase64(file);
            const fileName = customFileName || file.name;
            const fileExtension = fileName.split('.').pop();

            const result = await this.repoHub.upload({
                mimeType: fileExtension,
                content: base64Content,
                path: subfolder || undefined,
                name: fileName  // 注意：repohub 可能忽略此参数，会生成随机名
            });

            // 清除缓存
            this._clearCache(subfolder);

            console.log('✅ 上传成功:', result);
            return {
                success: true,
                data: result,
                downloadUrl: result.download_url
            };
        } catch (error) {
            console.error('❌ 上传失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 上传文本内容（直接写入）
     * @param {string} fileName - 文件名
     * @param {string} content - 要写入的文本内容
     * @param {string} [subfolder=''] - 目标子文件夹
     * @param {string} [commitMessage] - 提交信息
     * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
     */
    async uploadText(fileName, content, subfolder = '', commitMessage = '') {
        try {
            if (!fileName) throw new Error('请提供文件名');
            if (content === undefined || content === null) throw new Error('请提供要写入的内容');

            // 将文本转为 Base64
            const base64Content = btoa(unescape(encodeURIComponent(content)));
            const fileExtension = fileName.split('.').pop();

            // 构建完整的文件路径
            const fullPath = subfolder ? `${subfolder}/${fileName}` : fileName;

            // 使用 GitHub API 直接写入（支持指定文件名）
            const url = this._buildApiUrl(fullPath);
            const body = {
                message: commitMessage || `Upload ${fileName}`,
                content: base64Content,
                branch: this.config.branch
            };

            // 检查文件是否已存在，如果存在需要提供 sha
            const existing = await this.getInfo(fileName, subfolder);
            if (existing.success) {
                body.sha = existing.data.sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: this._getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(body)
            });

            const result = await this._handleResponse(response);
            this._clearCache(subfolder);

            console.log('✅ 文本写入成功:', result);
            return {
                success: true,
                data: result,
                downloadUrl: result.content?.download_url
            };
        } catch (error) {
            console.error('❌ 文本写入失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 上传 JSON 数据
     * @param {string} fileName - 文件名 (建议 .json)
     * @param {Object|Array} jsonData - 要写入的 JSON 数据
     * @param {string} [subfolder=''] - 目标子文件夹
     * @param {string} [commitMessage] - 提交信息
     * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
     */
    async uploadJSON(fileName, jsonData, subfolder = '', commitMessage = '') {
        try {
            const jsonString = JSON.stringify(jsonData, null, 2);
            return this.uploadText(fileName, jsonString, subfolder, commitMessage || `Update ${fileName}`);
        } catch (error) {
            console.error('❌ JSON 写入失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取文件信息（不包含内容）
     * @param {string} fileName - 文件名
     * @param {string} [subfolder=''] - 子文件夹
     * @returns {Promise<{success: boolean, data?: Object, downloadUrl?: string, sha?: string, error?: string}>}
     */
    async getInfo(fileName, subfolder = '') {
        try {
            const cacheKey = `${subfolder}/${fileName}`;
            if (this._cache.has(cacheKey)) {
                const cached = this._cache.get(cacheKey);
                // 缓存有效期为 5 秒
                if (Date.now() - cached.timestamp < 5000) {
                    console.log('📦 使用缓存:', cacheKey);
                    return cached.data;
                }
            }

            const result = await this.repoHub.get({
                name: fileName,
                path: subfolder || undefined
            });

            const response = {
                success: true,
                data: result,
                downloadUrl: result.download_url,
                sha: result.sha,
                name: result.name,
                path: result.path,
                size: result.size
            };

            // 存入缓存
            this._cache.set(cacheKey, { data: response, timestamp: Date.now() });

            console.log('✅ 获取文件信息成功:', result);
            return response;
        } catch (error) {
            // 404 错误返回成功 false 但不抛出异常
            if (error.message?.includes('404')) {
                return { success: false, error: '文件不存在' };
            }
            console.error('❌ 获取文件信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 读取文件内容（返回文本）
     * @param {string} fileName - 文件名
     * @param {string} [subfolder=''] - 子文件夹
     * @returns {Promise<{success: boolean, content?: string, data?: Object, error?: string}>}
     */
    async readText(fileName, subfolder = '') {
        try {
            const info = await this.getInfo(fileName, subfolder);
            if (!info.success) {
                return info;
            }

            const response = await fetch(info.downloadUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const content = await response.text();

            console.log('✅ 读取文本成功:', fileName);
            return {
                success: true,
                content: content,
                data: info.data
            };
        } catch (error) {
            console.error('❌ 读取文本失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 读取文件内容（返回 JSON 对象）
     * @param {string} fileName - 文件名
     * @param {string} [subfolder=''] - 子文件夹
     * @returns {Promise<{success: boolean, data?: Object|Array, error?: string}>}
     */
    async readJSON(fileName, subfolder = '') {
        const result = await this.readText(fileName, subfolder);
        if (!result.success) {
            return result;
        }
        try {
            const json = JSON.parse(result.content);
            return { success: true, data: json };
        } catch (error) {
            return { success: false, error: 'JSON 解析失败: ' + error.message };
        }
    }

    /**
     * 删除文件
     * @param {string} fileName - 文件名
     * @param {string} [subfolder=''] - 子文件夹
     * @param {string} [commitMessage] - 提交信息
     * @returns {Promise<{success: boolean, message?: string, error?: string}>}
     */
    async delete(fileName, subfolder = '', commitMessage = '') {
        try {
            // 先获取文件信息（需要 sha）
            const info = await this.getInfo(fileName, subfolder);
            if (!info.success) {
                return { success: false, error: '文件不存在: ' + fileName };
            }

            const result = await this.repoHub.delete({
                name: fileName,
                path: subfolder || undefined,
                sha: info.sha
            });

            // 清除缓存
            this._clearCache(`${subfolder}/${fileName}`);

            console.log('✅ 删除成功:', result);
            return { success: true, message: `文件 ${fileName} 已删除` };
        } catch (error) {
            console.error('❌ 删除失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 修改文件（覆盖写入）
     * @param {string} fileName - 要修改的文件名
     * @param {File|string} content - 新内容（File 对象或文本字符串）
     * @param {string} [subfolder=''] - 子文件夹
     * @param {string} [commitMessage] - 提交信息
     * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
     */
    async update(fileName, content, subfolder = '', commitMessage = '') {
        try {
            // 如果 content 是 File 对象，转为 Base64
            let base64Content;
            if (content instanceof File) {
                base64Content = await this._fileToBase64(content);
            } else {
                // 文本内容转 Base64
                base64Content = btoa(unescape(encodeURIComponent(content)));
            }

            // 获取旧文件信息（需要 sha）
            const info = await this.getInfo(fileName, subfolder);
            if (!info.success) {
                // 文件不存在，执行新增
                if (content instanceof File) {
                    return this.upload(content, subfolder, fileName);
                } else {
                    return this.uploadText(fileName, content, subfolder, commitMessage);
                }
            }

            // 构建完整路径
            const fullPath = subfolder ? `${subfolder}/${fileName}` : fileName;
            const url = this._buildApiUrl(fullPath);

            const body = {
                message: commitMessage || `Update ${fileName}`,
                content: base64Content,
                sha: info.sha,
                branch: this.config.branch
            };

            const response = await fetch(url, {
                method: 'PUT',
                headers: this._getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(body)
            });

            const result = await this._handleResponse(response);
            this._clearCache(`${subfolder}/${fileName}`);

            console.log('✅ 文件更新成功:', result);
            return {
                success: true,
                data: result,
                downloadUrl: result.content?.download_url
            };
        } catch (error) {
            console.error('❌ 文件更新失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 列出目录下的所有文件
     * @param {string} [subfolder=''] - 子文件夹，空字符串表示根目录
     * @returns {Promise<{success: boolean, files?: Array, error?: string}>}
     */
    async list(subfolder = '') {
        try {
            const url = this._buildApiUrl(subfolder);
            const response = await fetch(url, {
                headers: this._getHeaders()
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return { success: true, files: [] }; // 目录不存在视为空
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const files = data.map(item => ({
                name: item.name,
                path: item.path,
                sha: item.sha,
                size: item.size,
                downloadUrl: item.download_url,
                type: item.type, // 'file' 或 'dir'
                htmlUrl: item.html_url
            }));

            console.log('✅ 列出文件成功:', files.length, '个文件');
            return { success: true, files };
        } catch (error) {
            console.error('❌ 列出文件失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 检查文件是否存在
     * @param {string} fileName - 文件名
     * @param {string} [subfolder=''] - 子文件夹
     * @returns {Promise<boolean>}
     */
    async exists(fileName, subfolder = '') {
        const result = await this.getInfo(fileName, subfolder);
        return result.success;
    }

    /**
     * 清除所有缓存
     */
    clearCache() {
        this._cache.clear();
        console.log('🧹 缓存已清除');
    }

    /**
     * 获取当前配置
     */
    getConfig() {
        return {
            owner: this.config.owner,
            repo: this.config.repo,
            branch: this.config.branch
        };
    }
}

// ================================================================
//  导出
// ================================================================

// 默认导出
export default GitHubFileAPI;

// 命名导出（兼容两种使用方式）
export { GitHubFileAPI };
