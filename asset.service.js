// asset.service.js - 前端版本
//import axios from 'axios';
import GitHubFileAPI from './githubFileAPI.js';

// axios mock 实现（基于 fetch）
const axios = typeof window.axios !== 'undefined'? window.axios : {
    async post(url, data, config = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(config.headers || {})
            },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        return { data: responseData, status: response.status };
    },

    async get(url, config = {}) {
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
            return { data: blob, status: response.status };
        }
        
        const responseData = await response.json();
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
        if (!fsUtils) {
            fsUtils = new GitHubFileAPI();
            fsUtils.init();
        }
        this.fsUtils = fsUtils;
        
        // 文件路径常量（对应后端的目录结构）
        this.PATHS = {
            IMAGES_DIR: 'images',
            THUMBNAILS_DIR: 'thumbnails',
            DATA_DIR: 'data',
            VIDEOS_DIR: 'videos',
            ASSETS_JSON: 'data/assets.json',
            CANVAS_JSON: 'data/canvas.json',
            TASK_IDS_JSON: 'data/task_ids.json'
        };

        // 初始化锁
        this._initialized = false;
        this._initPromise = null;
    }

    // ============================================
    // 初始化
    // ============================================
    async init() {
        if (this._initialized) return;
        if (this._initPromise) return this._initPromise;

        this._initPromise = this._doInit();
        await this._initPromise;
        this._initialized = true;
    }

    async _doInit() {
        // 检查并初始化数据文件
        const assetsExists = await this.fsUtils.exists(this.PATHS.ASSETS_JSON);
        if (!assetsExists) {
            await this.fsUtils.uploadJSON(
                this.PATHS.ASSETS_JSON,
                { assets: [], nextId: 1001 }
            );
        }

        const taskIdsExists = await this.fsUtils.exists(this.PATHS.TASK_IDS_JSON);
        if (!taskIdsExists) {
            await this.fsUtils.uploadJSON(
                this.PATHS.TASK_IDS_JSON,
                { taskIds: [] }
            );
        }

        const canvasExists = await this.fsUtils.exists(this.PATHS.CANVAS_JSON);
        if (!canvasExists) {
            await this.fsUtils.uploadJSON(
                this.PATHS.CANVAS_JSON,
                []
            );
        }

        // 加载默认资产（如果资产列表为空）
        await this._loadDefaultAssets();
    }

    // ============================================
    // 数据读写辅助方法
    // ============================================
    async _getAssetsData() {
        const result = await this.fsUtils.readJSON(this.PATHS.ASSETS_JSON);
        if (!result.success) {
            // 如果读取失败，返回默认结构
            return { assets: [], nextId: 1001 };
        }
        return result.data;
    }

    async _saveAssetsData(data) {
        await this.fsUtils.update(this.PATHS.ASSETS_JSON, JSON.stringify(data));
    }

    async _getCanvasData() {
        const result = await this.fsUtils.readJSON(this.PATHS.CANVAS_JSON);
        if (!result.success) {
            return [];
        }
        return result.data;
    }

    async _saveCanvasData(data) {
        await this.fsUtils.update(this.PATHS.CANVAS_JSON, JSON.stringify(data));
    }

    async _getTaskIds() {
        const result = await this.fsUtils.readJSON(this.PATHS.TASK_IDS_JSON);
        if (!result.success) {
            return { taskIds: [] };
        }
        return result.data;
    }

    async _saveTaskIds(data) {
        await this.fsUtils.update(this.PATHS.TASK_IDS_JSON, JSON.stringify(data));
    }

    async _findAssetById(id) {
        const data = await this._getAssetsData();
        return data.assets.find(a => a.id == id) || null;
    }

    async _generateAssetId() {
        const data = await this._getAssetsData();
        const id = data.nextId;
        data.nextId += 1;
        await this._saveAssetsData(data);
        return id;
    }

    async _loadDefaultAssets() {
        const data = await this._getAssetsData();
        if (data.assets && data.assets.length > 0) return;

        // 列出 images 目录下的文件
        const listResult = await this.fsUtils.list(this.PATHS.IMAGES_DIR);
        if (!listResult.success) return;

        const files = listResult.files || [];
        const defaultAssets = [];
        
        for (const file of files) {
            const name = typeof file === 'string' ? file : file.name || file.fileName;
            const ext = name.split('.').pop()?.toLowerCase();
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
                const infoResult = await this.fsUtils.getInfo(name, this.PATHS.IMAGES_DIR);
                defaultAssets.push({
                    id: await this._generateAssetId(),
                    title: name,
                    description: '',
                    cover_url: infoResult.downloadUrl || `images/${name}`,
                    thumbnail_url: infoResult.downloadUrl || `images/${name}`,
                    type: 'character',
                    source_type: 'upload',
                    created_at: new Date().toISOString(),
                    file_type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
                    file_size: infoResult.data?.size || 0,
                    file_path: `images/${name}`,
                    owner_id: 1001,
                    visibility: 'public'
                });
            }
        }

        if (defaultAssets.length > 0) {
            data.assets = defaultAssets;
            await this._saveAssetsData(data);
        }
    }

    // ============================================
    // 图片上传辅助方法
    // ============================================
    async _uploadFile(file, subfolder = this.PATHS.IMAGES_DIR) {
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('只支持图片文件 (JPEG, PNG, GIF, WebP)');
        }

        // 验证文件大小 (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('文件大小不能超过10MB');
        }

        // 生成唯一文件名
        const ext = file.name.split('.').pop() || 'png';
        const uniqueName = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;

        // 上传文件
        const result = await this.fsUtils.upload(file, subfolder);
        if (!result.success) {
            throw new Error('文件上传失败');
        }

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

        return {
            code: 200,
            data: recent
        };
    }

    // ---------- 资产列表 ----------
    async getAssets(query = {}) {
        const { type, keyword, tags, sort = 'time_desc', page = 1, pageSize = 200 } = query;
        
        const data = await this._getAssetsData();
        let assets = [...data.assets];

        // 类型筛选
        if (type && type !== 'all') {
            assets = assets.filter(a => a.type === type);
        }

        // 关键词搜索
        if (keyword) {
            const keywordLower = keyword.toLowerCase();
            assets = assets.filter(a => 
                a.title.toLowerCase().includes(keywordLower) || 
                (a.tags && a.tags.some(t => t.toLowerCase().includes(keywordLower)))
            );
        }

        // 标签筛选
        if (tags && tags.length) {
            let tagArray = Array.isArray(tags) ? tags : tags.split(',');
            assets = assets.filter(a => {
                if (!a.tags || a.tags.length === 0) return false;
                return tagArray.every(t => a.tags.some(aTag => aTag === t));
            });
        }

        // 排序
        if (sort === 'time_desc') {
            assets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sort === 'time_asc') {
            assets.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sort === 'name') {
            assets.sort((a, b) => a.title.localeCompare(b.title));
        }

        // 分页
        const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedAssets = assets.slice(startIndex, endIndex);

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
        const asset = await this._findAssetById(id);
        if (!asset) {
            return { code: 404, message: '资产不存在' };
        }

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
        const file = formData.file;
        const title = formData.title || '未命名素材';
        const type = formData.type || 'material';
        const sourceType = formData.source_type || 'upload';
        const tags = formData.tags || '';

        if (!file) {
            return { code: 400, message: '请上传文件' };
        }

        try {
            const uploadResult = await this._uploadFile(file);
            
            const newAsset = {
                id: await this._generateAssetId(),
                title: title,
                description: formData.description || '',
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

            const data = await this._getAssetsData();
            data.assets.push(newAsset);
            await this._saveAssetsData(data);

            return {
                code: 200,
                data: newAsset,
                message: '资产创建成功'
            };
        } catch (error) {
            return { code: 500, message: error.message };
        }
    }

    // ---------- 更新资产 ----------
    async updateAsset(id, updates) {
        const { title, description, tags, visibility } = updates;
        const data = await this._getAssetsData();
        const assetIndex = data.assets.findIndex(a => a.id == id);

        if (assetIndex === -1) {
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

        return {
            code: 200,
            data: data.assets[assetIndex],
            message: '更新成功'
        };
    }

    // ---------- 删除资产 ----------
    async deleteAsset(id) {
        const data = await this._getAssetsData();
        const assetIndex = data.assets.findIndex(a => a.id == id);

        if (assetIndex === -1) {
            return { code: 404, message: '资产不存在' };
        }

        const asset = data.assets[assetIndex];
        
        // 尝试删除远程文件（非关键操作，失败不影响主流程）
        try {
            // 从 file_path 中提取文件名和子目录
            const filePath = asset.file_path || '';
            const parts = filePath.split('/');
            const fileName = parts.pop();
            const subfolder = parts.join('/') || this.PATHS.IMAGES_DIR;
            
            if (fileName) {
                await this.fsUtils.delete(fileName, subfolder);
            }
        } catch (e) {
            console.warn('删除远程文件失败:', e.message);
        }

        data.assets.splice(assetIndex, 1);
        await this._saveAssetsData(data);

        return { code: 200, message: '删除成功' };
    }

    // ---------- 批量删除 ----------
    async batchDeleteAssets(ids) {
        if (!ids || !Array.isArray(ids)) {
            return { code: 400, message: '请提供有效的ID列表' };
        }

        const data = await this._getAssetsData();
        const deletedIds = [];

        for (const id of ids) {
            const assetIndex = data.assets.findIndex(a => a.id == id);
            if (assetIndex !== -1) {
                const asset = data.assets[assetIndex];
                try {
                    const filePath = asset.file_path || '';
                    const parts = filePath.split('/');
                    const fileName = parts.pop();
                    const subfolder = parts.join('/') || this.PATHS.IMAGES_DIR;
                    if (fileName) {
                        await this.fsUtils.delete(fileName, subfolder);
                    }
                } catch (e) {
                    console.warn('删除远程文件失败:', e.message);
                }
                data.assets.splice(assetIndex, 1);
                deletedIds.push(id);
            }
        }

        await this._saveAssetsData(data);

        return {
            code: 200,
            data: { deleted: deletedIds },
            message: `成功删除 ${deletedIds.length} 个资产`
        };
    }

    // ---------- 使用资产 ----------
    async useAsset(id) {
        const asset = await this._findAssetById(id);
        if (!asset) {
            return { code: 404, message: '资产不存在' };
        }

        return {
            code: 200,
            message: `资产 "${asset.title}" 已使用`,
            data: { used_at: new Date().toISOString() }
        };
    }

    // ---------- 标签 ----------
    async getTags() {
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

        return { code: 200, data: tags };
    }

    // ---------- 批量设置标签 ----------
    async batchSetTags(assetIds, tags) {
        if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
            return { code: 400, message: '请提供资产ID列表' };
        }
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return { code: 400, message: '请提供标签列表' };
        }

        const data = await this._getAssetsData();
        for (const id of assetIds) {
            const asset = data.assets.find(a => a.id == id);
            if (asset) {
                asset.tags = asset.tags || [];
                asset.tags.push(...tags);
                asset.tags = [...new Set(asset.tags)]; // 去重
            }
        }

        await this._saveAssetsData(data);

        return {
            code: 200,
            message: `成功更新 ${assetIds.length} 个资产的标签`
        };
    }

    // ---------- 批量更新分类 ----------
    async batchUpdateAssets(ids, operation, value) {
        if (!ids || !Array.isArray(ids) || !operation) {
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
                    }
                    updatedIds.push(id);
                } else if (operation === 'remove_tag' && value) {
                    if (asset.tags) {
                        asset.tags = asset.tags.filter(t => t !== value);
                    }
                    updatedIds.push(id);
                } else if (operation === 'change_type' && value) {
                    asset.type = value;
                    updatedIds.push(id);
                }
                asset.updated_at = new Date().toISOString();
            }
        });

        await this._saveAssetsData(data);

        return {
            code: 200,
            data: { updated: updatedIds },
            message: `成功更新 ${updatedIds.length} 个资产`
        };
    }

    // ---------- 画布操作 ----------
    async saveCanvas(canvasData) {
        if (!canvasData || typeof canvasData !== 'object') {
            return { code: 400, message: '无效的画布数据' };
        }

        if (!canvasData.id) {
            canvasData.id = 'c' + Date.now();
        }

        const data = await this._getCanvasData();
        const existingIndex = data.findIndex(c => c.id === canvasData.id);

        if (existingIndex !== -1) {
            Object.assign(data[existingIndex], canvasData);
        } else {
            data.push(canvasData);
        }

        await this._saveCanvasData(data);

        return {
            code: 200,
            data: canvasData,
            message: '画布数据保存成功'
        };
    }

    async deleteCanvas(id) {
        if (!id) {
            return { code: 400, message: '请提供画布ID' };
        }

        const data = await this._getCanvasData();
        const index = data.findIndex(c => c.id === id);

        if (index !== -1) {
            data.splice(index, 1);
            await this._saveCanvasData(data);
            return { code: 200, message: '画布数据删除成功' };
        }

        return { code: 404, message: '画布数据不存在' };
    }

    async getCanvasList() {
        const data = await this._getCanvasData();
        return { code: 200, data };
    }

    // ---------- 文件上传 ----------
    async uploadFile(file) {
        try {
            const result = await this._uploadFile(file);
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
            return { code: 500, message: '上传失败: ' + error.message };
        }
    }

    // ---------- AI 图片生成 ----------
    async generateCharacter(params) {
        const { prompt, style, reference_images } = params;
        if (!prompt) {
            return { code: 400, message: '请提供生成提示词' };
        }

        const taskId = uuidv4();
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
        // Mock: 返回随机进度
        const randomProgress = Math.floor(Math.random() * 100);
        const status = randomProgress < 100 ? 'processing' : 'completed';
        
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
        const { title, image_url, tags, description } = params;
        if (!image_url) {
            return { code: 400, message: '请提供生成的图片URL' };
        }

        const newAsset = {
            id: await this._generateAssetId(),
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

        const data = await this._getAssetsData();
        data.assets.push(newAsset);
        await this._saveAssetsData(data);

        return {
            code: 200,
            data: newAsset,
            message: 'AI生成结果已保存到资产库'
        };
    }

    // ---------- AI 图片生成（调用真实 API） ----------
    async generateImage(prompt) {
        if (!prompt) {
            return { code: 400, message: '请提供生成提示词' };
        }

        try {
            const requestData = {
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                model: AGNES_API_IMG_MODEL,
            };

            const apiResponse = await axios.post(AGNES_API_IMG_URL, requestData, {
                headers: {
                    'Authorization': `Bearer ${AGENT_AI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = apiResponse.data;
            const imageData = data?.data?.[0];
            
            if (!imageData || !imageData.url) {
                throw new Error('API 返回数据格式不正确');
            }

            // 生成唯一文件名
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const filename = `ai-generated-${timestamp}-${randomId}.png`;

            // 下载图片并上传到 FSUtils
            const imageResponse = await axios.get(imageData.url, {
                responseType: 'blob'
            });
            
            const blob = imageResponse.data;
            const file = new File([blob], filename, { type: 'image/png' });
            const uploadResult = await this.fsUtils.upload(file, this.PATHS.IMAGES_DIR);

            const newAsset = {
                id: await this._generateAssetId(),
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

            return {
                code: 200,
                data: { image_url: uploadResult.downloadUrl },
                message: '图片生成成功'
            };
        } catch (error) {
            console.error('图片生成失败:', error);
            return { code: 500, message: '图片生成失败: ' + error.message };
        }
    }

    // ---------- AI 视频生成 ----------
    async generateVideo(params) {
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

            // 设置分辨率
            if (resolution === '720p') {
                requestData.width = 1280;
                requestData.height = 720;
            } else if (resolution === '1080p') {
                requestData.width = 1920;
                requestData.height = 1080;
            }

            requestData.num_frames = 169;

            // 处理图片输入
            if (image_file) {
                // TODO: 如果有图片文件，需要先上传到 Agnes
                // 目前使用 mock，假设返回 URL
                const mockUploadUrl = await this._uploadImageToAgnes(image_file);
                requestData.image_url = mockUploadUrl;
            } else if (image_url) {
                requestData.image_url = image_url;
            }

            const response = await axios.post(AGNES_API_URL, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AGNES_API_KEY}`
                }
            });

            const apiResponse = response.data;
            let videoUrl = apiResponse?.data?.[0]?.remixed_from_video_id || apiResponse?.url;
            let taskId = apiResponse?.data?.[0]?.id || apiResponse?.task_id;
            let videoId = apiResponse?.data?.[0]?.video_id || apiResponse?.video_id;

            // 如果有视频 URL，下载并保存
            let localVideoUrl = null;
            if (videoUrl) {
                localVideoUrl = await this._saveVideoToService(videoUrl);
            }

            const newAsset = {
                id: await this._generateAssetId(),
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
            console.error('视频生成失败:', error);
            return { 
                code: 500, 
                message: error.message || '视频生成失败' 
            };
        }
    }

    async getVideoTaskStatus(taskId) {
        try {
            // 先检查本地资产是否已标记为完成
            const data = await this._getAssetsData();
            const existingAsset = data.assets.find(
                asset => asset.task_id == taskId && asset.status === 'completed'
            );

            if (existingAsset) {
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
            const response = await axios.get(`https://apihub.agnes-ai.com/v1/videos/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${AGNES_API_KEY}`
                }
            });

            const taskData = response.data;
            
            if (taskData.status === 'completed') {
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
            console.error('查询任务状态失败:', error);
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
        try {
            // 下载视频
            const response = await axios.get(videoUrl, {
                responseType: 'blob'
            });

            const blob = response.data;
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const filename = `video-${timestamp}-${randomId}.mp4`;
            const file = new File([blob], filename, { type: 'video/mp4' });

            const uploadResult = await this.fsUtils.upload(file, this.PATHS.VIDEOS_DIR);
            const localUrl = uploadResult.downloadUrl;

            // 更新所有引用此 source_url 的资产
            const data = await this._getAssetsData();
            data.assets.forEach(asset => {
                if (asset.source_url === videoUrl) {
                    asset.cover_url = localUrl;
                    asset.thumbnail_url = localUrl;
                    asset.file_path = localUrl;
                    asset.file_size = blob.size;
                    asset.video_url = localUrl;
                }
            });
            await this._saveAssetsData(data);

            return localUrl;
        } catch (error) {
            console.error('保存视频失败:', error);
            return videoUrl; // fallback: 返回原始 URL
        }
    }

    async _createOrUpdateVideoAsset(apiData) {
        const data = await this._getAssetsData();
        let asset = data.assets.find(
            a => a.task_id === apiData.id || a.task_id === apiData.task_id
        );

        if (!asset) {
            asset = {
                id: await this._generateAssetId(),
                task_id: apiData.id || apiData.task_id,
            };
            data.assets.push(asset);
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
            await this._saveVideoToService(asset.source_url);
        }

        await this._saveAssetsData(data);
    }

    async _uploadImageToAgnes(file) {
        // Mock: 实际使用时需要根据 Agnes API 实现图片上传
        console.warn('_uploadImageToAgnes 使用 mock 实现，请根据实际 API 替换');
        return `https://mock-upload.example.com/${file.name}`;
    }
}

// ============================================
// 导出
// ============================================
export { AssetService, uuidv4 };
