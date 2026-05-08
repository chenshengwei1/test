// autocomplete
class AutoComplete1{
	constructor(inputElementId,autoArray){
		this.inputElementId=inputElementId;
		this.autoElementId="auto_997_"+this.inputElementId;
		this.obj=document.getElementById(inputElementId);        //输入框
		this.autoObj = this.createAutoObj();//DIV的根节点
		this.value_arr=autoArray;        //不要包含重复值
		this.index=-1;          //当前选中的DIV的索引
		this.search_value="";   //保存当前搜索的字符  
		this.createApi();
	}
	
	getAutoCompleteValues(){
		if (typeof this.value_arr == 'function'){
			return this.value_arr();
		}
		return this.value_arr;
	}
	
	createAutoObj(){
		let autoObj = document.getElementById(this.autoElementId);
		if (autoObj){
			return autoObj;
		}
		var div = document.createElement("div");
		div.className="auto_hidden";
		div.id=this.autoElementId;
		document.body.appendChild(div);
		return document.getElementById(this.autoElementId);
	}
	
	init(){
		this.autoObj.style.left = this.obj.offsetLeft + "px";
		this.autoObj.style.top  = this.obj.offsetTop + this.obj.offsetHeight + "px";
		this.autoObj.style.width= this.obj.offsetWidth - 2 + "px";//减去边框的长度2px
		this.autoObj.style.height= "auto";//减去边框的长度2px
		this.autoObj.style.maxHeight= "400px";//减去边框的长度2px
		this.autoObj.style.fontSize= '14';
	}
	
	deleteDIV(){
		while(this.autoObj.hasChildNodes()){
			this.autoObj.removeChild(this.autoObj.firstChild);
		}
		this.autoObj.className="auto_hidden";
	}
	
	setValue(target){
		this.obj.value=target.seq;
		this.autoObj.className="auto_hidden";
		$(this.obj).change();
	}
	
	autoOnmouseover(target, _div_index){
		
		this.index=_div_index;
		var length = this.autoObj.children.length;
		for(var j=0;j<length;j++){
			if(j!=_div_index ){       
				this.autoObj.childNodes[j].className='auto_onmouseout';
			}else{
				this.autoObj.childNodes[j].className='auto_onmouseover';
				this.obj.value=target.seq;
			}
		}            
		
	}
	
	changeClassname(length){
		for(var i=0;i<length;i++){
			if(i!=this.index ){       
				this.autoObj.childNodes[i].className='auto_onmouseout';
			}else{
				this.autoObj.childNodes[i].className='auto_onmouseover';
				this.obj.value=this.autoObj.childNodes[i].seq;
			}
		}
	}
	
	//响应键盘
	pressKey(event){
		var length = this.autoObj.children.length;
		//光标键"↓"
		if(event.keyCode==40){
			++this.index;
			if(this.index>length){
				this.index=0;
			}else if(this.index==length){
				this.obj.value=this.search_value;
			}
			this.changeClassname(length);
		}
		//光标键"↑"
		else if(event.keyCode==38){
			this.index--;
			if(this.index<-1){
				this.index=length - 1;
			}else if(this.index==-1){
				this.obj.value=this.search_value;
			}
			this.changeClassname(length);
		}
		//回车键
		else if(event.keyCode==13){
			this.autoObj.className="auto_hidden";
			this.index=-1;
		}else{
			this.index=-1;
		}
	}
	//程序入口
	start(event){
		if(event.keyCode!=13&&event.keyCode!=38&&event.keyCode!=40){
			this.init();
			this.deleteDIV();
			this.search_value=this.obj.value;
			var valueArr=this.getAutoCompleteValues();
			valueArr.sort();
			if(this.obj.value.replace(/(^\s*)|(\s*$)/g,'')==""){ 
				return; 
			}//值为空，退出
			
			try{ 
				var reg = new RegExp("(" + this.obj.value + ")","i");
			}
			catch (e){ 
				return; 
			}
			var div_index=0;//记录创建的DIV的索引
			let matchItems = [];
			for(var i=0;i<valueArr.length;i++){
				if(reg.test(valueArr[i])){
					matchItems.push(valueArr[i]);
				}
			}
			matchItems = matchItems.sort((a, b)=>{
				return reg.exec(a).index - reg.exec(b).index;
			});
			for(var i=0;i<matchItems.length;i++){
				var div = document.createElement("div");
				div.className="auto_onmouseout autocompleteitem";
				div.seq=matchItems[i];
				div.title=matchItems[i];
				div.innerHTML=matchItems[i].replace(reg,"<strong>$1</strong>");//搜索到的字符粗体显示
				this.autoObj.appendChild(div);
				this.autoObj.className="auto_show";
				div_index++;
			}
			this.bindAutoCompleteItemEvent();
		}
		this.pressKey(event);
		window.οnresize=this.bind(this,function(){this.init();});
	}
	
	bindAutoCompleteItemEvent(){
		$('.autocompleteitem').on('click', (e)=>{
			this.setValue(e.target);
		})
		
		$('.autocompleteitem').on('mοuseοver', (e)=>{
			this.autoOnmouseover(e.target, div_index);
		})
	}
	
	createApi(){
		$('#'+this.inputElementId).blur(function () {//点击下拉选项得到获取值
			//alert($('#p_apiName').val());点击获取选择的值。
		});
		
		
		$('#'+this.inputElementId).on('keyup', (e)=>{
			this.start(e)
		})
	}
	
	bind(object, fun){
		return function() {
			return fun.apply(object, arguments);
		}
	}
}

