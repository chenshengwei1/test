class TestFileSystemHandler{
    constructor(){
        this.id='filesystem';
        this.name="File";
        this.rootDirHandle;
        this.files = [];
        this.page = {};
        this.maxLine = 10000;
        this.closeFolder = [];
        this.fileService = new LPSFileService();
    }

    create(){
        let body = `<button class="file-btn-start">start</button><button class="file-btn-stop">stop</button><button class="file-btn-save">save</button><button class="file-btn-import">import</button><br/>
        <button class="file-btn-Test">Test</button><br/>
        search:<input class="filehandler-key-input" type="text"></input><br/>
        include:<input class="filehandler-include-input" type="text"></input><br/>
        exclude:<input class="filehandler-exclude-input" type="text"></input><br/>
        <div class="filehandler-containers fa">
            <span class="file-total">${this.page.filteredTotal||0}</span>
            <ul class="filehanlder-root display-flex"></ul>
            <div class="filehandler-content-containers" style="white-space: pre;"></div>
        </div>
        `;
        $('#part-'+this.id).html(body);
        this.addLisenter();
        this.createFileListPart();

        this.fileService.create($('.filehandler-containers'));
    }

    addLisenter(){
        $('.file-btn-start').on('click', ()=>{
            this.isStop = false;
            this.getFile();
        })
        $('.file-btn-stop').on('click', ()=>{
            this.isStop = true;
        })
        $('.file-btn-save').on('click', ()=>{
            this.getNewFileHandle(this.getSaveContent());
        })
        $('.file-btn-import').on('click', ()=>{
            this.getFileByImport();
        })
        $('.file-btn-Test').on('click', ()=>{
            this.onmessage({data:'test data'});
        })

        $('.filehandler-key-input').on('change', ()=>{
            this.createFileListPart();
        })

        $('.filehandler-include-input').on('change', ()=>{
            this.createFileListPart();
        })
        $('.filehandler-exclude-input').on('change', ()=>{
            this.createFileListPart();
        })

        $('.filehandler-containers').on('click', '.filehanlder-file-item', (e)=>{
            $('li.filehanlder-file-item').removeClass('select');
            $(e.currentTarget).addClass('select');
            let name = $(e.currentTarget).attr('name');
            let kind = $(e.currentTarget).attr('kind');
            if ($(e.currentTarget).is('.fa-caret-down')){
                $(e.currentTarget).removeClass('fa-caret-down');
                $(e.currentTarget).addClass('fa-caret-up');
                this.closeFolder.push(name);
                this.createFileListPart();
            }else if ($(e.currentTarget).is('.fa-caret-up')){
                $(e.currentTarget).removeClass('fa-caret-up');
                $(e.currentTarget).addClass('fa-caret-down');
                this.closeFolder = this.closeFolder.filter(e => e!=name);
                this.createFileListPart();
            }
            if (kind == 'file'){
                this.linkToPreview(name);
            }
        })

        
    }

    async linkToPreview(name){
        if (/.*\.(txt|log|rm|bat|log|html|java|c)$/ig.test(name)){
            let selectedFile = this.files.find(e=>e.path == name);
            if (!selectedFile || !selectedFile.handle.getFile){
                return;
            }
            let fileData = await selectedFile.handle.getFile();
            if (fileData){
                const reader = new FileReader();
                reader.addEventListener(
                    "load",
                    () => {
                        // 然后这将显示一个文本文件
                        this.updatePreviewText(reader.result);
                    },
                    false,
                );
    
                if (fileData) {
                    reader.readAsText(fileData);
                }
            }
        }
    }

    updatePreviewText(fileData){
        $('.filehandler-content-containers').text(`<pre>${fileData}</pre>`);
    }
    updatePreviewImage(fileData){
        $('.filehandler-content-containers').html(`<img src="${fileData}"/>`);
    }

    getSaveContent(fileData){
        return JSON.stringify(this.files||[]);
    }

    // 存放对文件句柄的引用
    async  getFile() {
        // 打开文件选择器
         window.showDirectoryPicker().then(fileHandle =>{
            this.files = [];
            console.time('files');
            if (fileHandle.kind === "file") {
                // 运行针对文件的代码
            } else if (fileHandle.kind === "directory") {
                // 运行针对目录的代码
                this.addInHandler(null, fileHandle);
                this.listDir(fileHandle);
            }
            this.rootDirHandle = fileHandle;
        }).catch(e=>{

        });

    }

    getFileByImport(){
        const pickerOpts = {
            startIn:"documents",
            types: [
                {
                description: "Text file",
                accept: { "text/plain": [".txt", ".json"] },
                },
            ],
            excludeAcceptAllOption: true,
            multiple: false,
          };
        
          // 打开文件选择器
        window.showOpenFilePicker(pickerOpts).then(async fileHandle =>{
            this.files = [];
            console.time('import');
            // 获取文件内容
            const fileData = await fileHandle[0].getFile();
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    // 然后这将显示一个文本文件
                    console.timeLog('import','start load');
                    this.files = JSON.parse(reader.result);
                    console.timeLog('import','end JSON');
                    this.createFileListPart();
                    console.timeLog('import','end part');
                    console.timeEnd('import');
                },
                false,
            );

            if (fileData) {
                reader.readAsText(fileData);
            }
        });
          
        return null;
    }

    async getNewFileHandle(contents) {
        const opts = {
          startIn:"documents",
          types: [
            {
              description: "Text file",
              accept: { "text/plain": [".txt", ".json"] },
            },
          ]
        };
        window.showSaveFilePicker(opts).then(async fileHandle=>{
            this.writeFile(fileHandle, contents);
        });
    }

    async writeFile(fileHandle, contents) {
        // 创建一个 FileSystemWritableFileStream 用来写入。
        const writable = await fileHandle.createWritable();
      
        // 将文件内容写入到流中。
        await writable.write(contents);
      
        // 关闭文件并将内容写入磁盘。
        await writable.close();
    }

    /**
     * 
     * @param {FileSystemDirectoryHandle } currentDirHandle 
     */
    async listDir(currentDirHandle){
        if (this.isStop){
            return;
        }
        for await (const [key, value] of currentDirHandle.entries()) {
            console.log({ key, value });
            this.addInHandler(currentDirHandle, value);
            if (value.kind === "file") {
                // 运行针对文件的代码
            } else if (value.kind === "directory") {
                // 运行针对目录的代码
                await this.listDir(value);
            }
        }
    }

    addInHandler(dir, f){
        let newH = {name:f.name,kind:f.kind};
        newH.handle = f;
        if (dir) {
            let sfile = this.files.find(t => t.handle==dir);
            if (sfile){
                newH.path = sfile.path + '/' + newH.name;
            }else{
                newH.path = dir.name + '/' + newH.name;
            }
        }else{
            newH.path = newH.name;
        }
        this.files.push(newH);
        let newContents = this.inputFiltered([newH]).map(e=>this.getFileItem(e));
        if (newContents.length){
            $('.filehanlder-root').append(newContents.join(''));
        }
        $('.file-total').html(`total:<b>${this.files.length}</b>`)
    }

    count(filteredResult){
        console.timeLog('import','start count');
        this.page.filteredTotal = filteredResult.length;
        return filteredResult;
    }

    inputFiltered(filteredResult){
        return this.filteredSeachkey(this.filteredInclude(this.filteredExclude(this.filteredByCloseFolder(filteredResult))))
    }

    filteredByCloseFolder(filteredResult){
        console.timeLog('import','start filteredByCloseFolder');
        if (!this.closeFolder.length){
            return filteredResult;
        }
        return filteredResult.filter(item=>{
            for (let word of this.closeFolder){
                if (item.path.indexOf(word+'/') == 0){
                    return false;
                }
            }
            return true;
        });
    }

    filteredExclude(filteredResult){
        console.timeLog('import','start filteredExclude');
        let incldue = $('.filehandler-exclude-input').val();
        if (!incldue){
            return filteredResult;
        }
        let words = incldue.toLocaleLowerCase().split(';');
        return filteredResult.filter(item=>{
            for (let word of words){
                if (item.path.toLocaleLowerCase().indexOf(word) != -1){
                    return false;
                }
            }
            return true;
        });
    }

    filteredInclude(filteredResult){
        console.timeLog('import','start filteredInclude');
        let incldue = $('.filehandler-include-input').val();
        if (!incldue){
            return filteredResult;
        }
        let words = incldue.toLocaleLowerCase().split(';');
        return filteredResult.filter(item=>{
            for (let word of words){
                if (item.path.toLocaleLowerCase().indexOf(word) != -1){
                    return true;
                }
            }
            return false;
        });
    }

    filteredSeachkey(filteredResult){
        console.timeLog('import','start filteredSeachkey');
        let incldue = $('.filehandler-key-input').val();
        if (!incldue){
            return filteredResult;
        }
        return filteredResult.filter(item=>{
            return item.path.toLocaleLowerCase().indexOf(incldue) != -1;
        });
    }

    getFileItem(f){
        !f.lastModifiedDate && this.getLastmodifiedDate(f);
        return `<li class="flex-item-full filehanlder-file-item ${this.isCatetDown(f)}" name="${f.path||f.name}" kind="${f.kind}">${f.path||f.name}<span class="time-label">${f.lastModifiedDate&&this.formatDate(f.lastModifiedDate, 'yyyy-MM-dd hh:mm:ss')||''}</span></li>`;
    }

    isCatetDown(f){
        let path = f.path||f.name;
        return f.kind=='directory'?(this.closeFolder.indexOf(path) == -1?'fa-caret-down':'fa-caret-up'):'';
    }

    async getLastmodifiedDate(f){
        if (f.kind == 'file' && f.handle.getFile){
            let fileData = await f.handle.getFile();
            f.lastModifiedDate = fileData.lastModifiedDate;
            //fileData.lastModifiedDate.getTime();
            $(`li[name="${f.path||f.name}"] .time-label`).text(this.formatDate(fileData.lastModifiedDate, 'yyyy-MM-dd hh:mm:ss'));
        }
    }

    createFileListPart(){
        let keyFilter = this.inputFiltered(this.files);
        let content = this.count(keyFilter).map((f, index) =>{
            if (index > this.maxLine)return '';
            return this.getFileItem(f);
        })
        $('.filehandler-containers file-total').html(`${this.page.filteredTotal||0}`);
        console.timeLog('import','start html');
        $('.filehanlder-root').html(content.join(''));
    }

     formatDate (inputDate, format)  {
        if (!inputDate) return '';
        if(typeof inputDate === 'string'){
            inputDate = new Date(Date.parse("2021-01-25T09:46:17.346Z"));
            
        }
    
        const padZero = (value) => (value < 10 ? `0${value}` : `${value}`);
        const parts = {
            yyyy: inputDate.getFullYear(),
            MM: padZero(inputDate.getMonth() + 1),
            dd: padZero(inputDate.getDate()),
            HH: padZero(inputDate.getHours()),
            hh: padZero(inputDate.getHours() > 12 ? inputDate.getHours() - 12 : inputDate.getHours()),
            mm: padZero(inputDate.getMinutes()),
            ss: padZero(inputDate.getSeconds()),
            tt: inputDate.getHours() < 12 ? 'AM' : 'PM'
        };
    
        return format.replace(/yyyy|MM|dd|HH|hh|mm|ss|tt/g, (match) => parts[match]);
    }

    async onmessage(e){
        // 从主线程检索发送到 worker 的消息
        const message = e.data;
      
        // 获取草稿文件的句柄
        navigator.storage.getDirectory().then(async root =>{
            const draftHandle = await root.getFileHandle("draft.txt", { create: true });
            // 获取同步访问句柄
            const accessHandle = await draftHandle.createSyncAccessHandle();
          
            // 获取文件的大小
            const fileSize = accessHandle.getSize();
            // 将文件内容读取到缓冲区
            const buffer = new DataView(new ArrayBuffer(fileSize));
            const readBuffer = accessHandle.read(buffer, { at: 0 });
          
            // 将消息写入文件末尾
            const encoder = new TextEncoder();
            const encodedMessage = encoder.encode(message);
            const writeBuffer = accessHandle.write(encodedMessage, { at: readBuffer });
          
            // 将更改保存到磁盘
            accessHandle.flush();
          
            // 如果完成，请始终关闭 FileSystemSyncAccessHandle
            accessHandle.close();
        });
    }
}

class LPSFileService{
    constructor(){
        this.allFiles = [];
        this.loadding = false;
    }

    create(container){

        let URLPaser = URL.parse(location.href);

        if (URLPaser.origin == 'file://'){
            return;
        }

        let body = `<style>
	[type="folder"]>.filelabel{
        background-color: chocolate;
    }
	.searchresult li{
		font-family: "SF Pro SC","SF Pro Text","SF Pro Icons","PingFang SC", Verdana, Arial, '微软雅黑','宋体';
		font-size: 14px;
		width: max-content;
		
	}
	.resultdetail{
		width: max-content;
		display:flex;
		flex-wrap: wrap;
	}
	.fileicon{
		width:20px;
		cursor: pointer;
	}
    .file-ul{
    width:100%;
    }
</style>
	
<p class="filesearchp">
	Object Search
</p>
<p class="btn-container">
	Fields Search: <input class="search" id="file-search-input" type="input" value="" ></input><br/>
    Base Folder: <input class="search" id="file-base-path-input" type="input" value="C:/doc/doc" ></input>
</p>

<div class="filesearchresult btn-container display-flex">
	<div class="flex-item-full">
        <div class="totalbar btn"><span>Total Records : </span><span class="recordsnumber">0</span><div class="dot"/></div>
    </div>
	
	<div class="fileobjsearchresult flex-item--1-3"></div>
	<div class="filedetailearchresult" style="white-space: pre;"></div>
</div>`
        container.append(body);
        this.init();
        this.addLisenter();

        const ob = new IntersectionObserver((entries)=>{
            console.log('交叉改变后运行');
            for (let entry of entries){
                if (entry.isIntersecting){
                    console.log('交叉');
                    let item = entry.target;
                    ob.unobserve(item);
                }
            }
        }, {
            threshold:0
        })

        let items = document.querySelectorAll('.fileitem');
        items.forEach(item =>{
            ob.observe(item);
        })
    }

    init(){
        this.getFiles();
        this.loaddingMap= {};
    }

    addLisenter(){
        $('.filesearchresult').on('click','li.fileitem' ,(e)=>{
            let fileId = $(e.currentTarget).attr('fid');

            let clickedFile = this.allFiles.find(file =>file.id==fileId);
            if(clickedFile){
                if (clickedFile.open == '+'){
                    this.getFiles(fileId, e.currentTarget);
                    clickedFile.open = '-';
                }else if (clickedFile.open == '-'){
                    this.closeFiles(fileId);
                    clickedFile.open = '+';
                }
                $(`li[fid="${fileId}"]>.fileicon`).text(clickedFile.open);

                this.linkToPreview(clickedFile.isTree?clickedFile.dir + '\\' + clickedFile.file:clickedFile.file);
            }
            e.stopPropagation();
        })

        $('#file-search-input').on('change', ()=>{
            
            this.searchFiles($('#file-search-input').val());
        })
    }

    renderfiletree(files, root){
        root = root || $('.fileobjsearchresult')[0];
        if ($(root).is('.fileobjsearchresult')){
            $(`.fileobjsearchresult>.file-ul`).remove();
        }
        let selectedText = '';
        let result = files.map(t => `<li class="level${t.level} fileitem resultdetail ${selectedText&&(selectedText==t.file) ?'selecteditem':''}" type="${t.isDirectory?'folder':'file'}" value="${t.file}" fid="${t.id}">
            <span class="fileicon">${t.open}</span><span class="filelabel">${t.file}</span>
        </li>`).join('');
        $(root).append(`<ul class="file-ul">${result}</ul>`);
    }

    renderSearchFiletree(files, root){
        root = root || $('.fileobjsearchresult')[0];
        $(`.fileobjsearchresult>.file-ul`).remove();
        $('.recordsnumber').text(files.length);
        let selectedText = '';
        let result = files.map(t => `<li class="level${t.level} fileitem resultdetail ${selectedText&&(selectedText==t.file) ?'selecteditem':''}" type="${t.isDirectory?'folder':'file'}" value="${t.file}" fid="${t.id}">
            <span class="fileicon">${t.open}</span><span class="filelabel">${t.file}</span>
        </li>`).join('');
        $(root).append(`<ul class="file-ul">${result}</ul>`);
    }

    appendRenderSearchFiletree(files, root){
        //$(`.fileobjsearchresult>.file-ul`).remove();
        let selectedText = '';
        let exitsMapPath = {};
        root = root || $('.fileobjsearchresult')[0];
        $(root).find('.file-ul>li').each((index, ele)=>{
            let path = $(ele).attr('value');
            if (path){
                exitsMapPath[path]=true;
            }
        })
        let result = files.filter(e=>{
            return !exitsMapPath[e.file];
        }).map(t => `<li class="level${t.level} fileitem resultdetail ${selectedText&&(selectedText==t.file) ?'selecteditem':''}" type="${t.isDirectory?'folder':'file'}" value="${t.file}" fid="${t.id}">
        <span class="fileicon">${t.open}</span><span class="filelabel">${t.file}</span>
        </li>`).join('');
        $(root).find('.file-ul').append(`${result}`);
        $('.recordsnumber').text($(root).find('.file-ul>.fileitem').length);
    }

    closeFiles(fileId){
        $(`li[fid="${fileId}"] .file-ul`).remove();
    }

    async linkToPreview(filePath){
        this.loadFile(filePath);
    }

    updatePreviewText(fileData){
        $('.filedetailearchresult').text(`${fileData}`);
    }
    updatePreviewImage(url){
        $('.filedetailearchresult').html(`<img style="width: auto;" src="${url}"/>`);
    }

    

    getFilesFromCache(fid){
        let currentFile = this.allFiles.find(e => e.id==fid);
        let children = []
    }

    set showSpinner(flag){
        this._showSpinner = flag;
        if (flag){
            $('.totalbar').addClass('loading');
        }else{
            $('.totalbar').removeClass('loading');
        }
    }

    get showSpinner(){
        return this._showSpinner;
    }

    loadFile(filePath){
        let data = {path: filePath};
        fetch(encodeURI(this.getBaseUrl() +'api/loadfile'),{
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data), // body data type must match "Content-Type" header
          }).then((response) => response.blob())
          .then((blob) => {
            if (/image\/.*/ig.test(blob.type)){
                 return this.updatePreviewImage(URL.createObjectURL(blob));
            } else if (/text\/.*/ig.test(blob.type)){
                return blob.text().then(e=>{
                    this.updatePreviewText(e);
                })
            }
          })
          .then((url) => {
            
          })
          .catch((err) => console.error(err))
    }

    searchFiles(keyword){
        if (!keyword){
            this.getFiles();
            return;
        }
        let path = $('#file-base-path-input').val();
        let data = {searchKey:keyword, base:path, lastRecordId:this.lastRecordId, rquestId:Date.now()};

        this.loaddingMap.searchFiles = true;
        this.showSpinner = true
        fetch(encodeURI(this.getBaseUrl() +'api/search'),{
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data), // body data type must match "Content-Type" header
          }).then((response) =>{
            
            return response.json();
          })
          .then((myJson)=> {
                try{
                    let filelistobj = null;
                    if (typeof myJson == 'string'){
                        filelistobj = JSON.parse(myJson);
                    }else{
                        filelistobj=myJson;
                    }
                    console.log('xxxsearch', filelistobj);
                    for(let file of filelistobj.datas||[]){
                        file.isDirectory = false;
                        file.file = file.path;
                        file.open = '';
                        file.id = file.ino;
                        file.level = 0;
                    }
                   
                    
                    if (!filelistobj.done){
                        this.allFiles.push(...filelistobj.datas);
                        this.appendRenderSearchFiletree(filelistobj.datas, null);
                        this.lastRecordId = filelistobj.lastRecordId
                        setTimeout(this.searchFiles(keyword), 1000);
                    }else{
                        this.allFiles = filelistobj.datas;
                        this.renderSearchFiletree(filelistobj.datas, null);
                        this.lastRecordId = null;
                    }
                }catch(e){
                    console.log('exceptiopn', e);
                }finally{
                    this.showSpinner = false;
                }
          }).finally(e=>{
            this.loaddingMap.searchFiles = false;
          });
    }

    getFiles(openfile){
        if (this.loadding){
            console.log('waiting...');
            return;
        }
        
        let allFiles = this.allFiles;
        openfile = openfile||'-1';
        let clickedFile = allFiles.find(file =>file.id==openfile);
        clickedFile = clickedFile || {file:'',id:-1, pid:-1, level:-1, isDirectory:true, open:'+', state: 'pending'};
        
        
        if (!clickedFile.isDirectory || clickedFile.open=='-'){
            console.log('no need open waiting...');
            return;
        }
        if (clickedFile.state == 'ready'){
            let subFiles = allFiles.filter(e => e.folder == clickedFile);
            let dir = $(`[fid="${clickedFile.id}"]`);
            this.renderfiletree(subFiles,dir.length?dir[0]:null);
            console.log('xxx', allFiles);
            clickedFile.open='-';
        }else{
            let fileNameList = [clickedFile.file];
            let pfile = clickedFile;
            while(pfile.pid != -1){
                pfile = pfile.folder;
                if (null == pfile){
                    break;
                }
                fileNameList.push(pfile.file);
            }

            this.loadding = true;
            fetch(encodeURI(this.getBaseUrl()+'file/' + fileNameList.reverse().join('/'))).then((response) =>{
                return response.json();
              })
              .then((myJson)=> {
                    try{
                        let filelistobj = JSON.parse(myJson);
                        let oldLength = allFiles.length;
                        allFiles.push(...filelistobj);
                        let newId = 1;
                        for (let f of filelistobj){
                            f.id = f.id || (clickedFile.id + '-' + newId++);
                            f.pid = f.pid || clickedFile.id;
                            f.level = f.level || (clickedFile.level +1);
                            f.open = f.isDirectory?'+':'';
                            f.folder = clickedFile;
                            f.state = 'pending';
                            f.isTree = true;
                            clickedFile.state = 'ready';
                        }
                        let dir = $(`[fid="${clickedFile.id}"]`);
                        filelistobj.sort((a, b)=>{
                            return a.isDirectory != b.isDirectory?a.isDirectory - b.isDirectory : a.file.toLocaleLowerCase().localeCompare(b.file.toLocaleLowerCase())
                        })
                        this.renderfiletree(filelistobj, dir.length?dir[0]:null);
                        console.log('xxx', allFiles);
                        clickedFile.open='-';
                    }catch(e){
                        
                    }finally{
                        this.loadding = false;

                    }
              });
        }
    }

    getBaseUrl(){
        return 'http://localhost:3000/';
    }

}

