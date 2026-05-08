class ChromePluginHandler extends TestPartHanlder{
    constructor(){
        super();
        this.id = 'chrome-plugin';
        this.title = 'Chrome插件';
    }

    getBody(){
        return `<div class="chrome-plugin" active="false">
                <div id="content_views" class="htmledit_views">
                    <div id="cnblogs_post_body" class="blogpost-body ">
                        <ol class="exp-conent-orderlist">
                            <li class="exp-content-list list-item-1">
                                <div class="content-list-text">
                                    <p>content.js 与 background.js和popup.js 通信和&nbsp;background.js与popup.js &nbsp;这些通信都用
                                        chrome.runtime.<a
                                            href="https://so.csdn.net/so/search?q=sendMessage&amp;spm=1001.2101.3001.7020"
                                            target="_blank" class="hl hl-1"
                                            data-report-click="{&quot;spm&quot;:&quot;1001.2101.3001.7020&quot;,&quot;dest&quot;:&quot;https://so.csdn.net/so/search?q=sendMessage&amp;spm=1001.2101.3001.7020&quot;}"
                                            data-tit="sendMessage" data-pretit="sendmessage">sendMessage</a> 这个方法&nbsp;
                                    </p>
                                    <p>&nbsp;background.js和popup.js 与 content.js通信 都用&nbsp;chrome.tabs.sendMessage 方法
                                    </p>
                                </div>
                            </li>
                            <li class="exp-content-list list-item-2">
                                <div class="list-icon">
                                    比如
                                </div>
                                <div class="content-list-text">
                                    <p>C-&gt;P 或者 C-&gt;B 或者 b-&gt;p</p>
                                    <div class="cnblogs_code">
                                        <pre>chrome.runtime.sendMessage({name:value},function(){

                })</pre>
                                    </div>
                                    <p>&nbsp;</p>
                                    <p>P-&gt;C &nbsp;B-&gt;C</p>
                                    <div class="cnblogs_code">
                                        <div class="cnblogs_code_toolbar">
                                            <span class="cnblogs_code_copy"><a title="复制代码"><img
                                                        src="http://imgconvert.csdnimg.cn/aHR0cHM6Ly9jb21tb24uY25ibG9ncy5jb20vaW1hZ2VzL2NvcHljb2RlLmdpZg"
                                                        alt="复制代码"></a></span>
                                        </div>
                                        <pre>chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

                           chrome.tabs.sendMessage(tabs[0].id, {name:value}, function(response) {


                           });
                 })</pre>
                                        <div class="cnblogs_code_toolbar">
                                            <span class="cnblogs_code_copy"><a title="复制代码"><img
                                                        src="http://imgconvert.csdnimg.cn/aHR0cHM6Ly9jb21tb24uY25ibG9ncy5jb20vaW1hZ2VzL2NvcHljb2RlLmdpZg"
                                                        alt="复制代码"></a></span>
                                        </div>
                                    </div>
                                    <p>3.接收消息都是&nbsp;</p>
                                    <div class="cnblogs_code">
                                        <pre>chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){

                　　alert(JSON.stringify(message)) //这里获取消息

                })</pre>
                                    </div>
                                    <p>&nbsp;</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>`;
    }

    addLisenter(){

    }
}