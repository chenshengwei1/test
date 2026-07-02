// MMDViewer.js - 增强版，支持多模型
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

class MMDViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`容器 #${containerId} 不存在`);
            return;
        }
        
        // 存储多个模型
        this.models = new Map(); // key: 模型名称, value: { mesh, helper, animations }
        this.currentModel = null;
        
        // 动画辅助器
        this.helper = new MMDAnimationHelper();
        this.clock = new THREE.Clock();
        this.isAnimating = false;
        
        // 配置选项
        this.options = {
            backgroundColor: options.backgroundColor || 0x111122,
            cameraPosition: options.cameraPosition || { x: 5, y: 3, z: 8 },
            targetPosition: options.targetPosition || { x: 0, y: 1.2, z: 0 },
            modelScale: options.modelScale || 0.08,
            modelYOffset: options.modelYOffset || -0.5,
            autoRotate: options.autoRotate || false,
            showGrid: options.showGrid !== undefined ? options.showGrid : true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        // 清空容器
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        // 获取容器尺寸
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.options.backgroundColor);
        this.scene.fog = new THREE.FogExp2(this.options.backgroundColor, 0.008);
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
        this.camera.position.set(
            this.options.cameraPosition.x,
            this.options.cameraPosition.y,
            this.options.cameraPosition.z
        );
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        // 添加光源
        this.setupLights();
        
        // 添加辅助元素
        if (this.options.showGrid) {
            this.setupHelpers();
        }
        
        // 设置轨道控制
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.options.autoRotate;
        this.controls.target.set(
            this.options.targetPosition.x,
            this.options.targetPosition.y,
            this.options.targetPosition.z
        );
        this.controls.update();
        
        // 启动动画循环
        this.animate();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLights() {
        // 环境光
        this.ambientLight = new THREE.AmbientLight(0x404060);
        this.scene.add(this.ambientLight);
        
        // 主光源
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.directionalLight.position.set(2, 5, 3);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);
        
        // 背光补光
        this.backLight = new THREE.DirectionalLight(0x88aaff, 0.5);
        this.backLight.position.set(-2, 1, -3);
        this.scene.add(this.backLight);
        
        // 补光
        this.fillLight = new THREE.PointLight(0x4466cc, 0.3);
        this.fillLight.position.set(1, 2, 2);
        this.scene.add(this.fillLight);
    }
    
    setupHelpers() {
        this.gridHelper = new THREE.GridHelper(20, 20, 0x88aaff, 0x335588);
        this.gridHelper.position.y = -0.8;
        this.scene.add(this.gridHelper);
    }
    
    // 加载多个模型
    async loadModels(modelsConfig, onProgress) {
        const loader = new MMDLoader();
        const promises = [];
        
        for (const config of modelsConfig) {
            const promise = new Promise((resolve, reject) => {
                loader.load(
                    config.path,
                    (mesh) => {
                        // 配置模型
                        mesh.position.y = config.yOffset || this.options.modelYOffset;
                        mesh.scale.set(
                            config.scale || this.options.modelScale,
                            config.scale || this.options.modelScale,
                            config.scale || this.options.modelScale
                        );
                        
                        // 存储模型
                        this.models.set(config.name, {
                            mesh: mesh,
                            visible: config.visible !== false,
                            position: config.position || { x: 0, y: 0, z: 0 },
                            animations: []
                        });
                        
                        mesh.visible = config.visible !== false;
                        
                        // 设置位置
                        if (config.position) {
                            mesh.position.set(config.position.x, config.position.y, config.position.z);
                        }
                        
                        this.scene.add(mesh);
                        
                        if (onProgress) {
                            onProgress(config.name, 'loaded');
                        }
                        
                        resolve({ name: config.name, mesh });
                    },
                    (xhr) => {
                        if (onProgress) {
                            const percent = (xhr.loaded / xhr.total * 100);
                            onProgress(config.name, 'loading', percent);
                        }
                    },
                    (error) => {
                        console.error(`加载模型 ${config.name} 失败:`, error);
                        if (onProgress) {
                            onProgress(config.name, 'error', error);
                        }
                        reject(error);
                    }
                );
            });
            promises.push(promise);
        }
        
        return Promise.all(promises);
    }
    
    // 切换显示的模型
    switchModel(modelName) {
        for (const [name, model] of this.models) {
            if (model.mesh) {
                model.mesh.visible = (name === modelName);
            }
        }
        this.currentModel = modelName;
    }
    
    // 隐藏所有模型
    hideAllModels() {
        for (const model of this.models.values()) {
            if (model.mesh) {
                model.mesh.visible = false;
            }
        }
    }
    
    // 显示指定模型
    showModel(modelName) {
        const model = this.models.get(modelName);
        if (model && model.mesh) {
            model.mesh.visible = true;
        }
    }
    
    // 移除模型
    removeModel(modelName) {
        const model = this.models.get(modelName);
        if (model && model.mesh) {
            this.scene.remove(model.mesh);
            this.models.delete(modelName);
        }
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // 更新动画辅助器
        if (this.isAnimating && this.helper) {
            this.helper.update(delta);
        }
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    // 销毁组件
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
}

export default MMDViewer;