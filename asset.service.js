// asset.service.js - 前端版本（带调试日志）
//import axios from 'axios';
import GitHubFileAPI from './githubFileAPI.js';

// ============================================
// 日志工具类
// ============================================
class Logger {
    constructor(module) {
        this.module = module;
        this.enabled = true;
        this.logLevel = 'debug'; // debug, info, warn, error
    }

    _format(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.module}] [${level.toUpperCase()}]`;
        if (data !== undefined) {
            return `${prefix} ${message}`;
        }
        return `${prefix} ${message}`;
    }

    debug(message, data) {
        if (!this.enabled || !['debug', 'info', 'warn', 'error'].includes(this.logLevel)) return;
        if (data !== undefined) {
            console.debug(this._format('debug', message), data);
        } else {
            console.debug(this._format('debug', message));
        }
    }

    info(message, data) {
        if (!this.enabled || !['info', 'warn', 'error'].includes(this.logLevel)) return;
        if (data !== undefined) {
            console.info(this._format('info', message), data);
        } else {
            console.info(this._format('info', message));
        }
    }

    warn(message, data) {
        if (!this.enabled || !['warn', 'error'].includes(this.logLevel)) return;
        if (data !== undefined) {
            console.warn(this._format('warn', message), data);
        } else {
            console.warn(this._format('warn', message));
        }
    }

    error(message, error) {
        if (!this.enabled) return;
        if (error) {
            console.error(this._format('error', message), error);
        } else {
            console.error(this._format('error', message));
        }
    }

    group(name, fn) {
        if (!this.enabled) return fn();
        console.group(`[${this.module}] ${name}`);
        try {
            fn();
        } finally {
            console.groupEnd();
        }
    }

    time(label, fn) {
        if (!this.enabled) return fn();
        console.time(`[${this.module}] ${label}`);
        try {
            return fn();
        } finally {
            console.timeEnd(`[${this.module}] ${label}`);
        }
    }

    async timeAsync(label, fn) {
        if (!this.enabled) return await fn();
        console.time(`[${this.module}] ${label}`);
        try {
            return await fn();
        } finally {
            console.timeEnd(`[${this.module}] ${label}`);
        }
    }
}

// axios mock 实现（基于 fetch）
const axios = typeof window.axios !== 'undefined'? window.axios : {
    async post(url, data, config = {}) {
        console.debug(`[Axios] POST ${url}`, { data, config });
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(config.headers || {})
            },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        console.debug(`[Axios] POST ${url} response`, { status: response.status, data: responseData });
        return { data: responseData, status: response.status };
    },

    async get(url, config = {}) {
        console.debug(`[Axios] GET ${url}`, { config });
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(config.headers || {})
            }
        });
        
        // 如果 config.responseType === 'stream'，返回 blob
        if (config && config.responseType === 'stream') {
            const blob = await response.blob();
            console.debug(`[Axios] GET ${url} response (blob)`, { status: response.status, size: blob.size });
            return { data: blob, status: response.status };
        }
        
        const responseData = await response.json();
        console.debug(`[Axios] GET ${url} response`, { status: response.status, data: responseData });
        return { data: responseData, status: response.status };
    },

    isAxiosError(error) {
        return error && error.name === 'HttpError';
    }
};

// ============================================
// 配置
// ============================================
const AGENT_AI_API_KEY = 'sk-O67f4WkZb73tEcsrO9Pir3I7hE1qkhrpPoRrlqiFa7Ka8CR7';
const AGNES_API_IMG_URL = 'https://apihub.agnes-ai.com/v1/images/generations';
const AGNES_API_IMG_MODEL = 'agnes-image-2.1-flash';
const AGNES_API_URL = 'https://apihub.agnes-ai.com/v1/videos';
const AGNES_API_KEY = AGENT_AI_API_KEY;
const AGNES_MODEL = 'agnes-video-v2.0';

// 验证文件类型
const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/avif'
    ];

// ============================================
// UUID 生成（前端兼容版本）
// ============================================
function uuidv4() {
    // 使用 crypto.randomUUID() 如果可用，否则使用 fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // Fallback: 手动生成 UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============================================
// AssetService 类 - 前端资产管理服务
// ============================================
class AssetService {
    /**
     * @param {Object} fsUtils - FSUtils 实例（需要外部注入）
     */
    constructor(fsUtils) {
        this.logger = new Logger('AssetService');
        this.logger.info('AssetService 初始化开始');
        
        if (!fsUtils) {
            this.logger.debug('fsUtils 未提供，使用默认 GitHubFileAPI');
            fsUtils = new GitHubFileAPI();
            fsUtils.init();
        }
        this.fsUtils = fsUtils;
        
        // 文件路径常量（对应后端的目录结构）
        this.PATHS = {
            IMAGES_DIR: 'asset/images',
            THUMBNAILS_DIR: 'asset/thumbnails',
            DATA_DIR: 'asset/data',
            VIDEOS_DIR: 'asset/videos',
            ASSETS_JSON: 'asset/data/assets.json',
            CANVAS_JSON: 'asset/data/canvas.json',
            TASK_IDS_JSON: 'asset/data/task_ids.json'
        };
        this.logger.debug('路径配置已加载', this.PATHS);

        // 初始化锁
        this._initialized = false;
        this._initPromise = null;
        this._assetDataCache = null;
        this.logger.info('AssetService 初始化完成');
    }

    // ============================================
    // 初始化
    // ============================================
    async init() {
        this.logger.info('init() 被调用');
        if (this._initialized) {
            this.logger.debug('init() 已初始化，跳过');
            return;
        }
        if (this._initPromise) {
            this.logger.debug('init() 已有进行中的初始化，等待完成');
            return this._initPromise;
        }

        this._initPromise = this._doInit();
        await this._initPromise;
        this._initialized = true;
        this.logger.info('init() 完成');
    }

    async _doInit() {
        this.logger.info('_doInit() 开始执行');
        await this.logger.timeAsync('_doInit', async () => {
            // 检查并初始化数据文件
            const assetsExists = await this.fsUtils.exists(this.PATHS.ASSETS_JSON);
            this.logger.debug(`assets.json 存在: ${assetsExists}`);
            if (!assetsExists) {
                this.logger.info('assets.json 不存在，创建默认文件');
                await this.fsUtils.uploadJSON(
                    this.PATHS.ASSETS_JSON,
                    { assets: [], nextId: 1001 }
                );
                this.logger.debug('assets.json 创建成功');
            }

            const taskIdsExists = await this.fsUtils.exists(this.PATHS.TASK_IDS_JSON);
            this.logger.debug(`task_ids.json 存在: ${taskIdsExists}`);
            if (!taskIdsExists) {
                this.logger.info('task_ids.json 不存在，创建默认文件');
                await this.fsUtils.uploadJSON(
                    this.PATHS.TASK_IDS_JSON,
                    { taskIds: [] }
                );
                this.logger.debug('task_ids.json 创建成功');
            }

            const canvasExists = await this.fsUtils.exists(this.PATHS.CANVAS_JSON);
            this.logger.debug(`canvas.json 存在: ${canvasExists}`);
            if (!canvasExists) {
                this.logger.info('canvas.json 不存在，创建默认文件');
                await this.fsUtils.uploadJSON(
                    this.PATHS.CANVAS_JSON,
                    []
                );
                this.logger.debug('canvas.json 创建成功');
            }

            // 加载默认资产（如果资产列表为空）
            await this._loadDefaultAssets();
        });
        this.logger.info('_doInit() 完成');
    }

    // ============================================
    // 数据读写辅助方法
    // ============================================
    async _getAssetsData() {
        if (this._assetDataCache){
            this.logger.debug('_getAssetsData 从缓存返回数据');
            return this._assetDataCache;
        }
        this.logger.debug('_getAssetsData 从文件读取数据');
        const result = await this.fsUtils.readJSON(this.PATHS.ASSETS_JSON);
        if (!result.success) {
            this.logger.warn('_getAssetsData 读取失败，返回默认结构', { error: result.error });
            return { assets: [], nextId: 1001 };
        }

        this._assetDataCache = result.data;
        this.logger.debug(`_getAssetsData 成功读取，资产数量: ${result.data.assets?.length || 0}`);
        return result.data;
    }

    async _saveAssetsData(data) {
        this.logger.debug(`_saveAssetsData 开始保存，资产数量: ${data.assets?.length || 0}`);
        this._assetDataCache = data;
        await this.fsUtils.update(this.PATHS.ASSETS_JSON, JSON.stringify(data, null, '\t'));
        this.logger.debug('_saveAssetsData 保存完成');
    }

    async _getCanvasData() {
        this.logger.debug('_getCanvasData 读取画布数据');
        const result = await this.fsUtils.readJSON(this.PATHS.CANVAS_JSON);
        if (!result.success) {
            this.logger.warn('_getCanvasData 读取失败，返回空数组', { error: result.error });
            return [];
        }
        this.logger.debug(`_getCanvasData 成功读取，画布数量: ${result.data?.length || 0}`);
        return result.data;
    }

    async _saveCanvasData(data) {
        this.logger.debug(`_saveCanvasData 保存画布数据，数量: ${data?.length || 0}`);
        await this.fsUtils.update(this.PATHS.CANVAS_JSON, JSON.stringify(data));
        this.logger.debug('_saveCanvasData 保存完成');
    }

    async _getTaskIds() {
        this.logger.debug('_getTaskIds 读取任务ID列表');
        const result = await this.fsUtils.readJSON(this.PATHS.TASK_IDS_JSON);
        if (!result.success) {
            this.logger.warn('_getTaskIds 读取失败，返回空列表', { error: result.error });
            return { taskIds: [] };
        }
        this.logger.debug(`_getTaskIds 成功读取，任务数量: ${result.data.taskIds?.length || 0}`);
        return result.data;
    }

    async _saveTaskIds(data) {
        this.logger.debug(`_saveTaskIds 保存任务ID列表，数量: ${data.taskIds?.length || 0}`);
        await this.fsUtils.update(this.PATHS.TASK_IDS_JSON, JSON.stringify(data));
        this.logger.debug('_saveTaskIds 保存完成');
    }

    async _findAssetById(id) {
        this.logger.debug(`_findAssetById 查找资产 ID: ${id}`);
        const data = await this._getAssetsData();
        const asset = data.assets.find(a => a.id == id) || null;
        if (asset) {
            this.logger.debug(`_findAssetById 找到资产: ${asset.title}`);
        } else {
            this.logger.warn(`_findAssetById 未找到资产 ID: ${id}`);
        }
        return asset;
    }

    _generateAssetId() {
        this.logger.debug('_generateAssetId 生成新ID');
        //const data = await this._getAssetsData();
        const id = data.nextId;
        data.nextId = uuidv4();
        //await this._saveAssetsData(data);
        this.logger.debug(`_generateAssetId 生成ID: ${id}`);
        return id;
    }

    async _loadDefaultAssets() {
        this.logger.info('_loadDefaultAssets 开始加载默认资产');
        const data = await this._getAssetsData();
        if (data.assets && data.assets.length > 0) {
            this.logger.debug(`_loadDefaultAssets 已有 ${data.assets.length} 个资产，跳过加载`);
            return;
        }

        this.logger.info('_loadDefaultAssets 资产列表为空，尝试从 images 目录加载');
        // 列出 images 目录下的文件
        const listResult = await this.fsUtils.list(this.PATHS.IMAGES_DIR);
        if (!listResult.success) {
            this.logger.warn('_loadDefaultAssets 列出 images 目录失败', { error: listResult.error });
            return;
        }

        const files = listResult.files || [];
        this.logger.debug(`_loadDefaultAssets 在 images 目录找到 ${files.length} 个文件`);
        const defaultAssets = [];
        
        for (const file of files) {
            const name = typeof file === 'string' ? file : file.name || file.fileName;
            const ext = name.split('.').pop()?.toLowerCase();
            this.logger.debug(`_loadDefaultAssets 处理文件: ${name}, 扩展名: ${ext}`);
            let imageTypes = allowedTypes.map(e => e.replace('image/',''));
            if (imageTypes.includes(ext)) {
                this.logger.debug(`_loadDefaultAssets 文件 ${name} 是图片，获取信息`);
                //const infoResult = await this.fsUtils.getInfo(name, this.PATHS.IMAGES_DIR);
                defaultAssets.push({
                    id:  this._generateAssetId(),
                    title: name,
                    description: '',
                    cover_url: file.html_url || `images/${name}`,
                    thumbnail_url: file.html_url || `images/${name}`,
                    type: 'character',
                    source_type: 'upload',
                    created_at: new Date().toISOString(),
                    file_type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
                    file_size:  file.size || 0,
                    file_path: `images/${name}`,
                    owner_id: 1001,
                    visibility: 'public'
                });
                this.logger.debug(`_loadDefaultAssets 添加资产: ${name}`);
            }
        }

        if (defaultAssets.length > 0) {
            this.logger.info(`_loadDefaultAssets 添加 ${defaultAssets.length} 个默认资产`);
            data.assets = defaultAssets;
            await this._saveAssetsData(data);
        } else {
            this.logger.info('_loadDefaultAssets 未找到可加载的图片文件');
        }
    }

    // ============================================
    // 图片上传辅助方法
    // ============================================
    async _uploadFile(file, subfolder = this.PATHS.IMAGES_DIR) {
        this.logger.info(`_uploadFile 开始上传文件: ${file.name}, 大小: ${file.size}字节, 类型: ${file.type}, 目标目录: ${subfolder}`);

        
        
        if (!allowedTypes.includes(file.type)) {
            const error = `只支持图片文件 (JPEG, PNG, GIF, WebP),实际格式=${file.type}`;
            this.logger.error('_uploadFile 文件类型验证失败', { error, fileType: file.type });
            throw new Error(error);
        }

        // 验证文件大小 (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            const error = `文件大小不能超过10MB，当前大小: ${file.size}字节`;
            this.logger.error('_uploadFile 文件大小验证失败', { error, fileSize: file.size });
            throw new Error(error);
        }

        // 生成唯一文件名
        const ext = file.name.split('.').pop() || 'png';
        const uniqueName = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
        this.logger.debug(`_uploadFile 生成唯一文件名: ${uniqueName}`);

        // 上传文件
        this.logger.debug('_uploadFile 开始上传到 FSUtils');
        const result = await this.fsUtils.upload(file, subfolder);
        if (!result.success) {
            this.logger.error('_uploadFile 上传失败', { error: result.error });
            throw new Error('文件上传失败');
        }

        this.logger.info('_uploadFile 上传成功', { 
            filename: uniqueName, 
            downloadUrl: result.downloadUrl,
            size: file.size 
        });

        return {
            filename: uniqueName,
            downloadUrl: result.downloadUrl,
            size: file.size,
            mimeType: file.type
        };
    }

    // ============================================
    // 业务接口方法
    // ============================================

    // ---------- 用户信息 ----------
    async getUserProfile() {
        this.logger.debug('getUserProfile 被调用');
        return {
            code: 200,
            data: {
                id: 1001,
                username: 'user_001',
                avatar: '/assets/default-avatar.png',
                role: 'premium',
                expires_at: '2027-06-09'
            }
        };
    }

    // ---------- 最近活动 ----------
    async getRecentActivity() {
        this.logger.debug('getRecentActivity 被调用');
        const data = await this._getAssetsData();
        const recent = data.assets
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map(a => ({
                id: a.id,
                title: a.title,
                type: a.type,
                thumb_url: a.thumbnail_url || '/thumbnails/default-thumb.png',
                created_at: a.created_at
            }));

        this.logger.debug(`getRecentActivity 返回 ${recent.length} 条活动记录`);
        return {
            code: 200,
            data: recent
        };
    }

    // ---------- 资产列表 ----------
    async getAssets(query = {}) {
        const { type, keyword, tags, sort = 'time_desc', page = 1, pageSize = 200 } = query;
        this.logger.info('getAssets 被调用', { type, keyword, tags, sort, page, pageSize });
        
        const data = await this._getAssetsData();
        let assets = [...data.assets];
        this.logger.debug(`getAssets 总资产数: ${assets.length}`);

        // 类型筛选
        if (type && type !== 'all') {
            const beforeCount = assets.length;
            assets = assets.filter(a => a.type === type);
            this.logger.debug(`getAssets 类型筛选 (${type}): ${beforeCount} -> ${assets.length}`);
        }

        // 关键词搜索
        if (keyword) {
            const beforeCount = assets.length;
            const keywordLower = keyword.toLowerCase();
            assets = assets.filter(a => 
                a.title.toLowerCase().includes(keywordLower) || 
                (a.tags && a.tags.some(t => t.toLowerCase().includes(keywordLower)))
            );
            this.logger.debug(`getAssets 关键词筛选 ("${keyword}"): ${beforeCount} -> ${assets.length}`);
        }

        // 标签筛选
        if (tags && tags.length) {
            const beforeCount = assets.length;
            let tagArray = Array.isArray(tags) ? tags : tags.split(',');
            assets = assets.filter(a => {
                if (!a.tags || a.tags.length === 0) return false;
                return tagArray.every(t => a.tags.some(aTag => aTag === t));
            });
            this.logger.debug(`getAssets 标签筛选 (${tagArray.join(',')}): ${beforeCount} -> ${assets.length}`);
        }

        // 排序
        if (sort === 'time_desc') {
            assets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            this.logger.debug('getAssets 按时间降序排序');
        } else if (sort === 'time_asc') {
            assets.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            this.logger.debug('getAssets 按时间升序排序');
        } else if (sort === 'name') {
            assets.sort((a, b) => a.title.localeCompare(b.title));
            this.logger.debug('getAssets 按名称排序');
        }

        // 分页
        const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedAssets = assets.slice(startIndex, endIndex);
        this.logger.debug(`getAssets 分页: ${startIndex} - ${endIndex}, 返回 ${paginatedAssets.length} 条`);

        const formattedAssets = paginatedAssets.map(a => ({
            id: a.id,
            title: a.title,
            cover_url: a.cover_url || '/assets/default-cover.png',
            thumbnail_url: a.thumbnail_url || '/thumbnails/default-thumb.png',
            type: a.type,
            source_type: a.source_type || 'upload',
            created_at: a.created_at,
            file_type: a.file_type || 'image',
            tags: a.tags
        }));

        return {
            code: 200,
            data: {
                total: assets.length,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                list: formattedAssets
            }
        };
    }

    // ---------- 资产详情 ----------
    async getAssetById(id) {
        this.logger.info(`getAssetById 被调用, ID: ${id}`);
        const asset = await this._findAssetById(id);
        if (!asset) {
            this.logger.warn(`getAssetById 未找到资产 ID: ${id}`);
            return { code: 404, message: '资产不存在' };
        }

        this.logger.debug(`getAssetById 找到资产: ${asset.title}`);
        return {
            code: 200,
            data: {
                ...asset,
                reference_sheet: '/assets/default-sheet.jpg',
                main_image: asset.cover_url,
                visibility: asset.visibility || '所有人',
                source_display: asset.source_type === 'upload' ? '用户上传' : 'AI生成'
            }
        };
    }

    // ---------- 创建资产（上传） ----------
    async createAsset(formData) {
        this.logger.info('createAsset 被调用');
        const file = formData.get('file');
        const title = formData.get('title') || '未命名素材';
        const type = formData.get('type') || 'material';
        const sourceType = formData.get('source_type') || 'upload';
        const tags = formData.get('tags') || '';

        this.logger.debug('createAsset 参数', { title, type, sourceType, tags, hasFile: !!file });

        if (!file) {
            this.logger.warn('createAsset 缺少文件');
            return { code: 400, message: '请上传文件' };
        }

        try {
            const uploadResult = await this._uploadFile(file);
            
            const newAsset = {
                id: this._generateAssetId(),
                title: title,
                description: formData.get('description') || '',
                cover_url: uploadResult.downloadUrl,
                thumbnail_url: uploadResult.downloadUrl,
                type: type,
                source_type: sourceType,
                tags: typeof tags === 'string' ? tags.split(',').filter(Boolean) : tags,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                file_type: file.type,
                file_size: file.size,
                file_path: uploadResult.downloadUrl,
                owner_id: 1001,
                visibility: 'public'
            };

            this.logger.debug('createAsset 创建新资产对象', { id: newAsset.id, title: newAsset.title });

            const data = await this._getAssetsData();
            data.assets = data.assets ||[];
            data.assets.push(newAsset);
            await this._saveAssetsData(data);

            this.logger.info(`createAsset 成功创建资产 ID: ${newAsset.id}`);
            return {
                code: 200,
                data: newAsset,
                message: '资产创建成功'
            };
        } catch (error) {
            this.logger.error('createAsset 失败', error);
            return { code: 500, message: error.message };
        }
    }

    // ---------- 更新资产 ----------
    async updateAsset(id, updates) {
        this.logger.info(`updateAsset 被调用, ID: ${id}`, updates);
        const { title, description, tags, visibility } = updates;
        const data = await this._getAssetsData();
        const assetIndex = data.assets.findIndex(a => a.id == id);

        if (assetIndex === -1) {
            this.logger.warn(`updateAsset 未找到资产 ID: ${id}`);
            return { code: 404, message: '资产不存在' };
        }

        if (title) data.assets[assetIndex].title = title;
        if (description !== undefined) data.assets[assetIndex].description = description;
        if (tags) {
            data.assets[assetIndex].tags = typeof tags === 'string' 
                ? tags.split(',').filter(Boolean) 
                : tags;
        }
        if (visibility) data.assets[assetIndex].visibility = visibility;
        data.assets[assetIndex].updated_at = new Date().toISOString();

        await this._saveAssetsData(data);

        this.logger.info(`updateAsset 成功更新资产 ID: ${id}`);
        return {
            code: 200,
            data: data.assets[assetIndex],
            message: '更新成功'
        };
    }

    // ---------- 删除资产 ----------
    async deleteAsset(id) {
        this.logger.info(`deleteAsset 被调用, ID: ${id}`);
        const data = await this._getAssetsData();
        const assetIndex = data.assets.findIndex(a => a.id == id);

        if (assetIndex === -1) {
            this.logger.warn(`deleteAsset 未找到资产 ID: ${id}`);
            return { code: 404, message: '资产不存在' };
        }

        const asset = data.assets[assetIndex];
        this.logger.debug(`deleteAsset 找到资产: ${asset.title}, 路径: ${asset.file_path}`);
        
        // 尝试删除远程文件（非关键操作，失败不影响主流程）
        try {
            // 从 file_path 中提取文件名和子目录
            const filePath = asset.file_path || '';
            const parts = filePath.split('/');
            const fileName = parts.pop();
            const subfolder = parts.join('/') || this.PATHS.IMAGES_DIR;
            
            if (fileName) {
                this.logger.debug(`deleteAsset 尝试删除远程文件: ${fileName}, 目录: ${subfolder}`);
                await this.fsUtils.delete(fileName, subfolder);
                this.logger.debug('deleteAsset 远程文件删除成功');
            }
        } catch (e) {
            this.logger.warn('deleteAsset 删除远程文件失败', { error: e.message });
        }

        data.assets.splice(assetIndex, 1);
        await this._saveAssetsData(data);

        this.logger.info(`deleteAsset 成功删除资产 ID: ${id}`);
        return { code: 200, message: '删除成功' };
    }

    // ---------- 批量删除 ----------
    async batchDeleteAssets(ids) {
        this.logger.info(`batchDeleteAssets 被调用, 删除 ${ids?.length || 0} 个资产`, { ids });
        if (!ids || !Array.isArray(ids)) {
            this.logger.warn('batchDeleteAssets 无效的ID列表');
            return { code: 400, message: '请提供有效的ID列表' };
        }

        const data = await this._getAssetsData();
        const deletedIds = [];

        for (const id of ids) {
            const assetIndex = data.assets.findIndex(a => a.id == id);
            if (assetIndex !== -1) {
                const asset = data.assets[assetIndex];
                this.logger.debug(`batchDeleteAssets 删除资产 ID: ${id}, 标题: ${asset.title}`);
                try {
                    const filePath = asset.file_path || '';
                    const parts = filePath.split('/');
                    const fileName = parts.pop();
                    const subfolder = parts.join('/') || this.PATHS.IMAGES_DIR;
                    if (fileName) {
                        await this.fsUtils.delete(fileName, subfolder);
                        this.logger.debug(`batchDeleteAssets 远程文件删除成功: ${fileName}`);
                    }
                } catch (e) {
                    this.logger.warn(`batchDeleteAssets 删除远程文件失败 (ID: ${id})`, { error: e.message });
                }
                data.assets.splice(assetIndex, 1);
                deletedIds.push(id);
            } else {
                this.logger.warn(`batchDeleteAssets 未找到资产 ID: ${id}`);
            }
        }

        await this._saveAssetsData(data);

        this.logger.info(`batchDeleteAssets 成功删除 ${deletedIds.length} 个资产`);
        return {
            code: 200,
            data: { deleted: deletedIds },
            message: `成功删除 ${deletedIds.length} 个资产`
        };
    }

    // ---------- 使用资产 ----------
    async useAsset(id) {
        this.logger.info(`useAsset 被调用, ID: ${id}`);
        const asset = await this._findAssetById(id);
        if (!asset) {
            this.logger.warn(`useAsset 未找到资产 ID: ${id}`);
            return { code: 404, message: '资产不存在' };
        }

        this.logger.debug(`useAsset 使用资产: ${asset.title}`);
        return {
            code: 200,
            message: `资产 "${asset.title}" 已使用`,
            data: { used_at: new Date().toISOString() }
        };
    }

    // ---------- 标签 ----------
    async getTags() {
        this.logger.debug('getTags 被调用');
        const data = await this._getAssetsData();
        const tagMap = new Map();

        data.assets.forEach(asset => {
            if (asset.tags) {
                asset.tags.forEach(tag => {
                    tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
                });
            }
        });

        const tags = Array.from(tagMap.entries()).map(([name, count]) => ({
            name,
            count
        }));

        this.logger.debug(`getTags 返回 ${tags.length} 个标签`);
        return { code: 200, data: tags };
    }

    // ---------- 批量设置标签 ----------
    async batchSetTags(assetIds, tags) {
        this.logger.info(`batchSetTags 被调用, ${assetIds?.length || 0} 个资产, ${tags?.length || 0} 个标签`, { assetIds, tags });
        if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
            this.logger.warn('batchSetTags 无效的资产ID列表');
            return { code: 400, message: '请提供资产ID列表' };
        }
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            this.logger.warn('batchSetTags 无效的标签列表');
            return { code: 400, message: '请提供标签列表' };
        }

        const data = await this._getAssetsData();
        let updatedCount = 0;
        for (const id of assetIds) {
            const asset = data.assets.find(a => a.id == id);
            if (asset) {
                asset.tags = asset.tags || [];
                asset.tags.push(...tags);
                asset.tags = [...new Set(asset.tags)]; // 去重
                updatedCount++;
                this.logger.debug(`batchSetTags 更新资产 ID: ${id}, 标签: ${asset.tags.join(',')}`);
            }
        }

        await this._saveAssetsData(data);

        this.logger.info(`batchSetTags 成功更新 ${updatedCount} 个资产的标签`);
        return {
            code: 200,
            message: `成功更新 ${assetIds.length} 个资产的标签`
        };
    }

    // ---------- 批量更新分类 ----------
    async batchUpdateAssets(ids, operation, value) {
        this.logger.info(`batchUpdateAssets 被调用, ${ids?.length || 0} 个资产, 操作: ${operation}, 值: ${value}`, { ids, operation, value });
        if (!ids || !Array.isArray(ids) || !operation) {
            this.logger.warn('batchUpdateAssets 无效的参数');
            return { code: 400, message: '请提供有效的参数' };
        }

        const data = await this._getAssetsData();
        const updatedIds = [];

        ids.forEach(id => {
            const asset = data.assets.find(a => a.id == id);
            if (asset) {
                if (operation === 'add_tag' && value) {
                    asset.tags = asset.tags || [];
                    if (!asset.tags.includes(value)) {
                        asset.tags.push(value);
                        this.logger.debug(`batchUpdateAssets 添加标签到资产 ${id}: ${value}`);
                    }
                    updatedIds.push(id);
                } else if (operation === 'remove_tag' && value) {
                    if (asset.tags) {
                        asset.tags = asset.tags.filter(t => t !== value);
                        this.logger.debug(`batchUpdateAssets 从资产 ${id} 移除标签: ${value}`);
                    }
                    updatedIds.push(id);
                } else if (operation === 'change_type' && value) {
                    asset.type = value;
                    this.logger.debug(`batchUpdateAssets 修改资产 ${id} 类型为: ${value}`);
                    updatedIds.push(id);
                }
                asset.updated_at = new Date().toISOString();
            }
        });

        await this._saveAssetsData(data);

        this.logger.info(`batchUpdateAssets 成功更新 ${updatedIds.length} 个资产`);
        return {
            code: 200,
            data: { updated: updatedIds },
            message: `成功更新 ${updatedIds.length} 个资产`
        };
    }

    // ---------- 画布操作 ----------
    async saveCanvas(canvasData) {
        this.logger.info('saveCanvas 被调用', { canvasId: canvasData?.id });
        if (!canvasData || typeof canvasData !== 'object') {
            this.logger.warn('saveCanvas 无效的画布数据');
            return { code: 400, message: '无效的画布数据' };
        }

        if (!canvasData.id) {
            canvasData.id = 'c' + Date.now();
            this.logger.debug(`saveCanvas 生成新画布ID: ${canvasData.id}`);
        }

        const data = await this._getCanvasData();
        const existingIndex = data.findIndex(c => c.id === canvasData.id);

        if (existingIndex !== -1) {
            Object.assign(data[existingIndex], canvasData);
            this.logger.debug(`saveCanvas 更新现有画布: ${canvasData.id}`);
        } else {
            data.push(canvasData);
            this.logger.debug(`saveCanvas 添加新画布: ${canvasData.id}`);
        }

        await this._saveCanvasData(data);

        this.logger.info(`saveCanvas 保存画布成功: ${canvasData.id}`);
        return {
            code: 200,
            data: canvasData,
            message: '画布数据保存成功'
        };
    }

    async deleteCanvas(id) {
        this.logger.info(`deleteCanvas 被调用, ID: ${id}`);
        if (!id) {
            this.logger.warn('deleteCanvas 未提供ID');
            return { code: 400, message: '请提供画布ID' };
        }

        const data = await this._getCanvasData();
        const index = data.findIndex(c => c.id === id);

        if (index !== -1) {
            data.splice(index, 1);
            await this._saveCanvasData(data);
            this.logger.info(`deleteCanvas 成功删除画布: ${id}`);
            return { code: 200, message: '画布数据删除成功' };
        }

        this.logger.warn(`deleteCanvas 未找到画布: ${id}`);
        return { code: 404, message: '画布数据不存在' };
    }

    async getCanvasList() {
        this.logger.debug('getCanvasList 被调用');
        const data = await this._getCanvasData();
        this.logger.debug(`getCanvasList 返回 ${data?.length || 0} 个画布`);
        return { code: 200, data };
    }

    // ---------- 文件上传 ----------
    async uploadFile(file) {
        this.logger.info('uploadFile 被调用', { fileName: file?.name, fileSize: file?.size });
        try {
            const result = await this._uploadFile(file);
            this.logger.info('uploadFile 上传成功', { filename: result.filename });
            return {
                code: 200,
                data: {
                    file_id: uuidv4(),
                    filename: result.filename,
                    url: result.downloadUrl,
                    size: result.size,
                    mime_type: result.mimeType
                },
                message: '上传成功'
            };
        } catch (error) {
            this.logger.error('uploadFile 上传失败', error);
            return { code: 500, message: '上传失败: ' + error.message };
        }
    }

    // ---------- AI 图片生成 ----------
    async generateCharacter(params) {
        this.logger.info('generateCharacter 被调用', params);
        const { prompt, style, reference_images } = params;
        if (!prompt) {
            this.logger.warn('generateCharacter 未提供提示词');
            return { code: 400, message: '请提供生成提示词' };
        }

        const taskId = uuidv4();
        this.logger.debug(`generateCharacter 生成任务ID: ${taskId}`);
        return {
            code: 200,
            data: {
                task_id: taskId,
                status: 'pending',
                estimated_seconds: 30,
                prompt: prompt,
                style: style || 'default'
            },
            message: '生成任务已提交'
        };
    }

    async getGenerateTaskStatus(taskId) {
        this.logger.debug(`getGenerateTaskStatus 被调用, taskId: ${taskId}`);
        // Mock: 返回随机进度
        const randomProgress = Math.floor(Math.random() * 100);
        const status = randomProgress < 100 ? 'processing' : 'completed';
        this.logger.debug(`getGenerateTaskStatus 模拟进度: ${randomProgress}%, 状态: ${status}`);
        
        let result = null;
        if (status === 'completed') {
            result = { image_url: '/assets/generated-sample.jpg' };
        }

        return {
            code: 200,
            data: {
                task_id: taskId,
                status,
                progress: randomProgress,
                result
            }
        };
    }

    async saveAIResult(params) {
        this.logger.info('saveAIResult 被调用', params);
        const { title, image_url, tags, description } = params;
        if (!image_url) {
            this.logger.warn('saveAIResult 未提供图片URL');
            return { code: 400, message: '请提供生成的图片URL' };
        }

        const newAsset = {
            id: this._generateAssetId(),
            title: title || 'AI生成素材',
            description: description || '',
            cover_url: image_url,
            thumbnail_url: image_url,
            type: 'material',
            source_type: 'ai',
            tags: tags ? (typeof tags === 'string' ? tags.split(',').filter(Boolean) : tags) : [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            file_type: 'image/webp',
            file_path: image_url,
            owner_id: 1001,
            visibility: 'public'
        };

        this.logger.debug('saveAIResult 创建资产对象', { id: newAsset.id });

        const data = await this._getAssetsData();
        data.assets.push(newAsset);
        await this._saveAssetsData(data);

        this.logger.info(`saveAIResult 成功保存AI生成结果, ID: ${newAsset.id}`);
        return {
            code: 200,
            data: newAsset,
            message: 'AI生成结果已保存到资产库'
        };
    }

    // ---------- AI 图片生成（调用真实 API） ----------
    async generateImage(prompt) {
        this.logger.info('generateImage 被调用', { prompt });
        if (!prompt) {
            this.logger.warn('generateImage 未提供提示词');
            return { code: 400, message: '请提供生成提示词' };
        }

        try {
            const requestData = {
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                model: AGNES_API_IMG_MODEL,
            };
            this.logger.debug('generateImage 调用 API', { url: AGNES_API_IMG_URL, model: AGNES_API_IMG_MODEL });

            const apiResponse = await axios.post(AGNES_API_IMG_URL, requestData, {
                headers: {
                    'Authorization': `Bearer ${AGENT_AI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = apiResponse.data;
            this.logger.debug('generateImage API 响应', { status: apiResponse.status, hasData: !!data });
            const imageData = data?.data?.[0];
            
            if (!imageData || !imageData.url) {
                const error = 'API 返回数据格式不正确';
                this.logger.error('generateImage API 响应格式错误', { data });
                throw new Error(error);
            }

            this.logger.debug('generateImage 获取图片URL', { url: imageData.url });

            // 生成唯一文件名
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const filename = `ai-generated-${timestamp}-${randomId}.png`;
            this.logger.debug(`generateImage 生成文件名: ${filename}`);

            // 下载图片并上传到 FSUtils
            this.logger.debug('generateImage 开始下载图片');
            const imageResponse = await axios.get(imageData.url, {
                responseType: 'blob'
            });
            
            const blob = imageResponse.data;
            this.logger.debug(`generateImage 图片下载完成，大小: ${blob.size}字节`);
            
            const file = new File([blob], filename, { type: 'image/png' });
            const uploadResult = await this.fsUtils.upload(file, this.PATHS.IMAGES_DIR);
            this.logger.debug('generateImage 图片上传成功', { downloadUrl: uploadResult.downloadUrl });

            const newAsset = {
                id: this._generateAssetId(),
                title: prompt.slice(0, 20) + (prompt.length > 20 ? '...' : ''),
                description: prompt,
                cover_url: uploadResult.downloadUrl,
                thumbnail_url: uploadResult.downloadUrl,
                type: 'material',
                source_type: 'ai',
                tags: ['ai-generated'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                file_type: 'image/png',
                file_path: uploadResult.downloadUrl,
                file_size: blob.size,
                owner_id: 1001,
                visibility: 'public',
                ai_prompt: prompt,
                ai_revised_prompt: imageData.revised_prompt || prompt
            };

            const assetsData = await this._getAssetsData();
            assetsData.assets.push(newAsset);
            await this._saveAssetsData(assetsData);

            this.logger.info(`generateImage 成功生成并保存图片, ID: ${newAsset.id}`);
            return {
                code: 200,
                data: { image_url: uploadResult.downloadUrl },
                message: '图片生成成功'
            };
        } catch (error) {
            this.logger.error('generateImage 失败', error);
            return { code: 500, message: '图片生成失败: ' + error.message };
        }
    }

    // ---------- AI 视频生成 ----------
    async generateVideo(params) {
        this.logger.info('generateVideo 被调用', { 
            hasPrompt: !!params.prompt, 
            hasImageUrl: !!params.image_url, 
            hasImageFile: !!params.image_file,
            duration: params.duration,
            resolution: params.resolution 
        });
        
        const { 
            prompt, 
            image_url, 
            image_file,  // File 对象
            duration = 5, 
            resolution = '1080p', 
            frame_rate = 24 
        } = params;

        try {
            if (!prompt && !image_url && !image_file) {
                this.logger.warn('generateVideo 未提供有效的输入（prompt/image_url/image_file）');
                return { 
                    code: 400, 
                    message: '请提供 prompt (文生视频) 或 image_url/image_file (图生视频)' 
                };
            }

            let requestData = {
                model: AGNES_MODEL,
                prompt: prompt || '',
                frame_rate: frame_rate,
                seed: 100,
                negative_prompt: '模糊，低分辨率，马赛克，失真，水印，文字，logo，签名'
            };
            this.logger.debug('generateVideo 构建请求数据', { model: AGNES_MODEL, frameRate: frame_rate });

            // 设置分辨率
            if (resolution === '720p') {
                requestData.width = 1280;
                requestData.height = 720;
            } else if (resolution === '1080p') {
                requestData.width = 1920;
                requestData.height = 1080;
            }
            this.logger.debug(`generateVideo 分辨率: ${resolution} (${requestData.width}x${requestData.height})`);

            requestData.num_frames = 169;

            // 处理图片输入
            if (image_file) {
                // TODO: 如果有图片文件，需要先上传到 Agnes
                // 目前使用 mock，假设返回 URL
                this.logger.warn('generateVideo image_file 使用 mock 上传');
                const mockUploadUrl = await this._uploadImageToAgnes(image_file);
                requestData.image_url = mockUploadUrl;
                this.logger.debug('generateVideo 使用 mock 图片URL', { url: mockUploadUrl });
            } else if (image_url) {
                requestData.image_url = image_url;
                this.logger.debug('generateVideo 使用图片URL', { url: image_url });
            }

            this.logger.debug('generateVideo 调用 Agnes API', { url: AGNES_API_URL });
            const response = await axios.post(AGNES_API_URL, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AGNES_API_KEY}`
                }
            });

            const apiResponse = response.data;
            this.logger.debug('generateVideo API 响应', { status: response.status, data: apiResponse });
            
            let videoUrl = apiResponse?.data?.[0]?.remixed_from_video_id || apiResponse?.url;
            let taskId = apiResponse?.data?.[0]?.id || apiResponse?.task_id;
            let videoId = apiResponse?.data?.[0]?.video_id || apiResponse?.video_id;

            this.logger.debug('generateVideo 解析响应', { videoUrl, taskId, videoId });

            // 如果有视频 URL，下载并保存
            let localVideoUrl = null;
            if (videoUrl) {
                this.logger.info('generateVideo 检测到视频URL，开始保存', { videoUrl });
                localVideoUrl = await this._saveVideoToService(videoUrl);
                this.logger.debug('generateVideo 视频保存完成', { localVideoUrl });
            }

            const newAsset = {
                id: this._generateAssetId(),
                title: prompt ? prompt.slice(0, 20) + (prompt.length > 20 ? '...' : '') : '视频生成',
                description: prompt || '图生视频',
                cover_url: localVideoUrl || videoUrl,
                thumbnail_url: localVideoUrl || videoUrl,
                type: 'video',
                source_type: 'ai',
                tags: ['ai-generated', 'video'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                file_type: 'video/mp4',
                file_path: localVideoUrl || videoUrl,
                file_size: null,
                owner_id: 1001,
                visibility: 'public',
                ai_prompt: prompt || '图生视频',
                duration: duration,
                resolution: resolution,
                video_id: videoId,
                task_id: taskId,
                source_url: videoUrl,
                video_url: localVideoUrl || videoUrl,
                status: taskId && !videoUrl ? 'processing' : 'completed'
            };

            const data = await this._getAssetsData();
            data.assets.push(newAsset);
            await this._saveAssetsData(data);

            this.logger.info(`generateVideo 成功生成视频, 资产ID: ${newAsset.id}, taskId: ${taskId}`);
            return {
                code: 200,
                ok: true,
                data: {
                    id: newAsset.id,
                    video_url: localVideoUrl,
                    source_url: videoUrl,
                    prompt: prompt || '图生视频',
                    duration: duration,
                    resolution: resolution,
                    created_at: newAsset.created_at,
                    task_id: taskId,
                    video_id: videoId,
                    assetId: newAsset.id
                },
                message: '视频生成成功并已保存到资产库'
            };

        } catch (error) {
            this.logger.error('generateVideo 失败', error);
            return { 
                code: 500, 
                message: error.message || '视频生成失败' 
            };
        }
    }

    async getVideoTaskStatus(taskId) {
        this.logger.info(`getVideoTaskStatus 被调用, taskId: ${taskId}`);
        try {
            // 先检查本地资产是否已标记为完成
            const data = await this._getAssetsData();
            const existingAsset = data.assets.find(
                asset => asset.task_id == taskId && asset.status === 'completed'
            );

            if (existingAsset) {
                this.logger.debug(`getVideoTaskStatus 在本地找到已完成资产: ${existingAsset.id}`);
                return {
                    code: 200,
                    data: {
                        task_id: taskId,
                        status: 'completed',
                        progress: 100
                    }
                };
            }

            // 调用 Agnes API 查询
            this.logger.debug('getVideoTaskStatus 查询 Agnes API', { taskId });
            const response = await axios.get(`https://apihub.agnes-ai.com/v1/videos/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${AGNES_API_KEY}`
                }
            });

            const taskData = response.data;
            this.logger.debug('getVideoTaskStatus API 响应', { status: response.status, data: taskData });
            
            if (taskData.status === 'completed') {
                this.logger.info('getVideoTaskStatus 任务已完成，更新资产');
                await this._createOrUpdateVideoAsset(taskData);
            }

            return {
                code: 200,
                data: {
                    task_id: taskId,
                    status: taskData.status || 'processing',
                    progress: taskData.progress || 0,
                    result: taskData.result || taskData,
                    error: taskData.error || null,
                    ...taskData
                }
            };
        } catch (error) {
            this.logger.error('getVideoTaskStatus 查询失败', error);
            return { 
                code: 500, 
                message: '查询任务状态失败: ' + error.message 
            };
        }
    }

    // ============================================
    // 私有辅助方法
    // ============================================

    async _saveVideoToService(videoUrl) {
        this.logger.info('_saveVideoToService 开始保存视频', { videoUrl });
        try {
            // 下载视频
            this.logger.debug('_saveVideoToService 下载视频');
            const response = await axios.get(videoUrl, {
                responseType: 'blob'
            });

            const blob = response.data;
            this.logger.debug(`_saveVideoToService 视频下载完成，大小: ${blob.size}字节`);
            
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const filename = `video-${timestamp}-${randomId}.mp4`;
            const file = new File([blob], filename, { type: 'video/mp4' });
            this.logger.debug(`_saveVideoToService 生成文件名: ${filename}`);

            this.logger.debug('_saveVideoToService 上传视频到 FSUtils');
            const uploadResult = await this.fsUtils.upload(file, this.PATHS.VIDEOS_DIR);
            const localUrl = uploadResult.downloadUrl;
            this.logger.debug('_saveVideoToService 视频上传完成', { localUrl });

            // 更新所有引用此 source_url 的资产
            this.logger.debug('_saveVideoToService 更新资产引用');
            const data = await this._getAssetsData();
            let updatedCount = 0;
            data.assets.forEach(asset => {
                if (asset.source_url === videoUrl) {
                    asset.cover_url = localUrl;
                    asset.thumbnail_url = localUrl;
                    asset.file_path = localUrl;
                    asset.file_size = blob.size;
                    asset.video_url = localUrl;
                    updatedCount++;
                    this.logger.debug(`_saveVideoToService 更新资产 ${asset.id}: ${asset.title}`);
                }
            });
            if (updatedCount > 0) {
                await this._saveAssetsData(data);
                this.logger.debug(`_saveVideoToService 更新了 ${updatedCount} 个资产`);
            }

            this.logger.info('_saveVideoToService 视频保存成功', { localUrl });
            return localUrl;
        } catch (error) {
            this.logger.error('_saveVideoToService 保存视频失败', error);
            return videoUrl; // fallback: 返回原始 URL
        }
    }

    async _createOrUpdateVideoAsset(apiData) {
        this.logger.info('_createOrUpdateVideoAsset 开始', { taskId: apiData.id || apiData.task_id });
        const data = await this._getAssetsData();
        let asset = data.assets.find(
            a => a.task_id === apiData.id || a.task_id === apiData.task_id
        );

        if (!asset) {
            this.logger.debug('_createOrUpdateVideoAsset 创建新资产');
            asset = {
                id: this._generateAssetId(),
                task_id: apiData.id || apiData.task_id,
            };
            data.assets.push(asset);
        } else {
            this.logger.debug(`_createOrUpdateVideoAsset 更新现有资产 ID: ${asset.id}`);
        }

        // 更新资产信息
        Object.assign(asset, {
            video_id: apiData.video_id,
            source_url: apiData.remixed_from_video_id || apiData.url,
            prompt: apiData.prompt || asset.ai_prompt,
            type: 'video',
            source_type: 'ai',
            updated_at: new Date().toISOString(),
            file_type: 'video/mp4',
            visibility: 'public',
            status: apiData.status
        });

        // 如果有视频 URL，下载保存
        if (asset.source_url && !asset.cover_url) {
            this.logger.debug('_createOrUpdateVideoAsset 保存视频到服务');
            await this._saveVideoToService(asset.source_url);
        }

        await this._saveAssetsData(data);
        this.logger.info(`_createOrUpdateVideoAsset 完成，资产ID: ${asset.id}`);
    }

    async _uploadImageToAgnes(file) {
        // Mock: 实际使用时需要根据 Agnes API 实现图片上传
        this.logger.warn('_uploadImageToAgnes 使用 mock 实现，请根据实际 API 替换', { fileName: file.name });
        return `https://mock-upload.example.com/${file.name}`;
    }
}

// ============================================
// 导出
// ============================================
export { AssetService, uuidv4, Logger };