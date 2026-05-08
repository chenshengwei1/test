class SchemaHanlder extends TestPartHanlder{
    constructor(){
        super();
        this.id = 'schema';
        this.title = 'Schema';
        this.name = 'Schema';
    }

    getBody(){
        return `<div class="schema" active="true">
				<style>
					.searchresult{
						display:flex;
						font-family: "SF Pro SC","SF Pro Text","SF Pro Icons","PingFang SC", Verdana, Arial, '微软雅黑','宋体';
						font-size: 14px;
						flex-wrap: wrap;
					}
					.objsearchresult,.detailearchresult{
						width:49%;
					}
					.resultdetail{
						display:flex;
					}
					.resultdetail.selecteditem{
						background-color: #dadada;
					}
					.resultdetail:hover{
						background-color: bisque;
						
					}
					.dataselected{
						background-color: bisque;
					}
					.detailhead{
						background-color: bisque;
					}
					.item1,.item2,.item3{
						width:33.3333333%;
					}
					.item4,.item5,.schemagrp{
						width:50%;
					}
					.searchresult li{
						font-family: "SF Pro SC","SF Pro Text","SF Pro Icons","PingFang SC", Verdana, Arial, '微软雅黑','宋体';
						font-size: 14px;
						width: max-content;
						
					}
					.searchresult li:hover{
						cursor: pointer;
						background-color: bisque;
						
					}
					
					
					input.search{
						width: 512px;
						height: 16px;
						padding: 12px 16px;
						font-size: 16px;
						margin: 0;
						vertical-align: top;
						outline: 0;
						box-shadow: none;
						border-radius: 10px 0 0 10px;
						border: 2px solid #c4c7ce;
						background: #fff;
						color: #222;
						overflow: hidden;
						box-sizing: content-box;
						-webkit-tap-highlight-color: transparent;
					}
					.item3 .item31{
						color:red;
						cursor: pointer;
					}
					
					.tname{
						color: #d7d9dc;
					}
					.totalbar{
						width:100%;
						margin: 20px 20px;
					}
					.recordsnumber,.title-ccount{
						margin-left:10px;
						color:red;
					}
					#rubyschema{
						width:30px;
					}
					#hkthschema{
						width:30px;
						margin-left: 50px;
					}
					
					.auto_hidden {
						width:204px;
						border-top: 1px solid #333;
						border-bottom: 1px solid #333;
						border-left: 1px solid #333;
						border-right: 1px solid #333;
						position:absolute;
						display:none;
					}
					.auto_show {
						width:204px;
						border-top: 1px solid #333;
						border-bottom: 1px solid #333;
						border-left: 1px solid #333;
						border-right: 1px solid #333;
						position:absolute;
						z-index:9999; /* 保证页面在最前端*/
						display:block;
						height:100px;
						overflow:auto
					}
					.auto_onmouseover{
						color:#ffffff;
						background-color:highlight;
						width:100%;
					}
					.auto_onmouseout{
						color:#000000;
						width:100%;
						background-color:#ffffff;
					}
					.autocompleteitem:hover{
						color:#ffffff;
						width:100%;
						background-color:highlight;
					}
					#auto{
						height: auto; 
						background-color: #F0F0F0;
						font-size: 15pt;
						max-height: 400px;
					}
				</style>
				
				<p class="searchp">
					Object Search: <input id="objectsearch" class="search" type="input" value="" name="apiName" type="text" autocomplete="off" 
		style="width:395px;height:30px;font-size:15pt;"></input>
					Exclude Object Search: <input class="search" id="exobjectsearch" type="input" value="" ></input>
					Metadata: <input class="" id="inmdtsearch" type="checkbox" value="N" ></input>
					Event: <input class="" id="ineventsearch" type="checkbox" value="N" ></input>
					History: <input class="" id="inhissearch" type="checkbox" value="N" ></input>
					Share: <input class="" id="insharesearch" type="checkbox" value="N" ></input>
					Chang Event: <input class="" id="inchangeeventsearch" type="checkbox" value="N" ></input>
					Custom: <input class="" checked id="incustomsearch" type="checkbox" value="Y" ></input>
				</p>
				<p>
					Fields Search: <input class="search" id="fieldssearch" type="input" value="" autocomplete="off" ></input>
				</p>
				<p>
					Reference Search: <input class="search" id="referecesearch" type="input" value="" ></input>
				</p>
				<p class="schemagrp">
					Schemas From: 
					<input class="search" id="rubyschema" type="radio" name="schema" value="Ruby" >Ruby</input>
					<input class="search" id="hkthschema" type="radio" name="schema" value="HKTHome" checked="checked">HKTHome</input>
				</p>
				
				<div class="searchresult">
					<div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
					
					<div class="objsearchresult"></div>
					<div class="detailearchresult"></div>
				</div>
			</div>
			
			
        </div>`;
    }

    addLisenter(){
        let schemas = window.hkthschemas;
        $('.schemagrp').on('change', (e)=>{
            let checked  = $('.schemagrp [name=schema]:checked');
            if (checked.val()=='Ruby'){
                this.schemas = window.rubyschemas;
            }else{
                this.schemas = window.hkthschemas;
            }
        })

        let detailsHistories = [];
        
        $('#fieldssearch').on('change', ()=>{
            this.search()
        })
        $('.searchp input').on('change', ()=>{
            this.search()
        })
        
        $('#referecesearch').on('change', ()=>{
            this.refefrencesearch()
        })
        
        // autocomplete
        new AutoComplete1('objectsearch',Object.keys(schemas)).start(AutoComplete1);
        
        let allFields = [];
        Object.keys(schemas).forEach(e=>{
            let fieldName = (schemas[e].fields||[]).map(a=>a.name);
            allFields.push(...fieldName);
        })
        
        new AutoComplete1('fieldssearch',Array.from(new Set(allFields))).start(AutoComplete1);
        
        let sfsearch = new SFObjectSearch();
        sfsearch.start();
        
        // autocomplete
        new AutoComplete1('objectsearch',Object.keys(sfsearch.schemas)).start(AutoComplete1);
        
        
        Object.keys(sfsearch.schemas).forEach(e=>{
            let fieldName = (sfsearch.schemas[e].fields||[]).map(a=>a.name);
            allFields.push(...fieldName);
        })
        
        new AutoComplete1('fieldssearch',Array.from(new Set(allFields))).start(AutoComplete1);
    }

    myschemas(){
        let s = [];
        for (let r in schemas){
            s.push({label:r, value:r});
        }
        return s;
    }
    
    myfields(o){
        let s = [];
        for (let r of schemas[o] || []){
            s.push(r);
        }
        return s;
    }

    refefrencesearch(){
        let s = [];
        $('.recordsnumber').html(s.length);
        let val = $('#referecesearch').val().trim().toLocaleLowerCase();
        if (val==''){
            return;
        }
        let objval='';
        let keys = Object.keys(this.schemas).sort();
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
        let result = s.sort(resultSort).map(t => `<li va="${t.t}" vb="${t.l}"><span>${t.l}</span> <span>(${t.v||'table'})</span> <span>-  ${t.t}</span> </li>`).join('');
        
        $('.objsearchresult').html(result);
        
        $('.objsearchresult li').on('click', (e)=>{
            let target = e.currentTarget;
            let tabName = $(target).attr('va');
            let fieldName = $(target).attr('vb');
            this.handleDetail(tabName.toLocaleLowerCase(),'',fieldName);
        })
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
                tabName2 = detailsHistories.pop();
            }else{
                detailsHistories.push(tabName);
            }
            this.handleDetail(tabName2.toLocaleLowerCase(), detailsHistories.length>0?detailsHistories[detailsHistories.length-1]:'');
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
        let keys = Object.keys(schemas).sort();
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
        let result = s.sort(resultSort).map(t => `<li va="${t.t}" vb="${t.l}"><span>${t.l}</span> <span>(${t.v||'table'})</span> <span>-  ${t.t}</span><span class="tname">(${t.tn})</span> </li>`).join('');
        
        $('.objsearchresult').html(result);
        
        $('.objsearchresult li').on('click', (e)=>{
            let target = e.currentTarget;
            let tabName = $(target).attr('va');
            let fieldName = $(target).attr('vb');
            this.handleDetail(tabName.toLocaleLowerCase(), '', fieldName);
        })
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
}