class ClockHandler extends TestPartHanlder{
    constructor(){
        super();
        this.id = 'clock';
        this.title = 'clock';
    }

    getBody(){
        return `
				<style>
					:root {
						  --clock-width: 100%; 
					}
					@keyframes clock {
						0%   {transform: rotate(-90deg);}
						25%  {transform: rotate(0deg);}
						50%  {transform: rotate(90deg);}
						70%  {transform: rotate(180deg);}
						100% {transform: rotate(270deg);}
					}
					
					@keyframes rotateX {
						0%   {transform: rotateX(-90deg);}
						25%  {transform: rotateX(0deg);}
						50%  {transform: rotateX(90deg);}
						70%  {transform: rotateX(180deg);}
						100% {transform: rotateX(270deg);}
					}
					@keyframes rotateY {
						0%   {transform: rotateY(-90deg);}
						25%  {transform: rotateY(0deg);}
						50%  {transform: rotateY(90deg);}
						70%  {transform: rotateY(180deg);}
						100% {transform: rotateY(270deg);}
					}
					@keyframes rotateZ {
						0%   {transform: rotateZ(-90deg);}
						25%  {transform: rotateZ(0deg);}
						50%  {transform: rotateZ(90deg);}
						70%  {transform: rotateZ(180deg);}
						100% {transform: rotateZ(270deg);}
					}
					
					@keyframes translateX {
						0%   {transform: translateX(0);}
						25%  {transform: translateX(50px);}
						50%  {transform: translateX(100px);}
						70%  {transform: translateX(50px);}
						100% {transform: translateX(0px);}
					}
					@keyframes translateY {
						0%   {transform: translateY(0);}
						25%  {transform: translateY(50px);}
						50%  {transform: translateY(100px);}
						70%  {transform: translateY(50px);}
						100% {transform: translateY(0px);}
					}
					@keyframes scaleX {
						0%   {transform: scaleX(0.5);}
						25%  {transform: scaleX(1);}
						50%  {transform: scaleX(1.5);}
						70%  {transform: scaleX(1);}
						100% {transform: scaleX(0.5);}
					}
					@keyframes scaleY {
						0%   {transform: scaleY(0.5);}
						25%  {transform: scaleY(1);}
						50%  {transform: scaleY(1.5);}
						70%  {transform: scaleY(1);}
						100% {transform: scaleY(0.5);}
					}
					@keyframes rotate {
						0%   {transform: rotateZ(-90deg);}
						25%  {transform: rotateZ(0deg);}
						50%  {transform: rotateZ(90deg);}
						70%  {transform: rotateZ(180deg);}
						100% {transform: rotateZ(270deg);}
					}
					@keyframes skewX {
						0%   {transform: skewX(-90deg);}
						25%  {transform: skewX(0deg);}
						50%  {transform: skewX(90deg);}
						70%  {transform: skewX(180deg);}
						100% {transform: skewX(270deg);}
					}
					@keyframes skewY {
						0%   {transform: skewY(-90deg);}
						25%  {transform: skewY(0deg);}
						50%  {transform: skewY(90deg);}
						70%  {transform: skewY(180deg);}
						100% {transform: skewY(270deg);}
					}
					
					.test .s{
						animation-name: clock;
						animation-duration: 60s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					
					.test .m{
						animation-name: clock;
						animation-duration: 3600s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					
					.test .h{
						animation-name: clock;
						animation-duration: 43200s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					
					.clock{
						width: var(--clock-width);
						height: var(--clock-width); 
					}
					
					.clock-container{
						background-color: black;
						display: flex;
						flex-wrap: wrap;
					}
					
					.clock-container li{
						display: inline-block;
						border: 1px red;
						text-align: end;
						position: absolute;
						color:red;
						width:inherit;
					}
					.cricle{
						display: inline-block;
						border: 1px black;
						border-style: solid;
						width: inherit;
						height: inherit;
						margin-top: -90px;
						border-radius: 50%;
					}
					.clock-container li.second{
						display: flex;
						border: 1px black;
						color:black;
						width: inherit;
						letter-spacing: -3;
						transform-origin: left center;
					}
					.clock-container li.second .suffix{
						display: inline-block;
						width: calc(var(--clock-width) * 85%);

					}
					.clock-container li.minute{
						display: flex;
						border: 1px black;
						width: inherit;
						letter-spacing: -3;
						color:rgb(172 100 155);
						transform-origin: left center;
					}
					.clock-container li.hour{
						display: flex;
						border: 1px black;
						width: inherit;
						letter-spacing: -3;
						color:rgb(189 164 164);
						transform-origin: left center;
					}
					.clock-container li.hour .suffix{
						display: inline-block;
						width: calc(var(--clock-width) * 85%);
					}
					.clock-container ul{
						margin: 100px 100px;
					}
					
					.test{
						position:absolute;
					}
					.test li{
						display: inline-block;
						border-style: solid;
						border: 1px red;
						text-align: end;
						position: absolute;
					}
					
					.demo-transform{
						width: 80px;
						height: 70px;
						color: white;
						position: relative;
						font-weight: bold;
						font-size: 15px;
						padding: 10px;
						float: left;
						margin-right: 50px;
						border-radius: 5px;
						border: 1px solid #000000;
						background: red;
						margin: 10px;
						box-sizing: border-box;
					}
					
					.demo-transform:hover{
						border: 3px solid #de4343;
						background: green;
						color: white;
					}
					
					#rotateXD{
						animation-name: rotateX;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					#rotateYD{
						animation-name: rotateY;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					#rotateZD,.clock-rotateZD{
						animation-name: rotateZ;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					
					#translateX,.clock-translateX{
						animation-name: translateX;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					#translateY{
						animation-name: translateY;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					#scaleX{
						animation-name: scaleX;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					#scaleY{
						animation-name: scaleY;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					#rotate{
						animation-name: rotate;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					#skewX{
						animation-name: skewX;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					#skewY{
						animation-name: skewY;
						animation-duration: 4s;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}
					
					.demo-trangle{
						width:0;
						heigth:0;
						border-bottom:100px;
					}

					.clock-grid{
						width: 100%;
						display: flex;
					}
					.style-btn, .size-btn {
						background: rgba(20, 25, 35, 0.8);
						border: 1px solid #3a3e4a;
						padding: 10px 20px;
						border-radius: 60px;
						font-size: 0.85rem;
						font-weight: 600;
						cursor: pointer;
						transition: all 0.25s ease;
						color: #ccc;
						backdrop-filter: blur(4px);
						font-family: inherit;
					}

					.style-btn.active, .size-btn.active {
						background: linear-gradient(145deg, #d4af37, #b8922a);
						border-color: #e9c468;
						color: #1e1b14;
						box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
					}

					.style-btn:hover:not(.active), .size-btn:hover:not(.active) {
						border-color: #c9aa4b;
						color: #eace84;
						transform: translateY(-2px);
					}
				</style>
				<div class="clock-container">
					<ul  class="clock">
						<li class="item1"><span>1-</span></li>
						<li class="item2"><span>2-</span></li>
						<li class="item3"><span>3-</span></li>
						<li class="item4"><span>4-</span></li>
						<li class="item5"><span>5-</span></li>
						<li class="item6"><span>6-</span></li>
						<li class="item7"><span>7-</span></li>
						<li class="item8"><span>8-</span></li>
						<li class="item9"><span>9-</span></li>
						<li class="item10"><span>10-</span></li>
						<li class="item11"><span>11-</span></li>
						<li class="item12"><span>12-</span></li>
						<li class="second"><span class="pre"></span><span class="suffix">―――――――――――――――▶</span></li>
						<li class="minute"><span class="pre"></span><span class="suffix">――――――――――――▶       </span></li>
						<li class="hour">  <span class="pre"></span><span class="suffix">――――――――――▶          </span></li>
						<div class="cricle">
							
						</div>
						
					</ul>
					<div class="cuurent-time"></div>
					<ul class="test">
					</ul>
					<div style="top: 200px;overflow:hidden;">
						<div id="rotateXD" class="demo-transform">XD rotateX</div>
					
						<div  id="rotateYD" class="demo-transform">YD rotateY</div>
						
						<div  id="rotateZD" class="demo-transform">ZD rotateZ</div>
						
						<div  id="translateX" class="demo-transform">2D translateX</div>
						<div  id="translateY" class="demo-transform">2D translateY</div>
						<div  id="scaleX" class="demo-transform">2D scaleX</div>
						<div  id="scaleY" class="demo-transform">2D scaleY</div>
						<div  id="rotate" class="demo-transform">2D rotate</div>
						<div  id="skewX" class="demo-transform">2D skewX</div>
						<div  id="skewY" class="demo-transform">2D skewY</div>
						
						<div id="trangle" class="demo-trangle"></div>
					</div>
					
					<div class="clock-grid">
						<div class="clock-card">
							<div id="rolex-clock-default" style="width: 400px; height: 400px;" class="clock-rotateZD"></div>
							<div class="card-label">经典尺寸 · 默认主题</div>
						</div>
						<div class="clock-card">
							<div id="rolex-clock-small" style="width: 320px; height: 320px;"></div>
							<div class="card-label">紧凑尺寸 · 320x320</div>
						</div>
						<div class="clock-card">
							<div id="rolex-clock-large" style="width: 480px; height: 480px;"></div>
							<div class="card-label">大气尺寸 · 480x480</div>
						</div>
					</div>
				</div>
			`
    }

    addLisenter(){
        $('.clock-container .clock li').each((i, e)=>{
            let t = 360/12 * (i +1) - 90;
            $(e).css({'transform':'rotate('+t+'deg)'})
            //$(e).find('span').css({'transform':'rotate(-'+t+'deg)'})
        });
        for(let i=1;i<=60;i++){
            $('.clock-container .test').append(`<li class="item1"><span>${i%5==0?i/5+'-':''}-</span></li>`);
        }
        $('.clock-container .test').append(`<li class="h"><span>--->-</span></li>`);
        $('.clock-container .test').append(`<li class="m"><span>---->>-</span></li>`);
        $('.clock-container .test').append(`<li class="s"><span>----->>>-</span></li>`);
        
        
        $('.clock-container .test li').each((i, e)=>{
            let t = 360/60 * (i +1) - 90;
            if ($(e).is('.s')){t=-90};
            if ($(e).is('.m')){t=-90};
            if ($(e).is('.h')){t=-90};
            $(e).css({'transform':'rotate('+t+'deg)','color':'red','width':'200px'});
            
            $(e).find('span').css({'width':'200px'})
        });
        
        let t = new Date();
        $('.s').css({'color':'blue','animation-delay':'-'+(t.getSeconds())+'s'});
        console.log('delay - -- - ', t.getSeconds() + 60*t.getMinutes());
        $('.m').css({'color':'black', 'animation-delay':'-'+(t.getSeconds() + 60*t.getMinutes())+'s'});
        $('.h').css({'animation-delay':'-'+(t.getSeconds() + 60*t.getMinutes()+ 60*60*(t.getHours()%12))+'s'});
        
        let currentSecond = 1;
        let currentMinute = 1;
        let currentHour = 1;
        setInterval(()=>{
            let t = new Date();
            currentSecond = currentSecond % 60;
            let sr = 360/60 * (t.getSeconds()) - 90;
            let mr = 360/60 * (t.getMinutes()) - 90;
            let hr = 360/12 * (t.getHours()) - 90;
            currentSecond++;
            $('.second').css({'transform':'rotate('+sr+'deg)'});
            $('.minute').css({'transform':'rotate('+mr+'deg)'});
            $('.hour').css({'transform':'rotate('+hr+'deg)'});
            $('.cuurent-time').html(`${t.getHours()} : ${t.getMinutes()} : ${t.getSeconds()}`)
        }, 1000)

		loadRolexClocks();
    }
}


// <!DOCTYPE html>
// <html lang="zh-CN">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>劳力士时钟组件 - 可嵌入示例</title>
//     <style>
//         /* 仅为演示页面的样式，组件本身不依赖外部样式 */
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//         }

//         body {
//             background: linear-gradient(135deg, #1a2a3a 0%, #0f1a24 100%);
//             min-height: 100vh;
//             display: flex;
//             flex-direction: column;
//             justify-content: center;
//             align-items: center;
//             font-family: 'Segoe UI', system-ui, sans-serif;
//             padding: 40px 20px;
//         }

//         /* 演示卡片样式 */
//         .demo-container {
//             max-width: 1200px;
//             width: 100%;
//         }

//         .title {
//             text-align: center;
//             color: #d4af37;
//             margin-bottom: 30px;
//             font-family: 'Times New Roman', serif;
//             letter-spacing: 2px;
//         }

//         .title h1 {
//             font-weight: 400;
//             font-size: 2rem;
//         }

//         .title p {
//             color: #aaa;
//             margin-top: 8px;
//         }

//         .clock-grid {
//             display: flex;
//             flex-wrap: wrap;
//             justify-content: center;
//             gap: 40px;
//             margin-top: 20px;
//         }

//         .clock-card {
//             background: rgba(0,0,0,0.3);
//             border-radius: 28px;
//             padding: 20px;
//             backdrop-filter: blur(4px);
//             box-shadow: 0 20px 35px rgba(0,0,0,0.4);
//             transition: transform 0.2s;
//         }

//         .clock-card:hover {
//             transform: translateY(-5px);
//         }

//         .card-label {
//             text-align: center;
//             margin-top: 16px;
//             color: #c9b16b;
//             font-weight: 500;
//             letter-spacing: 1px;
//         }

//         .code-section {
//             margin-top: 50px;
//             background: #0d1117;
//             border-radius: 20px;
//             padding: 24px;
//             border: 1px solid #2d2f36;
//         }

//         .code-section h3 {
//             color: #e0c87c;
//             margin-bottom: 16px;
//             font-family: monospace;
//         }

//         pre {
//             background: #161b22;
//             padding: 18px;
//             border-radius: 14px;
//             overflow-x: auto;
//             color: #e6e6e6;
//             font-family: 'Fira Code', monospace;
//             font-size: 13px;
//             line-height: 1.5;
//         }

//         .note {
//             color: #8e8e9a;
//             font-size: 14px;
//             margin-top: 20px;
//             text-align: center;
//             border-top: 1px solid #2a2e38;
//             padding-top: 20px;
//         }
//     </style>
// </head>
// <body>
// <div class="demo-container">
//     <div class="title">
//         <h1>⌚ ROLEX 风格时钟组件</h1>
//         <p>可嵌入任意页面 · Class 模块化设计 · 精准走时</p>
//     </div>

//     <div class="clock-grid">
//         <div class="clock-card">
//             <div id="rolex-clock-default" style="width: 400px; height: 400px;"></div>
//             <div class="card-label">经典尺寸 · 默认主题</div>
//         </div>
//         <div class="clock-card">
//             <div id="rolex-clock-small" style="width: 320px; height: 320px;"></div>
//             <div class="card-label">紧凑尺寸 · 320x320</div>
//         </div>
//         <div class="clock-card">
//             <div id="rolex-clock-large" style="width: 480px; height: 480px;"></div>
//             <div class="card-label">大气尺寸 · 480x480</div>
//         </div>
//     </div>

//     <div class="code-section">
//         <h3>📦 使用方式 (基于 Class 组件)</h3>
//         <pre><code>// 1. 引入 RolexClock 类 (复制下方完整 class 代码)
// // 2. 创建容器元素
// const container = document.getElementById('your-container');

// // 3. 实例化组件
// const rolexClock = new RolexClock(container, {
//     size: 400,          // 可选，默认 400px
//     brandText: 'ROLEX', // 可选，品牌文字
//     modelText: 'OYSTER PERPETUAL'
// });

// // 4. 启动时钟 (开始走时)
// rolexClock.start();

// // 5. 需要时停止 / 销毁组件
// // rolexClock.stop();    // 停止动画
// // rolexClock.destroy(); // 完全销毁并清理资源</code></pre>
//         <div class="note">
//             💡 组件特性：支持响应式缩放、自动适配深色表盘、精确时针分针秒针、日历窗动态显示、劳力士经典元素（皇冠标志/陶瓷外圈/奔驰针）
//         </div>
//     </div>
// </div>

// <script>
    /**
     * RolexClock 组件 - 劳力士风格模拟时钟
     * 使用原生 Canvas + requestAnimationFrame，支持任意页面嵌入
     * 
     * @class RolexClock
     * @param {HTMLElement} container - 挂载的容器元素
     * @param {Object} options - 配置项
     * @param {number} [options.size=400] - 时钟尺寸 (宽高一致，px)
     * @param {string} [options.brandText='ROLEX'] - 顶部品牌文字
     * @param {string} [options.modelText='OYSTER PERPETUAL'] - 型号文字
     * @param {boolean} [options.autoStart=true] - 是否自动开始走时
     */
    /**
     * RolexClock 组件 - 五款劳力士风格时钟
     * 支持 submariner, daytona, datejust, gmt, explorer
     */
    class RolexClock {
        constructor(container, options = {}) {
            if (!container || !(container instanceof HTMLElement)) {
                throw new Error('RolexClock: 需要有效的DOM容器');
            }
            this.container = container;
            this.options = {
                style: options.style || 'submariner',
                size: options.size || 380,
                brandText: options.brandText || 'ROLEX',
                modelText: options.modelText || 'OYSTER PERPETUAL',
                autoStart: options.autoStart !== false
            };
            
            this.canvas = null;
            this.ctx = null;
            this.animationId = null;
            this.isRunning = false;
            this.resizeObserver = null;
            
            this.themes = this._getThemeByStyle(this.options.style);
            this._initCanvas();
            
            if (window.ResizeObserver) {
                this.resizeObserver = new ResizeObserver(() => this._resizeCanvas());
                this.resizeObserver.observe(this.container);
            }
            
            if (this.options.autoStart) this.start();
        }
        
        _getThemeByStyle(style) {
            const base = {
                dialGradient: ['#0e121c', '#020408'],
                markerColor: '#e5dbb0',
                secondHandColor: '#c9a03d',
                hourHandColor: '#e8dcb4',
                minuteHandColor: '#e8dcb4',
                lumeColor: '#bdd99a',
                bezelType: 'standard',
                has24hHand: false,
                has369Numbers: false
            };
            
            if (style === 'submariner') {
                return { ...base, dialGradient: ['#0e121c', '#020408'], bezelType: 'ceramic', modelDefault: 'SUBMARINER' };
            } else if (style === 'daytona') {
                return { ...base, dialGradient: ['#1e212b', '#0b0e15'], secondHandColor: '#cf5a2c', bezelType: 'tachymeter', modelDefault: 'COSMOGRAPH DAYTONA' };
            } else if (style === 'datejust') {
                return { ...base, dialGradient: ['#25212c', '#130e18'], markerColor: '#f4eace', bezelType: 'fluted', modelDefault: 'DATEJUST' };
            } else if (style === 'gmt') {
                return { ...base, dialGradient: ['#0a1420', '#03060c'], markerColor: '#e2d7ac', secondHandColor: '#daa549', bezelType: 'gmt', has24hHand: true, modelDefault: 'GMT-MASTER II' };
            } else if (style === 'explorer') {
                return { ...base, dialGradient: ['#12161f', '#05080e'], markerColor: '#ecdcaa', has369Numbers: true, bezelType: 'explorer', modelDefault: 'EXPLORER' };
            }
            return base;
        }
        
        setStyle(style) {
            const valid = ['submariner', 'daytona', 'datejust', 'gmt', 'explorer'];
            if (!valid.includes(style)) return;
            this.options.style = style;
            this.themes = this._getThemeByStyle(style);
            if (this.themes.modelDefault && this.options.modelText === 'OYSTER PERPETUAL') {
                this.options.modelText = this.themes.modelDefault;
            }
            if (this.isRunning) this.draw();
        }

		setSize(size) {
			if (typeof size === 'number' && size > 0 && size !== this.options.size && !isNaN(size) && isFinite(size) && size < 2000 && size > 100) {
				this.options.size = size;
				this.container.style.height = `${size}px`;
				this.container.style.width = `${size}px`;
				this._initCanvas();
			}
		}
        
        _initCanvas() {
            this.container.innerHTML = '';
            this.container.style.position = 'relative';
			if (this.canvas){
				this.canvas.remove();
				this.canvas = null;
				this.ctx = null;
			}
            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'block';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.borderRadius = '50%';
            this.container.appendChild(this.canvas);
            this._resizeCanvas();
        }
        
        _resizeCanvas() {
            const rect = this.container.getBoundingClientRect();
            let targetSize = Math.min(rect.width, rect.height) || this.options.size;
            if (targetSize <= 0) targetSize = this.options.size;
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = targetSize * dpr;
            this.canvas.height = targetSize * dpr;
            this.canvas.style.width = `${targetSize}px`;
            this.canvas.style.height = `${targetSize}px`;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(dpr, dpr);
            this.size = targetSize;
            this.radius = this.size * 0.42;
            this.centerX = this.size / 2;
            this.centerY = this.size / 2;
            if (this.isRunning) this.draw();
        }
        
        _roundRect(x, y, w, h, r) {
            const ctx = this.ctx;
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
        }
        
        _drawBezel() {
            const { ctx, centerX, centerY, radius, themes, options } = this;
            const outerR = radius + 8;
            const innerR = radius - 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerR, 0, 2*Math.PI);
            ctx.arc(centerX, centerY, innerR, 0, 2*Math.PI);
            ctx.fillStyle = '#1a1d26';
            ctx.fill('evenodd');
            
            if (options.style === 'daytona') {
                for (let i = 0; i < 60; i++) {
                    const angle = (i * 6 - 90) * Math.PI/180;
                    const start = radius + 6;
                    const end = radius + 12;
                    const x1 = centerX + Math.cos(angle) * start;
                    const y1 = centerY + Math.sin(angle) * start;
                    const x2 = centerX + Math.cos(angle) * end;
                    const y2 = centerY + Math.sin(angle) * end;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineWidth = i % 10 === 0 ? 2 : 1;
                    ctx.strokeStyle = '#b98f44';
                    ctx.stroke();
                }
                ctx.font = `bold ${Math.floor(this.size * 0.028)}px "Arial"`;
                for (let i = 0; i < 12; i++) {
                    let val = (i * 5 === 0 ? 60 : i * 5) * 2;
                    if (val > 400) val = 400;
                    const angle = (i * 30 - 90) * Math.PI/180;
                    const rad = radius + 16;
                    const x = centerX + Math.cos(angle) * rad;
                    const y = centerY + Math.sin(angle) * rad + 3;
                    ctx.fillStyle = '#eac27d';
                    ctx.fillText(val.toString(), x, y);
                }
            } else if (options.style === 'datejust') {
                for (let i = 0; i < 72; i++) {
                    const angle = (i * 5 - 90) * Math.PI/180;
                    const x1 = centerX + Math.cos(angle) * (radius + 4);
                    const y1 = centerY + Math.sin(angle) * (radius + 4);
                    const x2 = centerX + Math.cos(angle + 0.07) * (radius + 12);
                    const y2 = centerY + Math.sin(angle + 0.07) * (radius + 12);
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = '#dbbc72';
                    ctx.stroke();
                }
            } else if (options.style === 'gmt') {
                // 双色圈效果: 一半红/蓝或红/黑 (经典百事圈风格)
                for (let i = 0; i < 60; i++) {
                    const angle = (i * 6 - 90) * Math.PI/180;
                    const start = radius + 4;
                    const end = radius + 11;
                    const x1 = centerX + Math.cos(angle) * start;
                    const y1 = centerY + Math.sin(angle) * start;
                    const x2 = centerX + Math.cos(angle) * end;
                    const y2 = centerY + Math.sin(angle) * end;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineWidth = 1.2;
                    const isRed = (i >= 0 && i < 30);
                    ctx.strokeStyle = isRed ? '#c24a2a' : '#2a5f8a';
                    ctx.stroke();
                }
                ctx.font = `bold ${Math.floor(this.size * 0.03)}px "Arial"`;
                for (let i = 1; i <= 12; i++) {
                    const val = i * 2;
                    const angle = ((i * 30) - 90) * Math.PI/180;
                    const rad = radius + 16;
                    const x = centerX + Math.cos(angle) * rad;
                    const y = centerY + Math.sin(angle) * rad + 4;
                    ctx.fillStyle = '#e6cd89';
                    ctx.fillText(val.toString(), x, y);
                }
            } else if (options.style === 'explorer') {
                for (let i = 0; i < 60; i++) {
                    const angle = (i * 6 - 90) * Math.PI/180;
                    const start = radius + 5;
                    const end = radius + 9;
                    const x1 = centerX + Math.cos(angle) * start;
                    const y1 = centerY + Math.sin(angle) * start;
                    const x2 = centerX + Math.cos(angle) * end;
                    const y2 = centerY + Math.sin(angle) * end;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
                    ctx.strokeStyle = '#cbaa5c';
                    ctx.stroke();
                }
            } else {
                for (let i = 0; i < 60; i++) {
                    const angle = (i * 6 - 90) * Math.PI/180;
                    const start = radius + 3;
                    const end = radius + 9;
                    const x1 = centerX + Math.cos(angle) * start;
                    const y1 = centerY + Math.sin(angle) * start;
                    const x2 = centerX + Math.cos(angle) * end;
                    const y2 = centerY + Math.sin(angle) * end;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineWidth = i % 10 === 0 ? 2.2 : 1;
                    ctx.strokeStyle = i % 5 === 0 ? '#e5ba60' : '#8f7b48';
                    ctx.stroke();
                }
                for (let i = 0; i < 12; i++) {
                    const val = i === 0 ? 60 : i * 5;
                    const angle = (i * 30 - 90) * Math.PI/180;
                    const rad = radius + 14;
                    const x = centerX + Math.cos(angle) * rad;
                    const y = centerY + Math.sin(angle) * rad + 4;
                    ctx.fillStyle = '#e9cb89';
                    ctx.font = `bold ${Math.floor(this.size * 0.032)}px "Segoe UI"`;
                    ctx.fillText(val.toString(), x, y);
                }
            }
        }
        
        _drawDial() {
            const { ctx, centerX, centerY, radius, themes } = this;
            const grad = ctx.createLinearGradient(centerX-40, centerY-40, centerX+40, centerY+40);
            grad.addColorStop(0, themes.dialGradient[0]);
            grad.addColorStop(1, themes.dialGradient[1]);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2*Math.PI);
            ctx.fillStyle = grad;
            ctx.fill();
        }
        
        _drawMarkers() {
            const { ctx, centerX, centerY, radius, themes, options } = this;
            // 常规条形刻度
            for (let i = 0; i < 12; i++) {
                const angle = (i * 30 - 90) * Math.PI/180;
                const inner = radius - 14;
                const outer = radius - 40;
                const x1 = centerX + Math.cos(angle) * inner;
                const y1 = centerY + Math.sin(angle) * inner;
                const x2 = centerX + Math.cos(angle) * outer;
                const y2 = centerY + Math.sin(angle) * outer;
                const perp = angle + Math.PI/2;
                const w = options.style === 'explorer' ? 4.2 : 5;
                const dx = Math.cos(perp) * w;
                const dy = Math.sin(perp) * w;
                ctx.beginPath();
                ctx.moveTo(x1 + dx, y1 + dy);
                ctx.lineTo(x1 - dx, y1 - dy);
                ctx.lineTo(x2 - dx, y2 - dy);
                ctx.lineTo(x2 + dx, y2 + dy);
                ctx.fillStyle = themes.markerColor;
                ctx.fill();
                ctx.fillStyle = '#b89742';
                ctx.fill();
                
                if (options.style !== 'explorer' || (i !== 2 && i !== 5 && i !== 8 && i !== 10)) {
                    const spotX = centerX + Math.cos(angle) * (outer - 3);
                    const spotY = centerY + Math.sin(angle) * (outer - 3);
                    ctx.beginPath();
                    ctx.arc(spotX, spotY, 2, 0, 2*Math.PI);
                    ctx.fillStyle = themes.lumeColor;
                    ctx.fill();
                }
            }
            
            // 探险家单独绘制3-6-9数字刻度
            if (options.style === 'explorer') {
                const numbers = [3, 6, 9];
                numbers.forEach(num => {
                    let idx = num === 12 ? 0 : num;
                    const angle = (idx * 30 - 90) * Math.PI/180;
                    const rad = radius - 28;
                    const x = centerX + Math.cos(angle) * rad;
                    const y = centerY + Math.sin(angle) * rad + 6;
                    ctx.font = `bold ${Math.floor(this.size * 0.055)}px "Arial"`;
                    ctx.fillStyle = '#ecdcaa';
                    ctx.textAlign = "center";
                    ctx.fillText(num.toString(), x, y);
                });
            }
            
            // 分钟刻度
            for (let i = 0; i < 60; i++) {
                const angle = (i * 6 - 90) * Math.PI/180;
                const start = radius - 22;
                const end = i % 5 === 0 ? radius - 10 : radius - 14;
                const x1 = centerX + Math.cos(angle) * start;
                const y1 = centerY + Math.sin(angle) * start;
                const x2 = centerX + Math.cos(angle) * end;
                const y2 = centerY + Math.sin(angle) * end;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = i % 5 === 0 ? 1.6 : 0.8;
                ctx.strokeStyle = '#c7ab61';
                ctx.stroke();
            }
        }
        
        _drawBrandAndDate() {
            const { ctx, centerX, centerY, radius, options, themes } = this;
            const crownY = centerY - radius + 36;
            ctx.fillStyle = '#e3ca7a';
            ctx.font = `bold ${Math.floor(this.size * 0.045)}px "Times New Roman"`;
            ctx.textAlign = "center";
            ctx.fillText(options.brandText, centerX, crownY + 10);
            ctx.font = `${Math.floor(this.size * 0.022)}px "Segoe UI"`;
            ctx.fillStyle = '#c2a156';
            ctx.fillText(options.modelText, centerX, crownY + 32);
            
            const dateX = centerX + radius - 42;
            const dateY = centerY + 6;
            ctx.beginPath();
            this._roundRect(dateX, dateY, 34, 24, 5);
            ctx.fillStyle = '#fdf6e3';
            ctx.fill();
            ctx.fillStyle = '#b88f3c';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            const day = new Date().getDate();
            ctx.font = `bold ${Math.floor(this.size * 0.048)}px "Times New Roman"`;
            ctx.fillStyle = '#2b2419';
            ctx.fillText(day.toString(), dateX + 17, dateY + 17);
            
            if (options.style === 'daytona') {
                ctx.font = `bold 9px "Arial"`;
                ctx.fillStyle = '#dd944a';
                ctx.fillText("CHRONOGRAPH", centerX, centerY + radius - 28);
            }
        }
        
        _drawHands() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const { ctx, centerX, centerY, themes, options } = this;
            const hourAngle = ((hours % 12) * 30 + minutes * 0.5) * Math.PI/180 - Math.PI/2;
            const minuteAngle = (minutes * 6 + seconds * 0.1) * Math.PI/180 - Math.PI/2;
            const secondAngle = (seconds * 6) * Math.PI/180 - Math.PI/2;
            const hrLen = this.radius * 0.44;
            const minLen = this.radius * 0.6;
            const secLen = this.radius * 0.7;
            
            // 时针 (奔驰针风格通用)
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(hourAngle);
            ctx.beginPath();
            ctx.moveTo(-6, -4);
            ctx.lineTo(hrLen, -4);
            ctx.lineTo(hrLen, 4);
            ctx.lineTo(-6, 4);
            ctx.fillStyle = themes.hourHandColor;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(hrLen * 0.3, -7);
            ctx.lineTo(hrLen * 0.3 + 5, 0);
            ctx.lineTo(hrLen * 0.3, 7);
            ctx.fillStyle = '#ad8640';
            ctx.fill();
            ctx.restore();
            
            // 分针
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(minuteAngle);
            ctx.beginPath();
            ctx.moveTo(-8, -3.5);
            ctx.lineTo(minLen, -3.5);
            ctx.lineTo(minLen, 3.5);
            ctx.lineTo(-8, 3.5);
            ctx.fillStyle = themes.minuteHandColor;
            ctx.fill();
            ctx.restore();
            
            // 秒针
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(secondAngle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(secLen, 0);
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = themes.secondHandColor;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(secLen-6, -3);
            ctx.lineTo(secLen+4, 0);
            ctx.lineTo(secLen-6, 3);
            ctx.fillStyle = themes.secondHandColor;
            ctx.fill();
            ctx.restore();
            
            // GMT 24小时指针 (格林尼治特色)
            if (options.style === 'gmt' && this.themes.has24hHand) {
                const gmtAngle = ((hours % 24) * 15 + minutes * 0.25) * Math.PI/180 - Math.PI/2;
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(gmtAngle);
                ctx.beginPath();
                ctx.moveTo(0, -3);
                ctx.lineTo(this.radius * 0.5, -3);
                ctx.lineTo(this.radius * 0.5, 3);
                ctx.lineTo(0, 3);
                ctx.fillStyle = '#e6692e';
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(this.radius * 0.5, -6);
                ctx.lineTo(this.radius * 0.5 + 8, 0);
                ctx.lineTo(this.radius * 0.5, 6);
                ctx.fillStyle = '#e6692e';
                ctx.fill();
                ctx.restore();
            }
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, 6, 0, 2*Math.PI);
            ctx.fillStyle = '#e9cf86';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, 2*Math.PI);
            ctx.fillStyle = '#9e762f';
            ctx.fill();
        }
        
        draw() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.size, this.size);
            this.ctx.save();
            this._drawDial();
            this._drawBezel();
            this._drawMarkers();
            this._drawBrandAndDate();
            this._drawHands();
            this.ctx.beginPath();
            this.ctx.ellipse(this.centerX-18, this.centerY-25, 35, 20, 0, 0, 2*Math.PI);
            this.ctx.fillStyle = 'rgba(255,250,210,0.06)';
            this.ctx.fill();
            this.ctx.restore();
        }
        
        animate() {
            if (!this.isRunning) return;
            this.draw();
            this.animationId = requestAnimationFrame(() => {
                setTimeout(() => this.animate(), 1000);
            });
        }
        
        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this._resizeCanvas();
            this.animate();
        }
        
        stop() {
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.isRunning = false;
        }
        
        destroy() {
            this.stop();
            if (this.resizeObserver) this.resizeObserver.disconnect();
            if (this.canvas && this.container.contains(this.canvas)) this.container.removeChild(this.canvas);
        }
    }

    // ========= 演示调用代码 =========
    function loadRolexClocks () {

		let clockContainers = document.querySelectorAll('.clock-container');


		let buttonStypes = `
		<div class="style-selector">
			<button class="style-btn active" data-style="submariner">🌊 Submariner 潜航者</button>
			<button class="style-btn" data-style="daytona">🏁 Daytona 迪通拿</button>
			<button class="style-btn" data-style="datejust">✨ Datejust 日志型</button>
			<button class="style-btn" data-style="gmt">🌍 GMT-Master II 格林尼治</button>
			<button class="style-btn" data-style="explorer">⛰️ Explorer 探险家</button>
		</div>`;

		let buttonSizes = `
		<div class="size-selector">
			<button class="size-btn" data-size="1200">超大尺寸plus++</button>
			<button class="size-btn" data-size="1000">超大尺寸plus+</button>
			<button class="size-btn" data-size="800">超大尺寸plus</button>
			<button class="size-btn" data-size="600">超大尺寸</button>
			<button class="size-btn" data-size="480">大尺寸 plus</button>
			<button class="size-btn active" data-size="400">大尺寸</button>
			<button class="size-btn" data-size="320">中尺寸</button>
			<button class="size-btn" data-size="240">小尺寸</button>
		</div>`;
		clockContainers.forEach(container => {
			container.insertAdjacentHTML('beforeend', buttonStypes);
			container.insertAdjacentHTML('beforeend', buttonSizes);
		});

        // 创建三个不同尺寸的组件实例，展示嵌入任意位置的能力
        const defaultContainer = document.getElementById('rolex-clock-default');
        const smallContainer = document.getElementById('rolex-clock-small');
        const largeContainer = document.getElementById('rolex-clock-large');
        
        // 方式1: 使用默认配置
        const clockDefault = new RolexClock(defaultContainer, {
			style: 'submariner',
            size: 400,
            brandText: 'ROLEX',
            modelText: 'SUBMARINER',
			autoStart: true // 手动控制启动
        });
        
        // 方式2: 小尺寸组件
        const clockSmall = new RolexClock(smallContainer, {
			style: 'explorer',
            size: 320,
            brandText: 'ROLEX',
            modelText: 'EXPLORER',
			autoStart: true // 手动控制启动
        });
        
        // 方式3: 大尺寸组件
        const clockLarge = new RolexClock(largeContainer, {
            size: 480,
            brandText: 'ROLEX',
            modelText: 'SUBMARINER',
			autoStart: true // 手动控制启动
        });
        
        // 自动启动 (autoStart 默认为 true，无需手动)
        // 如果想手动控制可调用 clockDefault.start()
        
        // 控制台输出辅助
        console.log('RolexClock 组件已启动，支持任意页面嵌入及动态尺寸');
		const labelElem = document.getElementById('demo-label');

		const btns = document.querySelectorAll('.style-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const style = btn.dataset.style;
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                clockDefault.setStyle(style);
                let displayMap = {
                    submariner: '潜航者 · 陶瓷圈黑盘 · 奔驰针',
                    daytona: '迪通拿 · 测速外圈 · 红色计时针',
                    datejust: '日志型 · 三角坑纹圈 · 白金刻度',
                    gmt: '格林尼治II · 双色圈 · 24小时指针',
                    explorer: '探险家 · 3/6/9夜光数字 · 经典黑盘'
                };
                //labelElem.innerText = displayMap[style] || '劳力士经典表盘';
            });
        });

		const sizeBtns = document.querySelectorAll('.size-btn');
		sizeBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				const size = btn.dataset.size;
				sizeBtns.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				clockDefault.setSize(Number(size));
			});
		});
    
    }