class SFObjectSearch{
	constructor(schemas){
		this.detailsHistories = [];
	}
	
	start(){
		this.bindEvent();
	}
	
	get schemas(){
		let checked  = $('.schemagrp [name=schema]:checked');
		if (checked.val()=='Ruby'){
			return window.rubyschemas;
		}else{
			return window.hkthschemas;
		}
	}
	
	bindEvent(){
		$('.schemagrp').on('change', (e)=>{
			let checked  = $('.schemagrp [name=schema]:checked');
			if (checked.val()=='Ruby'){
				this.schemas = window.rubyschemas;
			}else{
				this.schemas = window.hkthschemas;
			}
		})
		
		$('#fieldssearch').on('change', ()=>{
			this.search()
		})

		$('.searchp input').on('change', ()=>{
			this.search()
		})

		$('#referecesearch').on('change', ()=>{
			this.refefrencesearch()
		})
	}
	
	myschemas(){
		let s = [];
		for (let r in this.schemas){
			s.push({label:r, value:r});
		}
		return s;
	}
	
	myfields(o){
		let s = [];
		for (let r of this.schemas[o] || []){
			s.push(r);
		}
		return s;
	}
	
	isFilterd(r){
		let includeMdt = $('#inmdtsearch').is(':checked');
		let includEvent = $('#ineventsearch').is(':checked');
		let includHis = $('#inhissearch').is(':checked');
		let includshare = $('#insharesearch').is(':checked');
		let includchangeevent = $('#inchangeeventsearch').is(':checked');
		let incustomsearch = $('#incustomsearch').is(':checked');
		if (!includeMdt && r.endsWith('__mdt')){
			return true;
		}
		if (!includEvent && r.endsWith('__e')){
			return true;
		}
		if (!includHis && r.endsWith('__history')){
			return true;
		}
		if (!includshare && r.endsWith('__share')){
			return true;
		}
		if (!includchangeevent && (r.endsWith('__changeevent') || r.endsWith('changeevent'))){
			return true;
		}
		if (!incustomsearch && r.endsWith('__c')){
			return true;
		}
		return false;
	}
	
	search(){
		let s = [];
		$('.recordsnumber').html(s.length);
		let fieldval = $('#fieldssearch').val().trim().toLocaleLowerCase();
		let objval = $('#objectsearch').val().trim().toLocaleLowerCase();
		let extVal = $('#exobjectsearch').val().trim() || '-';
		if (fieldval=='' && objval==''){
			$('.objsearchresult').html('');
			return;
		}
		
		let schemas = this.schemas;
		
		let keys = Object.keys(this.schemas).sort();
		let machWord = new RegExp(extVal);
		for (let r of keys){
			if (this.isFilterd(r)){
				continue;
			}
			if (r.toLocaleLowerCase().indexOf(objval)>=0 || schemas[r].label.toLocaleLowerCase().indexOf(objval)>=0 || objval==''){
				if (fieldval==''){
					let sortIndex = r.toLocaleLowerCase().indexOf(objval);
					s.push({t:r.trim(),tn:schemas[r].label, l:'', v:'',sortIndex:sortIndex});
				}else{
					for (let f of schemas[r].fields){
						let l = f.label.trim();
						let n = f.name.trim();
						let sortIndex = l.toLocaleLowerCase().indexOf(fieldval);
						if (l.toLocaleLowerCase().indexOf(fieldval)>=0||n.toLocaleLowerCase().indexOf(fieldval)>=0 || fieldval==''){
							if (machWord.test(l)){
								continue;
							}
							s.push({tn:schemas[r].label, t:r.trim(), l:f.label.trim(), v:f.name.trim(), type:f.type,sortIndex:sortIndex});
						}
					}
				}
				
			}
		}
		
		$('.recordsnumber').html(s.length);
		let result = s.sort(this.resultSort).map(t => `<li va="${t.t}" vb="${t.l}"><span>${t.l}</span> <span>(${t.v||'table'})</span> <span>-  ${t.t}</span><span class="tname">(${t.tn})</span> </li>`).join('');
		
		this.updateSearchResult(result);
	}
	
	
	refefrencesearch(){
		let schemas = this.schemas;
		let s = [];
		$('.recordsnumber').html(s.length);
		let val = $('#referecesearch').val().trim().toLocaleLowerCase();
		if (val==''){
			return;
		}
		let objval='';
		let keys = Object.keys(schemas).sort();
		for (let r of keys){
			if (this.isFilterd(r)){
				continue;
			}
			if (r.toLocaleLowerCase().indexOf(objval)>=0 || objval==''){
				
				for (let f of schemas[r].fields){
					let l = f.reference || '';
					let sortIndex = l.toLocaleLowerCase().indexOf(val);
					if (l.toLocaleLowerCase() == val){
						s.push({tn:schemas[r].label, t:r.trim(), l:f.label.trim(), v:f.name.trim(), type:f.type,sortIndex:sortIndex});
					}
				}
			}
		}
		
		$('.recordsnumber').html(s.length);
		let result = s.sort(this.resultSort).map(t => `<li va="${t.t}" vb="${t.l}"><span>${t.l}</span> <span>(${t.v||'table'})</span> <span>-  ${t.t}</span> </li>`).join('');
		this.updateSearchResult(result);
		
	}
	
	updateSearchResult(result){
		$('.objsearchresult').html(result);
		this.bindSearchResultEvent();
		
	}
	
	bindSearchResultEvent(){
		$('.objsearchresult li').on('click', (e)=>{
			let target = e.currentTarget;
			let tabName = $(target).attr('va');
			let fieldName = $(target).attr('vb');
			this.handleDetail(tabName.toLocaleLowerCase(),'',fieldName);
		})
	}

	handleDetail(tabName, oldtableName, selectedText, option){
		let schemas = this.schemas;
		if (!tabName || !schemas[tabName]){
			return;
		}
		oldtableName = oldtableName || '';
		let s = [];
		$('.detailearchresult').html('');
		
		let keys = schemas[tabName] || {};
		for (let f of schemas[tabName].fields||[]){
			s.push({tl:schemas[tabName].label,t:tabName, l:f.label.trim(), v:f.name.trim(),type:f.type,f:f.reference});
		}
		
		let ref = (t)=>{
			if (t.f){
				if (t.f.indexOf('(') != -1){
					let multipleRefs = t.f.replace('(','').replace(')','').split(',');
					return multipleRefs.map(e=>`<span class="item31" va="${e.trim()}"> - ${e}</span>`).join(',');
				}
				return `<span class="item31" va="${t.f}"> - ${t.f}</span>`
			}else{
				return '';
			}
		}
		
		let isSort = (headName)=>{
			return (option?.sortBy?.asc && option?.sortBy[headName])?'asc':''
		}
		if (option && option.sortBy){
			s.sort((a, b) =>{
				let result = 0;
				if (option.sortBy.label){
					result = a.l.localeCompare(b.l);
				}
				if (option.sortBy.name){
					result = a.v.localeCompare(b.v);
				}
				if (option.sortBy.type){
					result = a.type.localeCompare(b.type);
				}
				return option.sortBy.asc ? result:-result;
			})
		}
		let result = s.map(t => `<div class="dataline resultdetail ${selectedText&&(selectedText==t.l||selectedText==t.v) ?'selecteditem':''}" value="${t.l}">
		<span class="item1">${t.l}</span> 
		<span class="item2">${t.v}</span> 
		<span class="item3">${t.type}${ref(t)}</span> 
		</div>`);
		result.unshift(`
		<h3>SOQL:</h3>
		<div class="soql"></div>
		<h1>${s[0].tl}</h1>
		<h3>${s[0].t}<span class="title-ccount">(${s.length})</span></h3>
		<div class="resultdetail detailhead" ><span class="item4">Prevous Table</span>
		<span class="item5 item31" va="${oldtableName}">${oldtableName}</span></div>
		
			
		<div class="resultdetail detailhead datahead" value="">
		<span class="item1 ${isSort('label')}">Label</span> 
		<span class="item2  ${isSort('name')}">Value</span> 
		<span class="item3  ${isSort('type')}">Type</span>
		</div>`);
		result = result.join('');
		
		$('.detailearchresult').html(result);
		$('.item31').on('click', (e)=>{ 
			let target = e.currentTarget;
			let tabName2 = $(target).attr('va');
			if ($(target).is('.item5')){
				tabName2 = this.detailsHistories.pop();
			}else{
				this.detailsHistories.push(tabName);
			}
			this.handleDetail(tabName2.toLocaleLowerCase(), this.detailsHistories.length>0?this.detailsHistories[this.detailsHistories.length-1]:'');
		})
		$('h3').on('click', (e)=>{ 
			let target = e.currentTarget;
			let h1content = $(target).html();
			console.log('h1content', schemas[h1content]);
		});
		
		$('.datahead span').on('click', (e)=>{ 
			let target = e.currentTarget;
			let sortLabel = $(target).is('.item1');
			let sortName = $(target).is('.item2');
			let sortType = $(target).is('.item3');
			let asc = $(target).is('.asc');
			if (asc){
				$(target).removeClass('asc');
			}else{
				$(target).addClass('asc');
			}
			this.handleDetail(tabName, oldtableName, selectedText, {sortBy:{asc:!asc, label:sortLabel,  name:sortName, type: sortType}});
		});
		
		$('.dataline').mousemove((e)=>{
		  //$("span").text(e.pageX + ", " + e.pageY);
		});
		$('.dataline').on('click', (e)=>{
			let target = e.currentTarget;
			let val = $(target).attr('value');
			
			if (e.ctrlKey || e.shiftKey){
				if ($(target).is('.dataselected')){
					$(target).removeClass('dataselected');
				}else{
					$(target).addClass('dataselected');
				}
			}else{
				$('.dataline').removeClass('dataselected');
				if ($(target).is('.dataselected')){
					$(target).removeClass('dataselected');
				}else{
					$(target).addClass('dataselected');
				}
			}
			
			if ($('.dataselected').length > 0){
				let fields = [];
				$('.dataselected').each((i, e)=>{
					fields.push($(e).find('.item2').text());
				})
				$('.soql').html('select ' + fields.join(', ') + ' from ' +s[0].t);
			}else{
				$('.soql').html('');
			}
			
		});
		
		if(selectedText){
			$(".selecteditem")[0].scrollIntoView({ 
				block:'center', 
				behavior:'smooth', 
				inline:'nearest'
			});
		}
	}

	resultSort(o1,o2){
		if (o1.sortIndex === o2.sortIndex){
			let p1 = o1.l||o1.t||'';
			let p2 = o2.l||o2.t||'';
			return p1.localeCompare(p2)
		}else{
			return o1.sortIndex - o2.sortIndex;
		}
	}
}


