import MMDViewer from './MMDViewer.js';
        
// 创建查看器
const viewer = new MMDViewer('model-viewer', {
    backgroundColor: 0x0a0a2a,
    cameraPosition: { x: 4, y: 2.5, z: 6 },
    targetPosition: { x: 0, y: 1.2, z: 0 },
    modelScale: 0.08,
    autoRotate: false,
    showGrid: true
});

// 配置多个模型
const modelsConfig = [
    {
        name: 'furina',
        path: '/【芙宁娜】/【芙宁娜】.pmx',
        scale: 0.08,
        yOffset: -0.5,
        position: { x: -1.5, y: -0.5, z: 0 },
        visible: true
    },
    {
        name: 'focalors',
        path: '/【芙宁娜】/【芙宁娜_荒】.pmx',  // 如果有的话
        scale: 0.08,
        yOffset: -0.5,
        position: { x: 1.5, y: -0.5, z: 0 },
        visible: true
    }
];

// 加载所有模型
let modelsLoaded = false;
let currentVmdAnimation = null;

viewer.loadModels(modelsConfig, (modelName, status, data) => {
    const statusDiv = document.getElementById('status');
    if (status === 'loading') {
        statusDiv.innerHTML = `⏳ 加载 ${modelName}: ${Math.floor(data)}%`;
    } else if (status === 'loaded') {
        statusDiv.innerHTML = `✅ ${modelName} 已加载<br>点击按钮切换模型`;
        modelsLoaded = true;
    } else if (status === 'error') {
        statusDiv.innerHTML = `❌ ${modelName} 加载失败: ${data}`;
    }
}).then(() => {
    document.getElementById('status').innerHTML = '✨ 所有模型已就绪 | 点击按钮切换';
}).catch(error => {
    console.error('模型加载失败:', error);
    document.getElementById('status').innerHTML = '⚠️ 部分模型加载失败，请检查路径';
});

// 切换模型
document.getElementById('switch-furina').addEventListener('click', () => {
    viewer.switchModel('furina');
    setActiveButton('switch-furina');
    document.getElementById('status').innerHTML = '✨ 当前显示: 芙宁娜';
});

document.getElementById('switch-furina2').addEventListener('click', () => {
    viewer.switchModel('focalors');
    setActiveButton('switch-furina2');
    document.getElementById('status').innerHTML = '💧 当前显示: 芙卡洛斯';
});

document.getElementById('view-both').addEventListener('click', () => {
    viewer.hideAllModels();
    viewer.showModel('furina');
    viewer.showModel('focalors');
    setActiveButton('view-both');
    document.getElementById('status').innerHTML = '👥 同时显示两个模型';
});

function setActiveButton(activeId) {
    ['switch-furina', 'switch-furina2', 'view-both'].forEach(id => {
        const btn = document.getElementById(id);
        if (id === activeId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}


import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- 1. 获取容器并创建画布场景 ---
const container = document.getElementById('canvas-container');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a2a);  // 深蓝紫色背景
scene.fog = new THREE.FogExp2(0x0a0a2a, 0.003);  // 雾效

// 创建相机 (透视相机)
const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
camera.position.set(5, 3, 8);
camera.lookAt(0, 1.2, 0);

// 创建 WebGL 渲染器 (画布)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(containerWidth, containerHeight);
renderer.shadowMap.enabled = true;  // 开启阴影
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 可选：CSS2渲染器用于文字标签
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(containerWidth, containerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(labelRenderer.domElement);

// --- 2. 轨道控制 (支持鼠标/触摸交互) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;          // 惯性效果
controls.dampingFactor = 0.05;
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.screenSpacePanning = true;     // 避免平移时倾斜
controls.maxPolarAngle = Math.PI / 2;    // 限制垂直角度
controls.target.set(0, 1.2, 0);
controls.update();

// --- 3. 光源系统 (让模型更有质感) ---

// 环境光
const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

// 主光源 - 方向光
const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
mainLight.position.set(3, 5, 2);
mainLight.castShadow = true;
mainLight.receiveShadow = false;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
scene.add(mainLight);

// 辅助光 - 背面暖色
const backLight = new THREE.DirectionalLight(0xffaa66, 0.5);
backLight.position.set(-2, 2, -3);
scene.add(backLight);

// 补光 - 冷色从下方
const fillLight = new THREE.PointLight(0x4488ff, 0.3);
fillLight.position.set(0, -1, 0);
scene.add(fillLight);

// 可选: 一个小点光源跟随相机 (用于补光)
const cameraLight = new THREE.PointLight(0x88aaff, 0.2);
scene.add(cameraLight);

// --- 4. 辅助元素: 网格地面和轴线 (增强空间感) ---

// 网格辅助线
let gridHelper = new THREE.GridHelper(20, 20, 0x88aaff, 0x335588);
gridHelper.position.y = -0.8;
gridHelper.visible = true;
scene.add(gridHelper);

// 简单的地面反射效果 (透明平面，接收阴影)
const groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.ShadowMaterial({ opacity: 0.4, color: 0x000000, transparent: true, side: THREE.DoubleSide })
);
groundPlane.rotation.x = -Math.PI / 2;
groundPlane.position.y = -0.85;
groundPlane.receiveShadow = true;
scene.add(groundPlane);

// 添加一些漂浮粒子效果 (增加场景灵动感)
const particleCount = 800;
const particlesGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    particlePositions[i*3] = (Math.random() - 0.5) * 30;
    particlePositions[i*3+1] = (Math.random() - 0.5) * 8 + 1;
    particlePositions[i*3+2] = (Math.random() - 0.5) * 20 - 5;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    color: 0x88aaff,
    size: 0.05,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);

// --- 5. 状态变量 ---
let modelMesh = null;          // 存储模型
let autoRotateFlag = false;
let isModelLoading = false;
const statusDiv = document.getElementById('status');

// --- 6. 加载 MMD 模型 (使用 MMDLoader) ---
async function loadModel() {
    if (isModelLoading) return;
    isModelLoading = true;
    statusDiv.innerHTML = '⏳ 加载模型中...';
    statusDiv.classList.add('loading');
    
    try {
        // 动态导入 MMDLoader
        const { MMDLoader } = await import('three/addons/loaders/MMDLoader.js');
        const loader = new MMDLoader();
        
        // 模型路径 - 请根据实际情况修改
        // 注意：如果你的路径包含中文，服务器需要正确配置
        const modelPath = '/【芙宁娜】/【芙宁娜】.pmx';
        
        loader.load(
            modelPath,
            (mesh) => {
                // 模型加载成功
                modelMesh = mesh;
                scene.add(mesh);
                
                // 调整模型位置和大小
                mesh.position.y = -0.5;
                mesh.scale.set(0.08, 0.08, 0.08);
                mesh.castShadow = true;
                mesh.receiveShadow = false;
                
                statusDiv.innerHTML = '✅ 模型加载成功 | 鼠标拖拽旋转视角';
                statusDiv.classList.remove('loading');
                isModelLoading = false;
                
                // 添加一个简单的环绕光效
                addGlowEffect(mesh);
            },
            (xhr) => {
                // 加载进度
                const percent = Math.floor((xhr.loaded / xhr.total) * 100);
                statusDiv.innerHTML = `⏳ 加载模型: ${percent}%`;
            },
            (error) => {
                console.error('模型加载失败:', error);
                statusDiv.innerHTML = '❌ 模型加载失败<br>请检查路径或网络';
                statusDiv.classList.remove('loading');
                isModelLoading = false;
                
                // 显示错误详情
                console.log('请确保模型路径正确，并且服务器支持中文路径');
            }
        );
    } catch (err) {
        console.error('加载模块失败:', err);
        statusDiv.innerHTML = '❌ 加载器初始化失败';
        isModelLoading = false;
    }
}

// 添加简单的光晕效果 (围绕模型的粒子)
function addGlowEffect(mesh) {
    const glowGeometry = new THREE.BufferGeometry();
    const glowCount = 200;
    const glowPositions = new Float32Array(glowCount * 3);
    for (let i = 0; i < glowCount; i++) {
        glowPositions[i*3] = (Math.random() - 0.5) * 1.5;
        glowPositions[i*3+1] = (Math.random() - 0.5) * 2 + 0.5;
        glowPositions[i*3+2] = (Math.random() - 0.5) * 1;
    }
    glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
    const glowMaterial = new THREE.PointsMaterial({
        color: 0xff88aa,
        size: 0.02,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const glowPoints = new THREE.Points(glowGeometry, glowMaterial);
    mesh.add(glowPoints);
}

// --- 7. 动画循环 (渲染画布) ---
let lastTime = performance.now();

function animate() {
    const now = performance.now();
    const delta = Math.min(1/30, (now - lastTime) / 1000);
    lastTime = now;
    
    // 更新相机光源位置
    cameraLight.position.copy(camera.position);
    
    // 自动旋转
    if (autoRotateFlag) {
        controls.update();  // OrbitControls 自带 autoRotate 属性
    } else {
        controls.update();  // 仍然需要调用来应用阻尼效果
    }
    
    // 让粒子系统缓慢旋转，增加生动感
    particleSystem.rotation.y += 0.002;
    particleSystem.rotation.x = Math.sin(now * 0.0005) * 0.1;
    
    // 渲染 WebGL 内容
    renderer.render(scene, camera);
    // 渲染 CSS2D 内容 (如果有标签)
    labelRenderer.render(scene, camera);
    
    requestAnimationFrame(animate);
}

// 启用 controls 的 autoRotate 方法
Object.defineProperty(controls, 'autoRotate', {
    get: () => autoRotateFlag,
    set: (val) => { autoRotateFlag = val; controls.autoRotate = val; }
});

// --- 8. UI 按钮交互 ---
document.getElementById('btn-reset-camera').addEventListener('click', () => {
    camera.position.set(5, 3, 8);
    controls.target.set(0, 1.2, 0);
    controls.update();
    statusDiv.innerHTML = '🎥 相机已重置';
    setTimeout(() => {
        if (modelMesh) statusDiv.innerHTML = '✅ 模型加载成功 | 鼠标拖拽旋转视角';
        else statusDiv.innerHTML = '⏳ 等待模型加载...';
    }, 1500);
});

document.getElementById('btn-auto-rotate').addEventListener('click', (btn) => {
    autoRotateFlag = !autoRotateFlag;
    controls.autoRotate = autoRotateFlag;
    const el = btn.target;
    if (autoRotateFlag) {
        el.classList.add('active');
        statusDiv.innerHTML = '🔄 自动旋转模式';
    } else {
        el.classList.remove('active');
        statusDiv.innerHTML = '⏸ 自动旋转关闭';
    }
    setTimeout(() => {
        if (modelMesh && !autoRotateFlag) statusDiv.innerHTML = '✅ 模型加载成功 | 鼠标拖拽旋转视角';
        else if (!modelMesh) statusDiv.innerHTML = '⏳ 等待模型加载...';
    }, 1500);
});

document.getElementById('btn-toggle-grid').addEventListener('click', (btn) => {
    gridHelper.visible = !gridHelper.visible;
    btn.target.classList.toggle('active', gridHelper.visible);
    statusDiv.innerHTML = gridHelper.visible ? '📐 网格显示' : '📐 网格隐藏';
    setTimeout(() => {
        if (modelMesh) statusDiv.innerHTML = '✅ 模型加载成功 | 鼠标拖拽旋转视角';
        else statusDiv.innerHTML = '⏳ 等待模型加载...';
    }, 1200);
});

// --- 9. 窗口大小适配 (画布自适应) ---
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);
}

// --- 10. 启动加载模型和动画 ---
loadModel();
animate();

// 控制台输出帮助信息
console.log('%c✨ 3D场景已启动 | 芙宁娜模型展示', 'color: #88aaff; font-size: 16px;');
console.log('提示: 如果模型加载失败，请检查:');
console.log('1. 模型路径是否正确: /【芙宁娜】/【芙宁娜】.pmx');
console.log('2. Node.js 服务器是否支持中文路径');
console.log('3. 模型文件和相关贴图是否完整');