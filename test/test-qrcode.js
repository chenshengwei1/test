class QRCodeHandler{
    constructor(){
        this.id='qrcode';
    }

    create(){
        let body = `<div class="qrcode" active="false">
        
                <div id="qrcode" />
                <section>
                    <h2>读取文件显示二维码</h2>
					<img id="testimg" src='https://img0.baidu.com/it/u=1705694933,4002952892&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281'></img>
                    <p>
                        <label>请选择一个文件</label>
                        <input type="file" id="imagefile" />
                        <input type="button" value="读取图像" onClick="readAsDataURL();" />
						<input type="button" value="Capture" onClick="getCapture();" />
						<input type="button" value="saveimg" onClick="saveimg();" />
						
                    </p>
                    <div name="result" id="result">
                        <!-- 杩欓噷鐢ㄦ潵鏄剧ず鍥剧墖缁撴灉-->
                    </div>
                </section>

                
                <style>
                    p>span {
                        margin: 0 20px;
                        min-width: 100px;
                        display: inline-block;
                    }
                </style>

                <section>
                    <h2>根据内容生成二维码</h2>
                    <div>
                        <p>
                            <span>width</span>
                            <input id="widthtext" type="text" value="100" style="width:30%" required="required" />
                        </p>
                        <p>
                            <span>height</span>
                            <input id="heighttext" type="text" value="100" style="width:30%" required="required" />
                        </p>
                        <p><span>colorDark</span>
                            <input id="colorDarktext" type="color" value="#42b983" style="width:30%"
                                required="required" />
                        </p>
                        <p>
                            <span>colorLight</span>
                            <input id="colorLighttext" type="color" value="#ffffff" style="width:30%"
                                required="required" />
                        </p>
                        <p>
                            <span>correctLevel</span>
                            <select name="correctLevel" style="width:30%" id="correctLeveltext">
                                <option value="1">L</option>
                                <option value="0">M</option>
                                <option value="3">Q</option>
                                <option value="2" selected="selected">H</option>
                            </select>
                        <p>
                            <span>typeNumber</span>
                            <input id="typeNumbertext" type="number" value="4" min="0" max="5" style="width:30%"
                                required="required" />
                        </p>
                    </div>
                    <input id="text" type="text"
                        value="https://brave-koala-qs2mxe-dev-ed.lightning.force.com/lightning/n/Demo_App_Page"
                        style="width:80%" />
                    <br />
                    <input id="Refresh" type="button" value="Refresh" />
                    <br />
                    <div id="qrcode" style="width:100px;  margin:15px;"></div>
                </section>

                <div>
                    <input id="genURL" type="button" value="生成URL" />
                    <input id="genimg" type="button" value="生成图像" />
                    <textarea id="qrcodeurl" type="textarea" style="width:80%"></textarea>
                </div>
                <div>
                    <img alt="Scan me!" id="testqrcode2"
                        src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
                        style="display: block;" />
                </div>


                <section>
                    <h2>识别二维码</h2>
                    <input id="scanqr" type="button" value="Scan" /><br />
                    <div id="scanqrdev" style="width:100px;  margin:15px;"></div>
                    <div id="qrcodecontainer" style="width:100px;  margin:15px;"></div>
                    <textarea id="scanqrtext" type="textarea" style="width:80%"></textarea>
                </section>
                <table>
                    <caption>
                        属性及其兼容性</caption>
                    <tbody>
                        <tr>
                            <th>
                                属性</th>
                            <th>
                                说明</th>
                            <th>
                                兼容性</th>
                        </tr>
                        <tr>
                            <td>
                                clientX</td>
                            <td>
                                以浏览器窗口左上顶角为原点，定位 x 轴坐标</td>
                            <td>
                                所有浏览器，不兼容 Safari</td>
                        </tr>
                        <tr>
                            <td>
                                clientY</td>
                            <td>
                                以浏览器窗口左上顶角为原点，定位 y 轴坐标</td>
                            <td>
                                所有浏览器，不兼容 Safari</td>
                        </tr>
                        <tr>
                            <td>
                                offsetX</td>
                            <td>
                                以当前事件的目标对象左上顶角为原点，定位 x 轴坐标</td>
                            <td>
                                所有浏览器，不兼容 Mozilla</td>
                        </tr>
                        <tr>
                            <td>
                                offsetY</td>
                            <td>
                                以当前事件的目标对象左上顶角为原点，定位 y 轴坐标</td>
                            <td>
                                所有浏览器，不兼容 Mozilla</td>
                        </tr>
                        <tr>
                            <td>
                                pageX</td>
                            <td>
                                以 document 对象（即文档窗口）左上顶角为原点，定位 x 轴坐标</td>
                            <td>
                                所有浏览器，不兼容 IE</td>
                        </tr>
                        <tr>
                            <td>
                                pageY</td>
                            <td>
                                以 document 对象（即文档窗口）左上顶角为原点，定位 y 轴坐标</td>
                            <td>
                                所有浏览器，不兼容 IE</td>
                        </tr>
                        <tr>
                            <td>
                                screenX</td>
                            <td>
                                计算机屏幕左上顶角为原点，定位 x 轴坐标</td>
                            <td>
                                所有浏览器</td>
                        </tr>
                        <tr>
                            <td>
                                screenY</td>
                            <td>
                                计算机屏幕左上顶角为原点，定位 y 轴坐标</td>
                            <td>
                                所有浏览器</td>
                        </tr>
                        <tr>
                            <td>
                                layerX</td>
                            <td>
                                最近的绝对定位的父元素（如果没有，则为 document 对象）左上顶角为元素，定位 x 轴坐标</td>
                            <td>
                                Mozilla 和 Safari</td>
                        </tr>
                        <tr>
                            <td>
                                layerY</td>
                            <td>
                                最近的绝对定位的父元素（如果没有，则为 document 对象）左上顶角为元素，定位 y 轴坐标</td>
                            <td>
                                Mozilla 和 Safari</td>
                        </tr>
                    </tbody>
                </table>

                <table>
                    <caption>
                        页面元素的位置</caption>
                    <tbody>
                        <tr>
                            <th>
                                属性</th>
                            <th>
                                说明</th>
                            <th>
                                兼容性</th>
                        </tr>
                        <tr>
                            <td>
                                clientHeight</td>
                            <td>网页上的每个元素，都有clientHeight和clientWidth属性。这两个属性指元素的内容部分再加上padding的所占据的视觉面积，不包括border和滚动条占用的空间。
                            </td>
                            <td>
                                所有浏览器，不兼容 Safari</td>
                        </tr>
                        <tr>
                            <td>
                                clientWidth</td>
                            <td>网页上的每个元素，都有clientHeight和clientWidth属性。这两个属性指元素的内容部分再加上padding的所占据的视觉面积，不包括border和滚动条占用的空间。
                            </td>
                            <td>
                                所有浏览器，不兼容 Safari</td>
                        </tr>
                        <tr>
                            <td>
                                scrollHeight</td>
                            <td>
                                网页上的每个元素还有scrollHeight和scrollWidth属性，指包含滚动条在内的该元素的视觉面积。</td>
                            <td>
                                所有浏览器，不兼容 Mozilla</td>
                        </tr>
                        <tr>
                            <td>
                                scrollWidth</td>
                            <td>
                                网页上的每个元素还有scrollHeight和scrollWidth属性，指包含滚动条在内的该元素的视觉面积。</td>
                            <td>
                                所有浏览器，不兼容 Mozilla</td>
                        </tr>
                        <tr>
                            <td>
                                offsetTop</td>
                            <td>
                                每个元素都有offsetTop和offsetLeft属性，表示该元素的左上角与父容器（offsetParent对象）左上角的距离</td>
                            <td>
                                所有浏览器，不兼容 IE</td>
                        </tr>
                        <tr>
                            <td>
                                offsetLeft</td>
                            <td>
                                每个元素都有offsetTop和offsetLeft属性，表示该元素的左上角与父容器（offsetParent对象）左上角的距离</td>
                            <td>
                                所有浏览器，不兼容 IE</td>
                        </tr>
                        <tr>
                            <td>
                                scrollTop</td>
                            <td>
                                滚动条滚动的垂直距离，是document对象的scrollTop属性</td>
                            <td>
                                所有浏览器</td>
                        </tr>
                        <tr>
                            <td>
                                scrollLeft</td>
                            <td>
                                滚动条滚动的水平距离是document对象的scrollLeft属性</td>
                            <td>
                                所有浏览器</td>
                        </tr>
                        <tr>
                            <td>
                                left</td>
                            <td>相对位置就是 var X= this.getBoundingClientRect().left;</td>
                            <td>
                                Mozilla 和 Safari</td>
                        </tr>
                        <tr>
                            <td>
                                top</td>
                            <td>
                                var Y =this.getBoundingClientRect().top;绝对位置

                                　　var X= this.getBoundingClientRect().left+document.documentElement.scrollLeft;

                                　　var Y =this.getBoundingClientRect().top+document.documentElement.scrollTop;</td>
                            <td>
                                Mozilla 和 Safari</td>
                        </tr>
                    </tbody>
                </table>
                
            </div>`;
        $('#part-'+this.id).html(body);
        this.addLisenter();
    }


    addLisenter(){
        $("#text").
            on("blur", function () {
                makeCode();
            }).
            on("keydown", function (e) {
                if (e.keyCode == 13) {
                    makeCode();
        
                }
            });
        
        $("#correctLeveltext").
            on("change", function (event) {
                console.log(event.target.value);
                event.target.selected = "selected";
                console.log('correctLeveltext=' + $("#correctLeveltext").val());
            });
        $("#Refresh").
            on("click", function (e) {
                var width = document.getElementById("widthtext").value;
                var height = document.getElementById("heighttext").value;
                var text = document.getElementById("widthtext").value;
                var colorDark = document.getElementById("colorDarktext").value;
                var colorLight = document.getElementById("colorLighttext").value;
                var correctLevel = $("#correctLeveltext").val();
                var typeNumber = document.getElementById("typeNumbertext").value;
        
                qrcode.overwritesOptions({
                    width: width,
                    height: height,
                    text: text,
                    colorDark: colorDark,
                    colorLight: colorLight,
                    correctLevel: Number(correctLevel),
                    typeNumber: typeNumber
                })
                makeCode();
            });
        $("#genURL").on("click", function (e) {
            var data = getBase64Image(document.getElementById("testqrcode"));
            console.log('img url = ' + data);
            var elText = document.getElementById("qrcodeurl");
            elText.value = data;
        
            var data2 = document.getElementById("testqrcode2");
            data2.src = data;
        });
        $("#genimg").on("click", function (e) {
            var imgTextData = document.getElementById("qrcodeurl").value;
            console.log('img url = ' + imgTextData);
            var aMat = imgTextData.match(/data:image.*/i);
        
            if (aMat) {
                var data2 = document.getElementById("testqrcode2");
                data2.src = imgTextData;
            }
        
        });
        $("#testqrcode2").on("error", function (e) {
            erorrHandler(e);
        
        });
        $("#scanqr").on("click", function (e) {
            process('testqrcode', 'scanqrtext');
        })
    }
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL
}

function getCapture(){
    html2canvas(document.querySelector("#capture"), {useCORS: true}).then(canvas => {
        document.body.appendChild(canvas)
    });
}

function saveimg(){
    let testimg = $('#testimg').attr('src')
    $('#result').command("onSave", {"image":image});
}

function toImage(){
    var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.onload = function(){
        ctx.drawImage(img, 0, 0);
        };
        img.src = 'test.html';
}

if (typeof QRCode != 'undefined'){
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 100,
        height: 100,
        text: "https://brave-koala-qs2mxe-dev-ed.lightning.force.com/lightning/n/Demo_App_Page",
        colorDark: "#42b983",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L,
        typeNumber: 4
    });
    
    function makeCode() {
        var elText = document.getElementById("text");
    
        if (!elText.value) {
            alert("Input a text");
            elText.focus();
            return;
        }
    
        qrcode.makeCode(elText.value);
    }
    
    function erorrHandler(e) {
        e.target.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
    }
    
    makeCode();
}

