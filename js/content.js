$(function() {
    let resultArr=[]
    let total=0
    let numFlag=0
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
        let sortN = result['now_index'].sum;
        let postcode = result['now_index'].postcode;
        let num_now = Number(result['now_index'].forN);
        let country = result['now_index'].country;
        let mac = result['now_index'].mac;
        let err_num = 0;
        // console.log(num_now);
        setTimeout(function() {
            getpostcode(sortN, postcode, num_now, country,mac);
        }, 5000);
    });
    //获取关键字邮编
    // getpostcode(1);
    function getpostcode(sortN, postcode, num_now, country,mac) {
        // 如果当前已经是目标的邮编了
        // 判断是否有任务
        let tempData=JSON.parse(sessionStorage.getItem('yc-postcode'))
        let postcodePage=document.getElementById('glow-ingress-line2')  
        if(tempData && postcodePage.innerText.indexOf(tempData[0].postcode)!==-1){
            // 处理数据
            handlePostcode(sortN, postcode, num_now, country,mac,tempData)
        }else{
            $.ajax({
                type: 'GET',
                dataType: 'json',
                header: {
                    contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                },
                // data: Data,
                // url: 'https://www.5pbooks.com/pc/amz-postcode/selectByCS?sortN=1',
                url:"https://www.5pbooks.com/pc/postcode/selParams?threshold="+sortN+"&mac="+mac,
                success: function(res) {
                   if(res.data){
                    handlePostcode(sortN, postcode, num_now, country,mac,res.data)
                   }
                },
                error: function(err) {
                    console.log('err',err);
                    if (err_num == 1) {
                        return;
                    }
                    err_num = 1;
                    setTimeout(function() {
                        getpostcode(sortN, postcode, num_now, country,mac);
                    }, 60 * 60 * 1000);
                }
            })
        }
    }
    function handlePostcode(sortN, postcode, num_now, country,mac,resData){
        var flag = 0;
        var num_all = resData.length;
        total=num_all
        if(num_all===0){
            numFlag ++
            if(numFlag >1){
                // 第二次任务为空时 启用定时任务
                var now_index = { 'sum': sortN, 'postcode': 0, 'forN': 0, 'mac':mac,'country': 'US' };
                chrome.storage.sync.set({ 'now_index': now_index }, function(result) {
                    console.log('保存成功');
                });
                scheduledEveryDayEightHour(() => {
                    window.location.href = "https://www.amazon.com";
                });
            }else{
                // 第一次任务为空时 过10分钟再请求一次
                setTimeout(()=>{
                    getpostcode(sortN, 0, 0, country,mac)
                },30000)
            }
        }else{
            let _timer = setInterval(function() {
                if (num_now >= num_all) {
                    // 获取下一批任务
                    clearInterval(_timer);
                    setTimeout(function() {
                        getpostcode(sortN, 0, 0, country,mac)
                    },15000)
                } else {
                    // country 目前只有 US
                    // if (resData[num_now].country == country) {

                    // } else {
                    //     var now_index = { 'sum': sortN, 'postcode': postcode, 'forN': num_now,'mac':mac, 'country': resData[num_now].country };
                    //     chrome.storage.sync.set({ 'now_index': now_index }, function(result) {
                    //         console.log('保存成功');
                    //     });
                    //     var _href = 'www.amazon.';
                    //     switch (resData[num_now].country) {
                    //         case 'US':
                    //             _href = 'www.amazon.com';
                    //             break;
                    //         case 'MX':
                    //             _href = 'www.amazon.com.mx';
                    //             break;
                    //         case 'UK':
                    //             _href = 'www.amazon.co.uk';
                    //             break;
                    //         case 'JP':
                    //             _href = 'www.amazon.co.jp';
                    //             break;
                    //         case 'AU':
                    //             _href = 'www.amazon.com.au';
                    //             break;
                    //         default:
                    //             _href = 'www.amazon.' + (resData[num_now].country || 'com');
                    //     }
                    //     window.location.href = "https://" + _href;
                    // }
                    sessionStorage.removeItem('yc-postcode')
                    let postcodePage=document.getElementById('glow-ingress-line2')  
                    if (postcodePage.innerText.indexOf(resData[0].postcode)!==-1 ||　resData[num_now].postcode == postcode) {
                        //邮编未变化开始抓取数据
                        getQuery(resData[num_now], 1, num_now,mac);
                        setTimeout(function() {
                            getQuery(resData[num_now], 2, num_now,mac);
                        },1000)
                        setTimeout(function() {
                            getQuery(resData[num_now], 3, num_now,mac);
                            flag = 0;
                            ++num_now;
                        }, 2000);
                    } else {
                        clearInterval(_timer);
                        var now_index = { 'sum': sortN, 'postcode': resData[num_now].postcode,'mac':mac, 'forN': num_now, 'country': country };
                        chrome.storage.sync.set({ 'now_index': now_index }, function(result) {
                            console.log('保存成功');
                        });
                        // 邮编只有5个的判断 ?
                        if (flag >= 5) {
                            num_now++;
                        }
                        flag++;
                        // 将已经请求的任务保存在sessionStorage中
                        sessionStorage.setItem('yc-postcode',JSON.stringify(resData))
                        //需要改邮编
                        $('#nav-global-location-slot .nav-a')[0].click();
                        setTimeout(function() {
                            $("#GLUXChangePostalCodeLink")[0].click();
                        }, 1942);
                        setTimeout(function() {
                            $("#GLUXZipInputSection .a-span8 .a-declarative").val(resData[num_now].postcode);
                        }, 2418);
                        setTimeout(function() {
                            $("#GLUXZipInputSection .a-span-last span span input").click();
                        }, 4591);
                        setTimeout(function() {
                            $(".a-popover-footer span span span button").click();
                        }, 6821);
                    }
                }
            }, 4000);
        }
    }
    //获取亚马逊query接口数据，解析数据及入库操作  num是代表当前是第几行的索引
    function getQuery(datas, n, num, mac) {
        var dates = parseInt(new Date().getTime() / 1000);
        var Data = {
            "k": datas.keyword,
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
            var arr = res.split('&&&');
            var Data_arr = [];
            arr.pop();
            for (let i = 0; i < arr.length; i++) {
                arr[i] = eval(arr[i]);
                arr[i] = arr[i][2];
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
            Data_arr.forEach((item,index)=>{
                if(!item.asin){
                    Data_arr.splice(index, 1);
                }else{
                    item['serchTerm']=datas.keyword
                    item['postCode']=datas.postcode
                    item['page']=n,
                    item['keyId']=datas.keyId
                }
            })
            let _data={}
            let tempArr=[]
            let insertNum=10
            if(total==11){
                insertNum=6
            }
            for (let j = 0; j < total; j++){
                if((j+1) % insertNum ==0) tempArr.push(j)
            } 
            let tempFlag=tempArr.some(item=>{
                return item===num
              })
            if(tempFlag &&　n ===3){
                resultArr=[...resultArr,...Data_arr]
                _data = {
                    "pageJSON": {
                        "date": getDates(),
                        "mac":mac,
                        "country":datas.country,
                        "dataArr": resultArr
                    }
                }
                hanleResult(_data)
                resultArr=[]
            }else{
                // 判断是否是最后一条
                if(num == total-1 && n ===3){
                    resultArr=[...resultArr,...Data_arr]
                    _data = {
                        "pageJSON": {
                            "date": getDates(),
                            "mac":mac,
                            "country":datas.country,
                            "dataArr": resultArr
                        }
                    }
                    hanleResult(_data)
                    resultArr=[]
                }else{
                    resultArr=[...resultArr,...Data_arr] 
                }
            }
        });
    }
    // 数据存入接口  10个关键词一组
    function hanleResult(_data){
        data = JSON.stringify(_data);
        $.ajax({
            type: "POST",
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            // url: 'https://www.5pbooks.com/pc/amz-page-data/insert',
            url: 'https://www.5pbooks.com/pc/postcode/insertPageDataPlus',
            data: data,
            success: function(res) {
                console.log(res);
            },
            error: function(err) {
                console.log(err);
            }
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