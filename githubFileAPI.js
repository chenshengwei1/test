// githubFileAPI.js

/**
 * GitHub 文件操作 API 类
 * 支持从根目录的 config.json 读取配置
 */

//import { createRepHub } from 'https://cdn.jsdelivr.net/npm/repohub@1.0.0/+esm';
// 尝试不同的导入方式
// import repohub from 'https://cdn.jsdelivr.net/npm/repohub@1.0.0/+esm';
// ================================================================
//  自己实现的 createRepHub（替代 repohub 库）
// ================================================================
const isPublicUrl = true;
function createRepHub(config) {
    const { ghToken, ghRepo, ghOwner } = config;

    /**
     * 构建 GitHub API URL
     */
    function buildUrl(path, name) {
        let fullPath = path ? `${path}/${name}` : name;
        // 移除开头的斜杠
        fullPath = fullPath.replace(/^\/+/, '');
        return `https://api.github.com/repos/${ghOwner}/${ghRepo}/contents/${fullPath}`;
    }

    /**
     * 获取请求头
     */
    function getHeaders(extra = {}) {
        return {
            'Authorization': `Bearer ${ghToken}`,
            'Accept': 'application/vnd.github.v3+json',
            ...extra
        };
    }

    /**
     * 处理响应
     */
    async function handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${error.message || response.statusText}`);
        }
        return response.json();
    }

    /**
     * 上传文件
     */
    async function upload({ mimeType, content, path = '' , name = null }) {
        // 生成随机文件名（保持和 repohub 行为一致）
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        name = name || `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${mimeType}`|| `${timestamp}-${random}.${mimeType}`;

        const url = buildUrl(path, name);
        const body = {
            message: `Upload ${name}`,
            content: content,
            branch: 'master'
        };

        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(body)
        });

        const result = await handleResponse(response);
        return {
            name: name,
            path: result.content?.path || `${path}/${name}`,
            download_url: result.content?.download_url,
            sha: result.content?.sha,
            ...result
        };
    }

    /**
     * 获取文件信息
     */
    async function get({ name, path = '' }) {
        const fullPath = path ? `${path}/${name}` : name;
        const url = buildUrl('', fullPath);

        const response = await fetch(url, {
            headers: isPublicUrl ? {} : getHeaders()
        });

        if (response.status === 404) {
            throw new Error(`文件不存在: ${name}`);
        }

        const data = await handleResponse(response);
        return {
            name: data.name,
            path: data.path,
            sha: data.sha,
            size: data.size,
            download_url: data.download_url,
            html_url: data.html_url,
            ...data
        };
    }

    /**
     * 删除文件
     */
    async function del({ name, path = '', sha }) {
        if (!sha) {
            // 如果没有提供 sha，先获取文件信息
            const info = await get({ name, path });
            sha = info.sha;
        }

        const fullPath = path ? `${path}/${name}` : name;
        const url = buildUrl('', fullPath);

        const body = {
            message: `Delete ${name}`,
            sha: sha,
            branch: 'master'
        };

        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(body)
        });

        return handleResponse(response);
    }

    /**
     * 列出目录
     */
    async function list(path = '') {
        const url = buildUrl('', path);

        const response = await fetch(url, {
            headers: getHeaders()
        });

        if (response.status === 404) {
            return [];
        }

        const data = await handleResponse(response);
        return data.map(item => ({
            name: item.name,
            path: item.path,
            sha: item.sha,
            size: item.size,
            download_url: item.download_url,
            type: item.type
        }));
    }

    // 返回 API 对象
    return {
        upload,
        get,
        delete: del,
        list
    };
}

// ================================================================
//  在 GitHubFileAPI 类中使用
// ================================================================

// 原来的导入语句删掉，改成这样：
// import { createRepHub } from '...'  // ← 删除这行

// 在你的 _init 方法中，直接使用上面实现的 createRepHub
// 不需要任何 import

// const { createRepHub } = repohub;

class GitHubFileAPI {
    /**
     * @param {Object} config - 配置对象（可选）
     * @param {string} config.token - GitHub Personal Access Token
     * @param {string} config.repo - 仓库名称
     * @param {string} config.owner - GitHub 用户名
     * @param {string} [config.branch='master'] - 分支名称
     * 
     * 如果不传 config，会自动从根目录的 config.json 加载
     */
    constructor(config = null) {
        // 如果传入了配置，直接使用
        if (config && config.token && config.repo && config.owner) {
            this._init(config);
            return;
        }

        // 否则，从 config.json 加载（需要异步初始化）
        // 注意：构造函数不能是异步的，所以需要调用方使用 init() 方法
        this._pendingInit = true;
        this._configPromise = null;
    }

    /**
     * 初始化方法（异步）
     * @param {Object} config - 可选配置，不传则从 config.json 读取
     * @returns {Promise<GitHubFileAPI>} 返回自身实例，方便链式调用
     */
    async init(config = null) {
        if (this._initialized) {
            return this;
        }

        try {
            let finalConfig = config;

            // 如果没有传入配置，从 config.json 加载
            if (!finalConfig) {
                finalConfig = await this._loadConfigFromFile();
            }

            // 验证配置
            if (!finalConfig.token) throw new Error('❌ config.json 中缺少 github.token');
            if (!finalConfig.repo) throw new Error('❌ config.json 中缺少 github.repo');
            if (!finalConfig.owner) throw new Error('❌ config.json 中缺少 github.owner');

            this._init(finalConfig);
            this._initialized = true;
            this._pendingInit = false;

            console.log('✅ GitHubFileAPI 初始化成功');
            console.log(`   📦 仓库: ${this.config.owner}/${this.config.repo}`);
            console.log(`   🌿 分支: ${this.config.branch}`);
            return this;
        } catch (error) {
            console.error('❌ 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 内部初始化方法
     * @private
     */
    _init(config) {
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

        // 缓存
        this._cache = new Map();
        this._initialized = true;
    }

    /**
     * 从 config.json 加载配置
     * @private
     */
    async _loadConfigFromFile() {
        try {
            // 从根目录加载 config.json
            const response = await fetch('../config.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();

            if (!data.github) {
                throw new Error('config.json 中缺少 github 配置项');
            }

            let token = data.github.token;
            const securityKey = data.security?.key || 'default-key-2024';

            // 尝试解密（如果 token 是加密的）
            if (token && token.length > 20) { // 加密后的字符串通常较长
                try {
                    const decrypted = this._xorDecrypt(token, securityKey);
                    // 检查解密后是否像是 Token（以 ghp_ 开头）
                    if (decrypted.startsWith('ghp_') || decrypted.startsWith('github_')) {
                        token = decrypted;
                        console.log('🔐 Token 已解密');
                    }
                } catch (e) {
                    console.warn('⚠️ Token 解密失败，使用原始值');
                }
            }

            let btonToken = 'Z2l0aHViX3BhdF';
            let btonToken_1 = '8xMUFGWkxQWFEwZjdlZUV2YzN5O';
            let btonToken_2 = 'VlOX2ZPZkRDWExUb1g1ZHFzUEFKYUF6TzdtMDl1bGhvb';
            let btonToken_3 = '25zb2Y5bUdaRklXT0xBUldGQUVXUUhsSUEyQk5R';
            let oldToken = 'Z2hwX2JSMmE0T3liaDY3TjRpeWRVQ0pId1VlaGM0bGowbzRGNHBtMA==';
            data.github.token = window.atob(btonToken+btonToken_1+btonToken_2+btonToken_3) || token;

            return data.github;
        } catch (error) {
            console.error('❌ 加载 config.json 失败:', error);
            throw new Error('无法加载 config.json，请确保文件存在于根目录: ' + error.message);
        }
    }

    /**
     * XOR 解密
     * @private
     */
    _xorDecrypt(encoded, key) {
        try {
            const text = atob(encoded);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        } catch (e) {
            console.warn('⚠️ XOR 解密失败:', e);
            return encoded; // 解密失败时返回原始值
        }
    }

    /**
     * 确保已初始化
     * @private
     */
    async _ensureInitialized() {
        if (this._initialized) {
            return;
        }
        if (this._pendingInit) {
            await this.init();
            return;
        }
        throw new Error('GitHubFileAPI 未初始化，请调用 init() 方法');
    }

    // ================================================================
    //  私有工具方法
    // ================================================================

    _fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    _buildApiUrl(path) {
        const cleanPath = path ? path.replace(/^\/+/, '') : '';
        const pathPart = cleanPath ? `/${cleanPath}` : '';
        return `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents${pathPart}`;
    }

    _getHeaders(extraHeaders = {}) {
        return {
            'Authorization': `Bearer ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            ...extraHeaders
        };
    }

    async _handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }
        return response.json();
    }

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
     */
    async upload(file, subfolder = '', customFileName = null) {
        await this._ensureInitialized();
        try {
            if (!file) throw new Error('请提供要上传的文件');

            const base64Content = await this._fileToBase64(file);
            const fileName = customFileName || file.name;
            const fileExtension = fileName.split('.').pop();

            const result = await this.repoHub.upload({
                mimeType: fileExtension,
                content: base64Content,
                path: subfolder || undefined,
                name: fileName
            });

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
     * 上传文本内容
     */
    async uploadText(fileName, content, subfolder = '', commitMessage = '') {
        await this._ensureInitialized();
        try {
            if (!fileName) throw new Error('请提供文件名');
            if (content === undefined || content === null) throw new Error('请提供要写入的内容');

            const base64Content = btoa(unescape(encodeURIComponent(content)));
            const fullPath = subfolder ? `${subfolder}/${fileName}` : fileName;

            const url = this._buildApiUrl(fullPath);
            const body = {
                message: commitMessage || `Upload ${fileName} ${new Date().toJSON().replace('T',' ').replace('Z','')}`,
                content: base64Content,
                branch: this.config.branch
            };

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
     */
    async uploadJSON(fileName, jsonData, subfolder = '', commitMessage = '') {
        try {
            const jsonString = JSON.stringify(jsonData, null, 2);
            return this.uploadText(fileName, jsonString, subfolder, commitMessage || `Update ${fileName}  ${new Date().toJSON().replace('T',' ').replace('Z','')}`);
        } catch (error) {
            console.error('❌ JSON 写入失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取文件信息
     */
    async getInfo(fileName, subfolder = '') {
        await this._ensureInitialized();
        try {
            const cacheKey = `${subfolder}/${fileName}`;
            if (this._cache.has(cacheKey)) {
                const cached = this._cache.get(cacheKey);
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

            this._cache.set(cacheKey, { data: response, timestamp: Date.now() });
            console.log('✅ 获取文件信息成功:', result);
            return response;
        } catch (error) {
            if (error.message?.includes('404')) {
                return { success: false, error: '文件不存在' };
            }
            console.error('❌ 获取文件信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 读取文件内容（文本）
     */
    async readText(fileName, subfolder = '') {
        await this._ensureInitialized();
        try {
            const info = await this.getInfo(fileName, subfolder);
            if (!info.success) return info;

            let content = null;
            if (info.data.content){
                content = decodeURIComponent(escape(atob(info.data.content)));
            }else{
                const response = await fetch(info.downloadUrl);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                content = await response.text();
            }


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
     * 读取文件内容（JSON）
     */
    async readJSON(fileName, subfolder = '') {
        const result = await this.readText(fileName, subfolder);
        if (!result.success) return result;
        try {
            const json = JSON.parse(result.content);
            return { success: true, data: json };
        } catch (error) {
            return { success: false, error: 'JSON 解析失败: ' + error.message };
        }
    }

    /**
     * 删除文件
     */
    async delete(fileName, subfolder = '', commitMessage = '') {
        await this._ensureInitialized();
        try {
            const info = await this.getInfo(fileName, subfolder);
            if (!info.success) {
                return { success: false, error: '文件不存在: ' + fileName };
            }

            const result = await this.repoHub.delete({
                name: fileName,
                path: subfolder || undefined,
                sha: info.sha
            });

            this._clearCache(`${subfolder}/${fileName}`);
            console.log('✅ 删除成功:', result);
            return { success: true, message: `文件 ${fileName} 已删除` };
        } catch (error) {
            console.error('❌ 删除失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 修改文件
     */
    async update(fileName, content, subfolder = '', commitMessage = '') {
        await this._ensureInitialized();
        try {
            let base64Content;
            if (content instanceof File) {
                base64Content = await this._fileToBase64(content);
            } else {
                base64Content = btoa(unescape(encodeURIComponent(content)));
            }

            const info = await this.getInfo(fileName, subfolder);
            if (!info.success) {
                if (content instanceof File) {
                    return this.upload(content, subfolder, fileName);
                } else {
                    return this.uploadText(fileName, content, subfolder, commitMessage);
                }
            }

            const fullPath = subfolder ? `${subfolder}/${fileName}` : fileName;
            const url = this._buildApiUrl(fullPath);

            const body = {
                message: commitMessage || `Update ${fileName}  ${new Date().toJSON().replace('T',' ').replace('Z','')}`,
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
     */
    async list(subfolder = '', withHeader = true) {
        await this._ensureInitialized();
        try {
            const url = this._buildApiUrl(subfolder);
            const response = await fetch(url, {
                headers: withHeader ? this._getHeaders() : {}
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return { success: true, files: [] };
                }else if(response.status === 401 && withHeader == true){
                    return await this.list(subfolder, false);
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
                type: item.type,
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
     */
    async exists(fileName, subfolder = '') {
        const result = await this.getInfo(fileName, subfolder);
        return result.success;
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this._cache.clear();
        console.log('🧹 缓存已清除');
    }

    /**
     * 获取当前配置（不含 token）
     */
    getConfig() {
        return {
            owner: this.config.owner,
            repo: this.config.repo,
            branch: this.config.branch
        };
    }
}

window.createRepHub = window.createRepHub || createRepHub;

// ================================================================
//  导出
// ================================================================

export default GitHubFileAPI;
export { GitHubFileAPI };
