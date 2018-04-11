
/**
 * 调用API自动生成 markdown 接口文档。
 * 原创作品，开源免费。
 * 码砖不易，尊重他人劳动成果 ，请保留作者名字和QQ，谢谢。
 * 
 * @author 青竹丹枫  316686606@qq.com
 * @example:
 * 
 * $.ajax({
 *      url: ''
 *      data: post,
 *      dataType: 'json',
 *      success:function(d){
 *          
 *          $.markdown(this,d);
 *      }
 * });
 * 
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    $.markdown = function (jq, response) {

        var loadJS = function (url, callback) {
            var script = document.createElement('script'),
                    fn = callback || function () {};
            script.type = 'text/javascript';

            //IE
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == 'loaded' || script.readyState == 'complete') {
                        script.onreadystatechange = null;
                        fn();
                    }
                };
            } else {
                //其他浏览器
                script.onload = function () {
                    fn();
                };
            }
            script.src = url;
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        //格式化JSON数据
        var formatJson = function (json, options) {
            var reg = null,
                    formatted = '',
                    pad = 0,
                    PADDING = '    ';
            options = options || {};
            options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
            options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
            if (typeof json !== 'string') {
                json = JSON.stringify(json);
            } else {
                json = JSON.parse(json);
                json = JSON.stringify(json);
            }
            reg = /([\{\}])/g;
            json = json.replace(reg, '\r\n$1\r\n');
            reg = /([\[\]])/g;
            json = json.replace(reg, '\r\n$1\r\n');
            reg = /(\,)/g;
            json = json.replace(reg, '$1\r\n');
            reg = /(\r\n\r\n)/g;
            json = json.replace(reg, '\r\n');
            reg = /\r\n\,/g;
            json = json.replace(reg, ',');
            if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
                reg = /\:\r\n\{/g;
                json = json.replace(reg, ':{');
                reg = /\:\r\n\[/g;
                json = json.replace(reg, ':[');
            }
            if (options.spaceAfterColon) {
                reg = /\:/g;
                json = json.replace(reg, ':');
            }
            (json.split('\r\n')).forEach(function (node, index) {
                var i = 0,
                        indent = 0,
                        padding = '';

                if (node.match(/\{$/) || node.match(/\[$/)) {
                    indent = 1;
                } else if (node.match(/\}/) || node.match(/\]/)) {
                    if (pad !== 0) {
                        pad -= 1;
                    }
                } else {
                    indent = 0;
                }

                for (i = 0; i < pad; i++) {
                    padding += PADDING;
                }

                formatted += padding + node + '\r\n';
                pad += indent;
            }
            );
            return formatted;
        };

        //获取URL参数
        var GetRequest = function () {
            var arr = jq.url.split("?");
            var url = arr[1];
            var theRequest = new Object();
            if (url) {
                var str = url;
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        };

        //获取POST参数
        var PostRequest = function () {
            var url = jq.data;
            var theRequest = new Object();
            if (url) {
                var str = url;
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        };

        var exec = function () {
            //markdown 模板
            var content = '## 接口名称 \n\
### 1) 请求地址 \n\
\n\
>{url} \n\
\n\
### 2) 调用方式：HTTP {type} \n\
\n\
### 3) 接口描述： \n\
\n\
* {miaoshu} \n\
\n\
### 4) 请求参数: \n\
\n\
#### GET参数: \n\
{paramHeader} \
{paramGet} \n\
\n\
#### POST参数: \n\
{paramHeader} \
{paramPost} \n\
\n\
### 5) 请求返回结果: \n\
\n\
``` \n\
{content} \n\
``` \n\
### 6) 返回参数: \n\
{paramHeader} \
{paramResponse} \n\
';

            var paramHeader = '|字段名称       |字段说明         |类型            |必填            |备注     | \n\
| -------------|:--------------:|:--------------:|:--------------:| ------:| \n';
            var paramPost = '|{field}|{desc}|{type}|{require}|-| \n';
            var paramGet = '|{field}|{desc}|{type}|{require}|-| \n';
            var getField = '', postField = '', returnContent = '';

            //取GET参数，并生成模板
            var getRequestObj = GetRequest();
            for (var key in getRequestObj) {
                var tmp = "";
                var tmpfield = paramGet;

                tmp = fieldDict[key] ? fieldDict[key].desc : "";
                tmpfield = tmpfield.replace(/{desc}/g, tmp);

                tmp = fieldDict[key] ? fieldDict[key].type : "string";
                tmpfield = tmpfield.replace(/{type}/g, tmp);

                tmp = fieldDict[key] ? fieldDict[key].require : "Y";
                tmpfield = tmpfield.replace(/{require}/g, tmp);

                tmpfield = tmpfield.replace(/{field}/g, key);
                getField += tmpfield;
            }
            getField += '| | | | | -| \n';

            //取POST参数，并生成模板
            var postRequestObj = PostRequest();
            for (var key in postRequestObj) {
                var tmp = "";
                var tmpfield = paramPost;

                tmp = fieldDict[key] ? fieldDict[key].desc : "";
                tmpfield = tmpfield.replace(/{desc}/g, tmp);

                tmp = fieldDict[key] ? fieldDict[key].type : "string";
                tmpfield = tmpfield.replace(/{type}/g, tmp);

                tmp = fieldDict[key] ? fieldDict[key].require : "Y";
                tmpfield = tmpfield.replace(/{require}/g, tmp);

                tmpfield = tmpfield.replace(/{field}/g, key);
                postField += tmpfield;
            }
            postField += '| | | | | -| \n';

            //取返回数据
            if (typeof response == 'object') {
                if (response['data']) {
                    var aa = {};
                    for (var key in response['data']) {
                        var tmp = response['data'][key];
                        aa[key] = response['data'][key];
                        var rule = new RegExp(/^[0-9]{1,11}$/);
                        if (rule.test(key)) {

                            break;
                        }
                    }
                    response['data'] = aa;
                }
                if (response['list']) {
                    for (var key in response['list']) {
                        var aa = {};
                        var tmp = response['list'][key];
                        aa[key] = response['list'][key];
                        break;
                        response['list'] = aa;
                    }
                }
                returnContent = formatJson(response);
            } else {
                returnContent = response;
            }

            //取返回JSON的字段
            var paramResponse = '|{field}|{desc}|{type}|{require}|-| \n';
            var respnseField = '';
            if (typeof response == 'object') {
                for (var key in response) {
                    var fieldtype = typeof response[key];
                    if (fieldtype == "string" || fieldtype == "number") {
                        var tmp = "";
                        var tmpfield = paramResponse;

                        tmp = fieldDict[key] ? fieldDict[key].desc : "";
                        tmpfield = tmpfield.replace(/{desc}/g, tmp);

                        //tmp = fieldDict[key] ? fieldDict[key].type : "string";
                        tmpfield = tmpfield.replace(/{type}/g, fieldtype);

                        tmp = fieldDict[key] ? fieldDict[key].require : "Y";
                        tmpfield = tmpfield.replace(/{require}/g, tmp);

                        tmpfield = tmpfield.replace(/{field}/g, key);
                        respnseField += tmpfield;
                    }

                    if (fieldtype == 'object') {
                        respnseField += '| **[' + key + ']:** | | | | | \n';
                        var sonfield = response[key];
                        for (var k1 in sonfield) {

                            //如果key是个数字，表示是输出的数组键值对，这种情况只取一条即可
                            var rule = new RegExp(/^[0-9]{1,11}$/);
                            if (rule.test(k1)) {
                                var sonfield2 = sonfield[k1];
                                for (var k2 in sonfield2) {
                                    var fieldtype2 = typeof sonfield2[k2];
                                    var tmp = "";
                                    var tmpfield = paramResponse;

                                    tmp = fieldDict[k2] ? fieldDict[k2].desc : "";
                                    tmpfield = tmpfield.replace(/{desc}/g, tmp);

                                    //tmp = fieldDict[k2] ? fieldDict[k2].type : "string";
                                    tmpfield = tmpfield.replace(/{type}/g, fieldtype2);

                                    tmp = fieldDict[k2] ? fieldDict[k2].require : "Y";
                                    tmpfield = tmpfield.replace(/{require}/g, tmp);

                                    tmpfield = tmpfield.replace(/{field}/g, k2);
                                    respnseField += tmpfield;

                                }
                                break;
                            }

                            if (typeof k1 == 'string') {
                                var fieldtype1 = typeof sonfield[k1];
                                var tmp = "";
                                var tmpfield = paramResponse;

                                tmp = fieldDict[k1] ? fieldDict[k1].desc : "";
                                tmpfield = tmpfield.replace(/{desc}/g, tmp);

                                //tmp = fieldDict[k2] ? fieldDict[k2].type : "string";
                                tmpfield = tmpfield.replace(/{type}/g, fieldtype1);

                                tmp = fieldDict[k1] ? fieldDict[k1].require : "Y";
                                tmpfield = tmpfield.replace(/{require}/g, tmp);

                                tmpfield = tmpfield.replace(/{field}/g, k1);
                                respnseField += tmpfield;
                            }

                        }
                        respnseField += '| | | | | | \n';
                    }

                }
            }

            var html = content;
            var urlkey = jq.url;
            html = html.replace(/{miaoshu}/g, interfaceDescription[urlkey] ? interfaceDescription[urlkey].description : "");
            html = html.replace(/{paramResponse}/g, respnseField);
            html = html.replace(/{content}/g, returnContent);
            html = html.replace(/{paramGet}/g, getField);
            html = html.replace(/{paramPost}/g, postField);
            html = html.replace(/{type}/g, jq.type);
            html = html.replace(/{url}/g, jq.url);
            html = html.replace(/{paramHeader}/g, paramHeader);
            console.log(html);

        };



        //接口描述 及 字段字典文件
        const path = 'makeApiDoc/';
        loadJS(path + "markdown.js", function () {
            var fieldDictFileName = '';
            for (var key in interfaceDescription) {
                if (key == jq.url) {
                    fieldDictFileName = interfaceDescription[key].filename + '.js';
                    break;
                }
            }
            fieldDictFileName = fieldDictFileName ? fieldDictFileName : interfaceDescription.common.filename + '.js';
            loadJS(path + fieldDictFileName, function () {
                //console.log(fieldDict);
                exec();
            });
        });

    }
})(jQuery);

//end JQUERY 插件
