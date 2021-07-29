$(function() {
    var Ajax = {
        get: function(url, fn) {
            // XMLHttpRequest对象用于在后台与服务器交换数据   
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
            xhr.onreadystatechange = function() {
                // readyState == 4说明请求已完成
                if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                    // 从服务器获得数据 
                    fn.call(this, xhr.responseText);
                }
            };
            xhr.send();
        },
        // datat应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
        post: function(url, data, fn) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            // 添加http头，发送信息至服务器时内容编码类型
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                    fn.call(this, xhr.responseText);
                }
            };
            xhr.send(data);
        }
    }
    chrome.storage.sync.get(['now_index'], function(result) {
        var sortN = result['now_index'].sum;
        var postCode = result['now_index'].postCode;
        var num_now = Number(result['now_index'].forN);
        var countryCode = result['now_index'].countryCode;
        var err_num = 0;
        // console.log(num_now);
        setTimeout(function() {
            getPostCode(sortN, postCode, num_now, countryCode);
        }, 5000);
    });
    //获取关键字邮编
    // getPostCode(1);
    function getPostCode(sortN, postCode, num_now, countryCode) {
        var Data = {
            'sortN': sortN
        };
        var flag = 0;
        $.ajax({
            type: 'POST',
            dataType: 'json',
            header: {
                contentType: 'application/x-www-form-urlencoded;charset=utf-8',
            },
            data: Data,
            url: 'https://www.5pbooks.com/pc/amz-postcode/selectByCS?sortN=1',
            success: function(res) {
                // console.log('success');
                // console.log(res);
                // return;
                if (res.data) {
                    var num_all = res.data.length;
                    // var num_now = 0;
                    // console.log(num_now);	
                    // console.log('this now')
                    setTimeout(function() {
                        var _timer = setInterval(function() {
                            if (num_now >= num_all) {
                                var now_index = { 'sum': sortN, 'postCode': 0, 'forN': 0, 'countryCode': 'US' };
                                chrome.storage.sync.set({ 'now_index': now_index }, function(result) {
                                    console.log('保存成功');
                                });
                                scheduledEveryDayEightHour(() => {
                                    window.location.href = "https://www.amazon.com";
                                });
                                clearInterval(_timer);
                            } else {
                                if (res.data[num_now].countryCode == countryCode) {

                                } else {
                                    var now_index = { 'sum': sortN, 'postCode': postCode, 'forN': num_now, 'countryCode': res.data[num_now].countryCode };
                                    chrome.storage.sync.set({ 'now_index': now_index }, function(result) {
                                        console.log('保存成功');
                                    });
                                    var _href = 'www.amazon.';
                                    switch (res.data[num_now].countryCode) {
                                        case 'US':
                                            _href = 'www.amazon.com';
                                            break;
                                        case 'MX':
                                            _href = 'www.amazon.com.mx';
                                            break;
                                        case 'UK':
                                            _href = 'www.amazon.co.uk';
                                            break;
                                        case 'JP':
                                            _href = 'www.amazon.co.jp';
                                            break;
                                        case 'AU':
                                            _href = 'www.amazon.com.au';
                                            break;
                                        default:
                                            _href = 'www.amazon.' + (res.data[num_now].countryCode || 'com');
                                    }
                                    window.location.href = "https://" + _href;
                                }
                                if (res.data[num_now].postId == postCode) {
                                    //邮编未变化开始抓取数据
                                    getQuery(res.data[num_now], 1);
                                    setTimeout(function() {
                                        getQuery(res.data[num_now], 2);
                                        flag = 0;
                                        num_now++;
                                    }, 3000);
                                } else {
                                    var now_index = { 'sum': sortN, 'postCode': res.data[num_now].postId, 'forN': num_now, 'countryCode': countryCode };
                                    chrome.storage.sync.set({ 'now_index': now_index }, function(result) {
                                        console.log('保存成功');
                                    });
                                    if (flag >= 5) {
                                        num_now++;
                                    }
                                    flag++;
                                    //需要改邮编
                                    $('#nav-global-location-slot .nav-a')[0].click();
                                    setTimeout(function() {
                                        $("#GLUXChangePostalCodeLink")[0].click();
                                    }, 1942);
                                    setTimeout(function() {
                                        $("#GLUXZipInputSection .a-span8 .a-declarative").val(res.data[num_now].postId);
                                    }, 2418);
                                    setTimeout(function() {
                                        $("#GLUXZipInputSection .a-span-last span span input").click();
                                    }, 4591);
                                    setTimeout(function() {
                                        $(".a-popover-footer span span span button").click();
                                    }, 6821);
                                }
                            }

                        }, 8000);
                    }, 10000);

                }
            },
            error: function(err) {
                console.log('err');
                console.log(err);
                if (err_num == 1) {
                    return;
                }
                err_num = 1;
                setTimeout(function() {
                    getPostCode(sortN, postCode, num_now, countryCode);
                }, 60 * 60 * 1000);
                // console.log(err);
            }
        })
    }
    //获取亚马逊query接口数据，解析数据及入库操作
    function getQuery(datas, n) {
        var dates = parseInt(new Date().getTime() / 1000);
    // https://www.amazon.com/s/query?k=phone12&page=2&qid=1627283291&ref=sr_pg_1
        var Data = {
            "k": datas.keyWord,
            "page": n,
            "qid": dates,
            "ref": 'sr_pg_' + n,
        };
        var _url = 'https://www.amazon.com/s/query?'
        var i = 0;
        for (keys in Data) {
            if (i == 0) {
                _url += keys + '=' + Data[keys];
            } else {
                _url += '&' + keys + '=' + Data[keys];
            }
            i++;
        }
        Ajax.get(_url, function(res) {
            console.log(res);
            var arr = res.split('&&&');
            console.log(arr.length);
            var Data_arr = [];
            arr.pop();
            for (let i = 0; i < arr.length; i++) {
                // console.log(arr[i])

                // console.log(arr[i]);
                arr[i] = eval(arr[i]);
                arr[i] = arr[i][2];
                // arr[i] = arr[i][2];
                // console.log(arr[i])
                Data_arr[i] = {};
                if (arr[i].asin) {
                    Data_arr[i].asin = arr[i].asin;
                    Data_arr[i].sort = i + 1;
                    Data_arr[i].html = arr[i].html;
                    Data_arr[i].arr = getSimpleText(arr[i].html).split(',');
                    Data_arr[i].html = '';
                    for (let j = 0; j < Data_arr[i].arr.length; j++) {
                        Data_arr[i].arr[j] = Data_arr[i].arr[j].replace(/^\s*|\s*$/g, "");
                        if (Data_arr[i].arr[j] == '') {
                            Data_arr[i].arr.splice(j, 1);
                            j--;
                        }
                    }
                    for (let j = 0; j < Data_arr[i].arr.length; j++) {
                        if (Data_arr[i].arr[j].indexOf('http') != -1) {
                            Data_arr[i].arr.splice(j, 1);
                            j--;
                        }
                    }
                } else {
                    arr.splice(i, 1);
                    i--;
                }
            }
            var data = {
                "pageJSON": {
                    "serchTerm": datas.keyWord,
                    "postCode": datas.postId,
                    "page": n,
                    "date": getDates(),
                    "dataArr": Data_arr
                }
            }
            data = JSON.stringify(data);
            $.ajax({
                type: "POST",
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                url: 'https://www.5pbooks.com/pc/amz-page-data/insert',
                data: data,
                success: function(res) {
                    console.log(res);
                },
                error: function(err) {
                    console.log(err);
                }
            });
            // return;
            // var oStr = '';
            //       var oAjax = null;
            //       //这里需要将json数据转成post能够进行提交的字符串  name1=value1&name2=value2格式
            //       data = JSON.stringify(data);
            //       //这里进行HTTP请求
            //       try{
            //       　　oAjax = new XMLHttpRequest();
            //       }catch(e){
            //       　　oAjax = new ActiveXObject("Microsoft.XMLHTTP");
            //       };
            //       //post方式打开文件
            //       oAjax.open('post','https://www.5pbooks.com/pc/amz-page-data/insert',true);
            //       //post相比get方式提交多了个这个
            //       oAjax.setRequestHeader("Content-type","application/json");
            //       //post发送数据
            //       oAjax.send(data);
            //       oAjax.onreadystatechange = function(){
            //       　　//当状态为4的时候，执行以下操作
            //       　　if(oAjax.readyState == 4){
            //       　　　　try{
            //                   console.log(oAjax.responseText);
            //                   console.log(oAjax);
            //       　　　　}catch(e){
            //       　　　　　　alert('你访问的页面出错了');
            //       　　　　};
            //       　　};
            //       };
        });
    }
    //删除标签
    function getSimpleText(html) {
        var re1 = new RegExp("<.+?>", "g"); //匹配html标签的正则表达式，"g"是搜索匹配多个符合的内容
        var msg = html.replace(re1, ',');
        return msg;
    }
    //获取当前时间
    function getDates() {
        var oDate = new Date();
        var oYear = oDate.getFullYear();
        var oMonth = oDate.getMonth() + 1 < 10 ? "0" + (oDate.getMonth() + 1) : oDate.getMonth() + 1;
        var oDay = oDate.getDate() < 10 ? '0' + oDate.getDate() : oDate.getDate();
        // console.log(oYear + "-" + oMonth + '-' + oDay);
        return oYear + "-" + oMonth + '-' + oDay;
    }
})