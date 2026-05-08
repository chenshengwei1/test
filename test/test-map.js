class MapHanlder{
    constructor(){
        this.id='location';
        this.name='map';
		this.showPositionFn = {isLoaded:false, listeners:[]};
    }

    create(){

        let body = `
				<style>
					#mapholder{
						width:100%;
						heigth:100%;
					}
					.map-tools{
						display:flex;
						flex-wrap:wrap;
					}
					.result li{
						cursor: pointer;
					}
					.input-item-result li:hover{
						color: #337ab7;
					}
					#gaode-map-container {width:1300px; height: 1200px; }  
				</style>
				<p class="location-1">您的坐标：</p>
				<p class="demo-location"></p>
				<div id="mapholder" ></div>
				
				<div class="gaode">
					<link rel="stylesheet" href="https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css" />
					<div id="gaode-map-container" style="display: inline-block;"></div>
					<div class="map-tools" style="width:19rem;display: inline-block;position: absolute;margin-left:20px">
						<div class="feature-input-card" >
							<h4>设置地图显示要素（Features）</h4>
							<div id="map-features">
							  <div class="input-item">
								<input type='checkbox' name='mapStyle' value='bg' checked>
								<span class="input-text">区域面（bg）</span>
							  </div>
							  <div class="input-item">
								<input type='checkbox' name='mapStyle' value='road' checked>
								<span class="input-text">道路（road）</span>
							  </div>
							  <div class="input-item">
								<input type='checkbox' name='mapStyle' value='building' checked>
								<span class="input-text">建筑物（building）</span>
							  </div>
							  <div class="input-item">
								<input type='checkbox' name='mapStyle' value='point' checked>
								<span class="input-text">标注（point）</span>
							  </div>
							</div>
						  </div>
						  
						  <div class="item-input-card" >
							<label style='color:grey'>行政区边界查询</label>
							<div class="input-item">
								<div class="input-item-prepend">
									<span class="input-item-text" >行政级别</span>
								</div>
								<select class="level">
									<option value="country">国家</option>
									<option value="province">省/直辖市</option>
									<option value="city" selected="selected">市</option>
									<option value="district">区/县</option>
									<option value="biz_area">商圈</option>
								</select>
									
							</div>
							<div class="input-item">
								<div class="input-item-prepend">
									<span class="input-item-text" >名称/adcode</span>
								</div>
								<input class='district' type="text" value='广州'>
							</div>
							<input type="button" class="btn draw" value="查询" />
							<div class="result">
							</div>
						</div>
						<div class="subdistrict-input-card">
							<h4>下属行政区查询</h4>
							<div class="input-item">
								<div class="input-item-prepend"><span class="input-item-text" >省市区</span></div>
								<select class='province' style="width:100px"></select>
							</div>
							<div class="input-item">
								<div class="input-item-prepend"><span class="input-item-text" >地级市</span></div>
								<select class='city' style="width:100px"></select>
							</div>
							<div class="input-item">
								<div class="input-item-prepend"><span class="input-item-text" >区县</span></div>
								<select class='district' style="width:100px"></select>
							</div>
							<div class="input-item">
								<div class="input-item-prepend"><span class="input-item-text" >街道</span></div>
								<select class='street' style="width:100px"></select>
							</div>
						</div>
					</div>
					<script src="https://cache.amap.com/lbs/static/es5.min.js"></script>
					<script src="https://webapi.amap.com/maps?v=1.4.15&key=9fdcc8ad88f884a55d4b8ab328c50254&plugin=AMap.DistrictSearch"></script>
					 <script  type="text/javascript" src="amap.js"></script>
				</div>`;
        $('#part-'+this.id).html(body);
        this.addLisenter();
    }

	addLisenter(){
		
		

		//绑定check`box点击事件
		var polygons=[];



		let setMap = ()=>{
			if (typeof AMap !== 'undefined'){
				//加载行政区划插件
				//实例化DistrictSearch
				var opts = {
					subdistrict: 1,   //获取边界不需要返回下级行政区
					extensions: 'all',  //返回行政区边界坐标组等具体信息
					level: 'district',  //查询行政级别为 市
					showbiz: false	// 可选为true/false，为了能够精准的定位到街道，特别是在快递、物流、送餐等场景下，强烈建议将此设置为false
				};

				this.map = new AMap.Map('gaode-map-container', {
					zoom: 14,
					features: ['bg', 'road', 'building', 'point']
				});
				
				new FeaturesShowDemo(this.map).bind('.feature-input-card');


				this.districtShowDemo = new DistrictShowDemo(this.map, new AMap.DistrictSearch(opts));
				this.districtShowDemo.bind('.subdistrict-input-card');
				this.districtShowDemo.bindItem('.item-input-card');
				this.mapCtrl = {
					map:this.map,
					districtShow:this.districtShowDemo
				}
				//runMap(this.showPositionFn.position);
				this.getLocation();
			}else{
				setTimeout(() => {
					setMap();
				}, 100);
			}
		}
		setMap();
	}

	getLocation()
    {
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition((position)=>{
				this.showPosition(position);
			});
        }
        else{
            x.innerHTML="Geolocation is not supported by this browser.";
        }
    }

	showPosition(position)
    {
        this.showPositionFn.isLoaded = true;
        this.showPositionFn.position = position;
        for(let fn of this.showPositionFn.listeners){
            fn(position);
        }
        let coords = position.coords;
        $('.demo-location').append(`<li>coords.latitude ${coords.latitude}	十进制数的纬度</li>`);
        $('.demo-location').append(`<li>coords.longitude ${coords.longitude}	十进制数的经度</li>`);
        $('.demo-location').append(`<li>coords.accuracy ${coords.accuracy || '未知'}	位置精度</li>`);
        $('.demo-location').append(`<li>coords.altitude ${coords.altitude || '未知'}	海拔，海平面以上以米计</li>`);
        $('.demo-location').append(`<li>coords.altitudeAccuracy ${coords.altitudeAccuracy || '未知'}	位置的海拔精度</li>`);
        $('.demo-location').append(`<li>coords.heading ${coords.heading || '未知'}	方向，从正北开始以度计</li>`);
        $('.demo-location').append(`<li>coords.speed ${coords.speed || '未知'}	速度，以米/每秒计</li>`);
        $('.demo-location').append(`<li>timestamp ${new Date(position.timestamp)}	响应的日期/时间</li>`);
        $('.demo-location').append(`<li>以上</li>`);
        
        let lat=position.coords.latitude;
        let lon=position.coords.longitude;
		if (typeof google !=='undefined'){
			let latlon=new google.maps.LatLng(lat, lon)
			let mapholder=document.getElementById('mapholder')
			mapholder.style.height='250px';
			mapholder.style.width='500px';
	
			var myOptions={
				center:latlon,
				zoom:14,
				mapTypeId:google.maps.MapTypeId.ROADMAP,
				mapTypeControl:false,
				navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL},
				panControl:true,
				zoomControl:true,
				mapTypeControl:true,
				mapTypeControlOptions: {
					style:google.maps.MapTypeControlStyle.DROPDOWN_MENU
				},
				scaleControl:true,
				streetViewControl:true,
				overviewMapControl:true,
				rotateControl:true
			};
			var map=new google.maps.Map(document.getElementById("mapholder"),myOptions);
			var marker=new google.maps.Marker({
				position:latlon,
				map:map,
				animation:google.maps.Animation.BOUNCE,
				title:"You are here!"
			});
		}
    }

	runMap(position){
		let lat=position.coords.latitude;
		let lon=position.coords.longitude;
	}
}

window._AMapSecurityConfig = {
    securityJsCode:'a1920bdcf5891541e1c7535e89f6f5f9',
}




class FeaturesShowDemo{
	map;
	features = [{value:'bg',enable:true},{value:'road',enable:true},{value:'building',enable:true},{value:'point',enable:true}];
	constructor(map){
		this.map = map;
		this.map.setFeatures(this.features.map(e=>e.value));
	}

	//设置地图显示要素
	setMapFeatures(input) {
		let features = [];
		let f = this.features.find(e=>e.value==input.value);
		f && (f.enable = input.checked);
		this.map.setFeatures(this.features.filter(e=>e.enable).map(e=>e.value));
	}

	bind(selector){
		//绑定checkbox点击事件
		$(selector).find('input').on('click', (event)=>{
			this.setMapFeatures(event.target);
		})
	}
}






class DistrictShowDemo{
	map;
	district; 
	citySelect;
	districtSelect;
	areaSelect;
	polygons = []; 
	citycode;

	itemCartSelector;

	constructor(map, district){
		this.map=map;
		this.district=district;
		this.district.search('中国', (status, result)=>{
		if(status=='complete'){
			this.getData(result.districtList[0]);
		}
	});
	}

	setCity(city){
		this.citySelect = citySelect;
	}
	setDistrict(district){
		this.districtSelect = district;
	}
	setStreet(street){
		this.areaSelect = street;
	}

	getData(data, level) {
		var bounds = data.boundaries;
		if (bounds) {
			for (var i = 0, l = bounds.length; i < l; i++) {
				var polygon = new AMap.Polygon({
					map: this.map,
					strokeWeight: 1,
					strokeColor: '#0091ea',
					fillColor: '#80d8ff',
					fillOpacity: 0.2,
					path: bounds[i]
				});
				this.polygons.push(polygon);
			}
			this.map.setFitView();//地图自适应
		}
	
		//清空下一级别的下拉列表
		if (level === 'province') {
			this.citySelect.innerHTML = '';
			this.districtSelect.innerHTML = '';
			this.areaSelect.innerHTML = '';
		} else if (level === 'city') {
			this.districtSelect.innerHTML = '';
			this.areaSelect.innerHTML = '';
		} else if (level === 'district') {
			this.areaSelect.innerHTML = '';
		}

		var subList = data.districtList;
		if (subList) {
			var contentSub = new Option('--请选择--');
			var curlevel = subList[0].level;
			var curList =  document.querySelector('select.' + curlevel);
			curList.add(contentSub);
			for (var i = 0, l = subList.length; i < l; i++) {
				var name = subList[i].name;
				var levelSub = subList[i].level;
				var cityCode = subList[i].citycode;
				contentSub = new Option(name);
				contentSub.setAttribute("value", levelSub);
				contentSub.center = subList[i].center;
				contentSub.adcode = subList[i].adcode;
				curList.add(contentSub);
			}
		}
		
	}

	search(obj) {
		//清除地图上所有覆盖物
		for (var i = 0, l = this.polygons.length; i < l; i++) {
			this.polygons[i].setMap(null);
		}
		var option = obj[obj.options.selectedIndex];
		var keyword = option.text; //关键字
		var adcode = option.adcode;
		this.district.setLevel(option.value); //行政区级别
		this.district.setExtensions('all');
		//行政区查询
		//按照adcode进行查询可以保证数据返回的唯一性
		this.district.search(adcode, (status, result)=>{
			if(status === 'complete'){
				this.getData(result.districtList[0],obj.id);
			}
		});
		if (option.center){
			this.map.setCenter(option.center);
		}
	}

	setCenter(obj){
		this.map.setCenter(obj[obj.options.selectedIndex].center)
	}

			
	drawBounds(level, districtVal) {

		//行政区查询
		this.district.setLevel(level);
		this.district.search(districtVal, (status, result)=> {
			if(status !== 'complete'){return}
			
			let resultEle = $(this.itemCartSelector + ' .result');
			resultEle.html('');
			if (result.districtList.length > 1){
				
				for(let districtInfo of result.districtList){
					let displayDistrict = districtInfo.name + ' ' + districtInfo.level+ ' ' + districtInfo.citycode+ ' ' + districtInfo.adcode;
					resultEle.append(`<li citycode="${districtInfo.citycode}">${displayDistrict}</li>`);
				}
				resultEle.find('li').on('click', (e)=>{
					let cityCode = $(e.target).attr('citycode');
					let districtInfo = result.districtList.find(e => {return e.citycode == cityCode});
					if (districtInfo){
						this.drawBoundsByDistrict(districtInfo);
					}
				})
			}
			
			this.drawBoundsByDistrict(result.districtList[0]);
		});
	}

	drawBoundsByDistrict(districtInfo){
		this.map.remove(this.polygons)//清除上次结果
		this.polygons = [];
		
		var bounds = districtInfo.boundaries;
		if (bounds) {
			for (var i = 0, l = bounds.length; i < l; i++) {
				//生成行政区划polygon
				var polygon = new AMap.Polygon({
					strokeWeight: 1,
					path: bounds[i],
					fillOpacity: 0.4,
					fillColor: '#80d8ff',
					strokeColor: '#0091ea'
				});
				this.polygons.push(polygon);
			}
		}
		this.map.add(this.polygons)
		this.map.setFitView(this.polygons);//视口自适应
	}

	bindItem(selector){
		this.itemCartSelector = selector;
		$(selector + ' .btn').on('click', ()=>{
			let level = $(selector + ' .level').val();
			let district = $(selector + ' .district').val();
			this.drawBounds(level, district);
		})
	}

	bind(selector){
		$(selector + ' select').on('change', (event)=>{
			this.search(event.target);
		})
		this.citySelect = $(selector+' .city')[0];
		this.districtSelect = $(selector+' .district')[0];
		this.areaSelect = $(selector+' .street')[0];
	}
}

