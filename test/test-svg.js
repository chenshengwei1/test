class SVGHandler extends TestPartHanlder{
    constructor(){
        super();
        this.id = 'svgcanvas2';
        this.title = 'SVG Demo';
        this.name = 'SVG Demo';
    }

    getStyle(){
        return `.svg-btn-menu {
						list-style: none;
					}

					.tabitem6-container :not(svg){
						fill: rgba(0, 0, 0, 0);
					}

					#svg_174695{
						fill: rgba(5, 0, 0);
					}

					.svg-select{
					    fill: none;
    					stroke: red;
					}

					.svg-btn-menu li {
						cursor: pointer;
					}

					.ctrl-svn-path span {
						min-width: 100px;
					}

					.icon {
						font-size: 28px;
						font-stretch: 100%;
						font-style: normal;
						font-weight: 400;
						font-variant-caps: normal;
						color: rgb(153, 153, 153);
						cursor: pointer;
					}

					

					.icon i {
						font-style: normal !important;
					}`;
    }

    getBody(){
        return `
				<style>
                    ${this.getStyle()}
				</style>
				<div class="tabitem6-container">
					<div id="mousemoveto"></div>
					<svg xmlns="http://www.w3.org/2000/svg" width="50%" height="675" stroke="null"
						id="drawing-container">
						<g stroke="null" id="main-group">
							<ellipse fill="none" cx="0" cy="0" id="svg_5" rx="149" ry="148" stroke="#000" transform="translate(406,337.5)"/>
							<ellipse fill="none" cx="0" cy="0" id="svg_7" rx="72" ry="72" stroke="#000" transform="translate(406,337.5)"/>
							<ellipse fill="none" cx="0" cy="0" id="svg_9" rx="15" ry="13" stroke="#000" transform="translate(406,337.5)"/>
							<path xmlns="http://www.w3.org/2000/svg" stroke="#000" fill="none"
								d="m74.99998,606.36001l254.65941,-154.79019l267.5753,-3.47599l91.21885,-289.66586l75.00217,-3.47599l-30.40629,327.90175l-599.0038,12.7453l-16.21668,-347.59903l33.44692,1.738l-76.27588,456.62202l0,-0.00001z"
								id="svg_16" />
							<path fill="none" d="M74,206 h35 A 15 15 0 0 0 500 400" stroke="#F00" />
							<path fill="black" id="svg_174695"
								d="M917.333333 552.53333367l-87.466666-87.466667c34.133333-32 66.133333-68.266667 91.733333-108.8 8.533333-14.933333 4.266667-34.133333-10.666667-44.8-14.933333-8.533333-34.133333-4.266667-44.8 10.666667-76.8 125.866667-209.066667 200.533333-356.266666 200.533333-145.066667 0-279.466667-74.666667-354.133334-198.4-8.533333-14.933333-29.866667-19.2-44.8-10.666667-14.933333 8.533333-19.2 29.866667-10.666666 44.8 25.6 40.533333 55.466667 76.8 91.733333 108.8l-85.333333 85.333334c-12.8 12.8-12.8 32 0 44.8 6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333l91.733333-91.733334c38.4 25.6 81.066667 46.933333 125.866667 59.733334l-34.133333 130.133333c-4.266667 17.066667 6.4 34.133333 23.466666 38.4 2.133333 0 6.4 2.133333 8.533334 2.133333 14.933333 0 27.733333-8.533333 29.866666-23.466666l36.266667-132.266667c25.6 4.266667 51.2 6.4 78.933333 6.4 27.733333 0 55.466667-2.133333 83.2-6.4l36.266667 132.266667c4.266667 14.933333 17.066667 23.466667 29.866667 23.466666 2.133333 0 6.4 0 8.533333-2.133333 17.066667-4.266667 27.733333-21.333333 23.466667-38.4L661.333333 563.19999967c44.8-12.8 85.333333-34.133333 123.733334-59.733333l91.733333 91.733333c6.4 6.4 14.933333 8.533333 23.466667 8.533334s17.066667-2.133333 23.466666-8.533334c6.4-10.666667 6.4-29.866667-6.4-42.666666z"
								p-id="6404" data-spm-anchor-id="a313x.7781069.0.i0"></path>
							<path fill="none"
								d="M450 134 l0 0 l-1 0 l82 45 l-93 -25 c4.266667 14.933333 17.066667 23.466667 29.866667 23.466666 2.133333 0 6.4 0 8.533333-2.133333 17.066667-4.266667 27.733333-21.333333 23.466667-38.4L661.333333 563.19999967z"
								id="svg_174692" stroke="#000" style="stroke: red;"></path>
							<!--<path d="M10 315
                           L 110 215
                           A 30 50 0 0 1 162.55 162.45
                           L 172.55 152.45
                           A 30 50 -45 0 1 215.1 109.9
                           L 315 10" stroke="black" fill="green" stroke-width="2" fill-opacity="0.5"/>-->
						</g>
						<g stroke="#FF0000" id="assist"></g>
					</svg>
					<div class="svg-ctrl-panel" id="svg-ctrl-panel" width="50%">
						<ul class="svg-btn-menu">
							<a class="icon">
								<i class="icon-round" onclick="createSvgEllipse()"></i>
								<i class="icon-zhankai" onclick="createSvgPath()"></i>
								<i class="icon-huancheng" onclick="drawpath(event)"></i>
							</a>
						</ul>
						<section>
							<h2>Path 1
								<a class="icon">
									<i class="icon-del"></i>
								</a>
							</h2>

							<ul class="ctrl-svn-path">
								<div><span>Moveto</span><input name="Moveto" type="select" value=""
										required="required" /></div>
								<div><span>Lineto</span><input name="Lineto" type="select" value=""
										required="required" />
									<a class="icon">
										<i class="icon-del"></i>
										<i class="icon-plus"></i>
									</a>
								</div>
								<div><span>Curveto</span><input name="Curveto" type="select" value=""
										required="required" />
									<a class="icon">
										<i class="icon-del"></i>
										<i class="icon-plus"></i>
									</a>
								</div>
								<div><span>Arcto</span><input name="Arcto" type="select" value="" required="required" />
									<a class="icon">
										<i class="icon-del"></i>
										<i class="icon-plus"></i>
									</a>
								</div>
								<div><span>ClosePath</span><input name="ClosePath" type="checkbox" value=""
										required="required" /></div>
							</ul>
						</section>
					</div>
				</div>

				<div id="pointer-location" class="pointer-location"></div>
				<div id="fill-stroke" class="fill-stroke" style="display:none">
					<div class="setting">
						<div property="fill"><span>Fill:</span><input name="Fill" type="color" value="red"
								required="required" class="content" /><input name="Fill-checkbox" type="checkbox"
								value="Fill" /></div>
						<div property="stroke"><span>Stroke:</span><input name="Stroke" type="color" value="blue"
								required="required" class="content" /><input name="Stroke-checkbox" type="checkbox"
								value="Stroke" /></div>
						<div property="opacity"><span>Opacity:</span><input name="Opacity" type="range" value="1"
								min="0" max="1000" class="content" /> <input name="Opacity-checkbox" type="checkbox"
								value="Opacity" /></div>
						<div property="type"><span>Change Type</span>
							<csw-select name="type" type="select" value="Line" items="getCmdTypes" />
						</div>
					</div>

				</div>
			`
    }

    addLisenter(){
        $('#drawing-container').on('click','path', (event)=>{
			$('.svg-select').removeClass('svg-select');
			$(event.target).addClass('svg-select');
			//event.stopPropagation();
		})


		const svgImage = document.getElementById(this.svgId);
		let moveOption = {
			isPanning : false,
			moveShape: null,
			scale: 1,
			endPoint: null,
			startPoint: null,
			shapeTransform: null,
			oldFill: null,
			start:function(x, y, target){
				this.startPoint = {x:x,y:y};
				this.isPanning = true;
				this.moveShape = target;
				this.oldFill = target.style.fill;
				target.style.fill = '#be8d8d63';
				let transform = target.getAttribute('transform');
				if (transform && transform.indexOf('translate(') != -1){
					let match = /translate\(([-]?\d+?\.?\d+),([-]?\d+?\.?\d+)\)/.exec(transform);
					if (match){
						let oldTrans = {x:+match[1], y:+match[2]};
						this.startPoint.x = this.startPoint.x - oldTrans.x;
						this.startPoint.y = this.startPoint.y - oldTrans.y;
					}
				}
			}, 
			move:function(x, y){
				if (this.isPanning){
					let endPoint = {x:x,y:y};
					var dx = (endPoint.x - this.startPoint.x)/this.scale;
					var dy = (endPoint.y - this.startPoint.y)/this.scale;
					//var movedViewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
					//svgImage.setAttribute('viewBox', `${movedViewBox.x} ${movedViewBox.y} ${movedViewBox.w} ${movedViewBox.h}`);
					this.moveShape.setAttribute('transform', `translate(${dx},${dy})`);
				}
			},
			end : function(x, y){
				if (this.isPanning){ 
					this.isPanning = false;
					this.moveShape.style.fill = this.oldFill;
					let endPoint = {x:x,y:y};
					var dx = (endPoint.x - this.startPoint.x)/this.scale;
					var dy = (endPoint.y - this.startPoint.y)/this.scale;
					//viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
					//svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
					this.moveShape.setAttribute('transform', `translate(${dx},${dy})`);
				}
			}
		}
        const svgContainer = document.getElementById('drawing-container');
		svgContainer.onmousedown = (e)=>{
			if ($(e.target).is('svg')){
				return;
			}

			$('.svg-select').removeClass('svg-select');
			$(e.target).addClass('svg-select');

			if (moveOption){
				moveOption.start(e.x, e.y, e.target);
				return;
			}
            moveOption.isPanning = true;
			moveOption.moveShape = e.target;
			let transform = moveShape.getAttribute('transform');
			moveOption.oldFill = moveOption.moveShape.style.fill;
			moveOption.moveShape.style.fill = '#be8d8d63';
			if (transform && transform.indexOf('translate(') != -1){
				let match = /translate\(([-]?\d+?\.?\d+),([-]?\d+?\.?\d+)\)/.exec(transform);
				if (match){
					moveOption.shapeTransform = {x:+match[1], y:+match[2]};
				}
			}
            let startPoint = {x:e.x,y:e.y};
			moveOption.startPoint = startPoint;
			if (shapeTransform != null){
				startPoint.x = startPoint.x - shapeTransform.x;
				startPoint.y = startPoint.y - shapeTransform.y;
			}
        }

        svgContainer.onmousemove = (e)=>{
			if (moveOption){
				moveOption.move(e.x, e.y);
				return;
			}
            if (isPanning){
                let endPoint = {x:e.x,y:e.y};
                var dx = (endPoint.x - startPoint.x)/scale;
                var dy = (endPoint.y - startPoint.y)/scale;
                //var movedViewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
                //svgImage.setAttribute('viewBox', `${movedViewBox.x} ${movedViewBox.y} ${movedViewBox.w} ${movedViewBox.h}`);
				moveShape.setAttribute('transform', `translate(${dx},${dy})`);
            }
        }

        svgContainer.onmouseup = function(e){
			if (moveOption){
				moveOption.end(e.x, e.y);
				return;
			}
            if (isPanning){ 
                endPoint = {x:e.x,y:e.y};
                var dx = (endPoint.x - startPoint.x)/scale;
                var dy = (endPoint.y - startPoint.y)/scale;
                //viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
                //svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
				moveShape.setAttribute('transform', `translate(${dx},${dy})`);
                moveOption.isPanning = false;
				moveOption.moveShape.style.fill = oldFill;
				moveShape = null;
				startPoint = null;
            }
        }
    }
}