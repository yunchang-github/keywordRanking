// scheduledEveryDayEightHour(() => {
// 	window.open("https://sellercentral.amazon.com/gp/site-metrics/report.html");
// 	var now_index = {"num":0};
// 	chrome.storage.sync.set({'now_index':now_index}, function (result) {
// 	    console.log("保存成功");
// 	});
// });

// var obj_area = $("#sc-mkt-picker-switcher-select option");
// var i = 0;
// alert("first");
// var _timer = setInterval(function(){
//     $("#sc-mkt-picker-switcher-select").val(obj_area.eq(i).val()).trigger("change");
//     i++;
//     console.log(obj_area);
//     if(i >= obj_area.length){
//         clearInterval(_timer);
//     }
//     alert("第"+i+"次");
// },5000);

// // alert("background.js")
// /**
//  * 请求后台的url列表---列表内的url不拦截
//  * @type {Array}
//  */
// let REQUEST_URLS = [];

// //3秒后开始任务
// let openTimer = setTimeout(function () {
//     initStartSchedule();
//     alert("starts!!")
//     // alert('请先右上角设置账号密码、网店国家代码等信息，否则该插件不能正常运行');
//     clearTimeout(openTimer);
// }, 3000);

// /**
//  * 开始定时任务，每天8点
//  */
// scheduledEveryDayEightHour(() => {
//     initStartSchedule();
//     //20分钟之后检查页面是否全部获取---获取失败，将给后台发送错误信息
//     let timer = setTimeout(() => {
//         chromeStorageSyncGet('amazon_666_nowAction', function (res) {
//             if (null == res || '' === res) {
//                 return;
//             }
//             chromeStorageSyncGet('amazon_666_shop', function (shop) {
//                 chromeStorageSyncGet('amazon_666_area', function (area) {
//                     switch (res) {
//                         //销量与访问量
//                         case GLOBAL.keySalesTrafficTimeSeries: {
//                             handleDataGetError(shop, area, `获取${GLOBAL.nameSalesTrafficTimeSeries}失败`);
//                             handleDataGetError(shop, area, `获取${GLOBAL.nameDetailSalesTrafficByParentItem}失败`);
//                             handleDataGetError(shop, area, `获取${GLOBAL.nameDetailSalesTrafficByChildItem}失败`);
//                         }
//                             break;
//                         //父商品详情
//                         case GLOBAL.keyDetailSalesTrafficByParentItem: {
//                             handleDataGetError(shop, area, `获取${GLOBAL.nameDetailSalesTrafficByParentItem}失败`);
//                             handleDataGetError(shop, area, `获取${GLOBAL.nameDetailSalesTrafficByChildItem}失败`);
//                         }
//                             break;
//                         //子商品详情
//                         case GLOBAL.keyDetailSalesTrafficByChildItem: {
//                             handleDataGetError(shop, area, `获取${GLOBAL.nameDetailSalesTrafficByChildItem}失败`);
//                         }
//                             break;
//                         default: {

//                         }
//                     }
//                     chrome.storage.sync.set({'amazon_666_nowAction': null}, function (result) {
//                     });
//                 })
//             });
//         });
//         clearTimeout(timer);
//     }, 1000 * 60 * 20);
// });

// /**
//  * 初始化开始定时任务
//  */
// function initStartSchedule() {
//     REQUEST_URLS = [];
//     window.open(GLOBAL.urlBusinessReport);
//     //开始销量与访问量数据获取
//     chrome.storage.sync.set({'amazon_666_nowAction': GLOBAL.keySalesTrafficTimeSeries}, function (result) {
//     });
// }

// /**
//  * 亚马逊获取数据的接口url部分
//  * @type {string}
//  */
// const GET_DATA_URL = "https://sellercentral.amazon.com/gp/site-metrics/load-report-JSON.html/ref=au_xx_cont_sitereport";

// /**
//  * 监听浏览器请求---请求发送之前
//  */
// chrome.webRequest.onBeforeRequest.addListener(details => {
//     let {url} = details;
//     //如果当前是亚马逊获取数据接口
//     if (!REQUEST_URLS.includes(url) && url.includes(GET_DATA_URL)) {
//         chromeStorageSyncGet('amazon_666_shop', function (shop) {
//             if (isBlank(shop)) {
//                 alert('警告，您还没没有设置网点名称，请先用插件设置网点名称');
//                 chrome.storage.sync.set({'amazon_666_nowAction': null}, function (result) {
//                 });
//                 return;
//             }
//             chromeStorageSyncGet('amazon_666_area', function (area) {
//                 if (isBlank(area)) {
//                     alert('警告，您还没没有设置国家代码，请先用插件设置国家代码');
//                     chrome.storage.sync.set({'amazon_666_nowAction': null}, function (result) {
//                     });
//                     return;
//                 }
//                 //当前是销量与访问量接口
//                 if (url.includes(GLOBAL.keySalesTrafficTimeSeries)) {
//                     REQUEST_URLS.push(url);
//                     handleSalesTrafficTimeSeries(url, shop, area, 0);
//                     return;
//                 }
//                 //当前是父商品详情页面上的销售量与访问量
//                 if (url.includes(GLOBAL.keyDetailSalesTrafficByParentItem)) {
//                     url = urlParamReplaceValue(url, 'filterFromDate', getDate(-2));
//                     url = urlParamReplaceValue(url, 'filterToDate', getDate(-2));
//                     url = urlParamReplaceValue(url, 'fromDate', getDate(-2));
//                     url = urlParamReplaceValue(url, 'toDate', getDate(-2));
//                     REQUEST_URLS.push(url);
//                     handleDetailSalesTrafficByParentItem(url, shop, area, 0);
//                     return;
//                 }
//                 //当前是子商品详情页面上的销售量与访问量
//                 if (url.includes(GLOBAL.keyDetailSalesTrafficByChildItem)) {
//                     url = urlParamReplaceValue(url, 'filterFromDate', getDate(-2));
//                     url = urlParamReplaceValue(url, 'filterToDate', getDate(-2));
//                     url = urlParamReplaceValue(url, 'fromDate', getDate(-2));
//                     url = urlParamReplaceValue(url, 'toDate', getDate(-2));
//                     REQUEST_URLS.push(url);
//                     handleDetailSalesTrafficByChildItem(url, shop, area, 0);
//                 }
//             });
//         });
//     }
// }, {
//     urls: ["<all_urls>"],
//     types: ["xmlhttprequest"]
// });

// /**
//  * 错误重试次数
//  * @type {number}
//  */
// const MAX_ERROR_NUM = 5;

// /**
//  * 基础请求地址
//  * @type {string}
//  */
// // const BASE_URL = "https://sspa.mightyoung.com/pc";

// const BASE_URL = "http://192.168.3.233:8080/pc";

// /**处理销量与访问量接口
//  *
//  * @param url
//  * @param shop
//  * @param area
//  * @param errorNum
//  */
// function handleSalesTrafficTimeSeries(url, shop, area, errorNum = 0) {
//     if (errorNum > MAX_ERROR_NUM) {
//         handleDataGetError(shop, area, `获取${GLOBAL.nameSalesTrafficTimeSeries}失败`);
//         // alert('获取销量与访问量失败');
//         return;
//     }
//     $.ajax({
//         url,
//         success(res) {
//             res.match('\"rows\":\\[\\[.*\"\\]\\]').map(function (value) {
//                 let v = value.substring(7);
//                 let data = JSON.parse(v);
//                 if (null == data || 0 >= data.length) {
//                     errorNum++;
//                     handleSalesTrafficTimeSeries(url, shop, area, errorNum);
//                     return;
//                 }
//                 let row = data[data.length - 1];
//                 row[16] = $(row[16]).text();
//                 row[17] = $(row[17]).text();
//                 $.ajax({
//                     type: 'delete',
//                     timeout: 1000 * 60,
//                     url: BASE_URL + '/amazon/advertChromeExAid/salesAndTraffic',
//                     data: {
//                         data: JSON.stringify(row),
//                         shop,
//                         area
//                     },
//                     success(res) {
//                         let {code, msg} = res;
//                         if (200 === code) {
//                             REQUEST_URLS = arrayRemove(REQUEST_URLS, url);
//                             return;
//                         }
//                         document.write(`<h1>${msg}</h1>`);
//                         console.warn(res);
//                         errorNum++;
//                         handleSalesTrafficTimeSeries(url, shop, area, errorNum);
//                     },
//                     error(error) {
//                         console.warn(error['responseJSON'] || error);
//                         errorNum++;
//                         handleSalesTrafficTimeSeries(url, shop, area, errorNum);
//                     }
//                 });
//             });
//         },
//         error(error) {
//             console.warn(error['responseJSON'] || error);
//             errorNum++;
//             handleSalesTrafficTimeSeries(url, shop, area, errorNum);
//         }
//     });
// }

// /**处理父商品详情页面上的销售量与访问量
//  *
//  * @param url
//  * @param shop
//  * @param area
//  * @param errorNum
//  */
// function handleDetailSalesTrafficByParentItem(url, shop, area, errorNum = 0) {
//     if (errorNum > MAX_ERROR_NUM) {
//         handleDataGetError(shop, area, `获取${GLOBAL.nameDetailSalesTrafficByParentItem}失败`);
//         // alert('获取父商品详情页面上的销售量与访问量失败');
//         return;
//     }
//     $.ajax({
//         url,
//         success(res) {
//             // alert(res);
//             res.match('\"rows\":\\[\\[.*\"\\]\\]').map(function (value) {
//                 let v = value.substring(7);
//                 let data = JSON.parse(v);
//                 if (null == data || 0 >= data.length) {
//                     return;
//                 }
//                 data.forEach((row) => {
//                     row[0] = $(row[0]).text();
//                     row[3] = $(row[3]).text();
//                     row[5] = $(row[5]).text();
//                     row[6] = $(row[6]).text();
//                     row[9] = $(row[9]).text();
//                     row[10] = $(row[10]).text();
//                 });
//                 alert("datas");
//                 alert(data);
//                 console.log(data);
//                 $.ajax({
//                     type: 'delete',
//                     timeout: 1000 * 60,
//                     url: BASE_URL + '/amazon/advertChromeExAid/detailSalesTrafficByParentItem',
//                     data: {
//                         data: JSON.stringify(data),
//                         shop,
//                         area
//                     },
//                     success(res) {
//                         let {code} = res;
//                         if (200 === code) {
//                             REQUEST_URLS = arrayRemove(REQUEST_URLS, url);
//                             return;
//                         }
//                         alert("success_res")
//                         alert(res)
//                         console.warn(res);
//                         errorNum++;
//                         handleDetailSalesTrafficByParentItem(url, shop, area, errorNum);
//                     },
//                     error(error) {
//                         alert("err_res")
//                         alert(error)
//                         console.warn(error['responseJSON'] || error);
//                         errorNum++;
//                         handleDetailSalesTrafficByParentItem(url, shop, area, errorNum);
//                     }
//                 });
//             });
//         },
//         error(error) {
//             console.warn(error['responseJSON'] || error);
//             errorNum++;
//             handleDetailSalesTrafficByParentItem(url, shop, area, errorNum);
//         }
//     });
// }

// /**处理子商品详情页面上的销售量与访问量
//  *
//  * @param url
//  * @param shop
//  * @param area
//  * @param errorNum
//  */
// function handleDetailSalesTrafficByChildItem(url, shop, area, errorNum = 0) {
//     if (errorNum > MAX_ERROR_NUM) {
//         handleDataGetError(shop, area, `获取${GLOBAL.nameDetailSalesTrafficByChildItem}失败`);
//         // alert('获取子商品详情页面上的销售量与访问量失败');
//         return;
//     }
//     $.ajax({
//         url,
//         success(res) {
//             res.match('\"rows\":\\[\\[.*\"\\]\\]').map(function (value) {
//                 let v = value.substring(7);
//                 let data = JSON.parse(v);
//                 if (null == data || 0 >= data.length) {
//                     return;
//                 }
//                 data.forEach((row) => {
//                     row[0] = $(row[0]).text();
//                     row[1] = $(row[1]).text();
//                     row[4] = $(row[4]).text();
//                     row[6] = $(row[6]).text();
//                     row[7] = $(row[7]).text();
//                     row[10] = $(row[10]).text();
//                     row[11] = $(row[11]).text();
//                 });
//                 $.ajax({
//                     type: 'delete',
//                     timeout: 1000 * 60,
//                     url: BASE_URL + '/amazon/advertChromeExAid/detailSalesTrafficByChildItem',
//                     data: {
//                         data: JSON.stringify(data),
//                         shop,
//                         area
//                     },
//                     success(res) {
//                         let {code} = res;
//                         if (200 === code) {
//                             REQUEST_URLS = arrayRemove(REQUEST_URLS, url);
//                             return;
//                         }
//                         console.warn(res);
//                         errorNum++;
//                         handleDetailSalesTrafficByChildItem(url, shop, area, errorNum);
//                     },
//                     error(error) {
//                         console.warn(error['responseJSON'] || error);
//                         errorNum++;
//                         handleDetailSalesTrafficByChildItem(url, shop, area, errorNum);
//                     }
//                 });
//             });
//         },
//         error(error) {
//             console.warn(error['responseJSON'] || error);
//             errorNum++;
//             handleDetailSalesTrafficByChildItem(url, shop, area, errorNum);
//         }
//     });
// }

// /**
//  * 处理数据获取错误
//  */
// function handleDataGetError(shop, area, task) {
//     let date = new Date();
//     let year = date.getFullYear();
//     let month = date.getMonth() + 1;
//     month = month > 9 ? month : '0' + month;
//     let day = date.getDate();
//     day = day > 9 ? day : '0' + day;
//     let time = `${year}-${month}-${day} 08:00:00`;
//     sendMsg(shop, area, time, task, 0);
// }

// /**给后台发送消息
//  *
//  * @param shop
//  * @param area
//  * @param time
//  * @param task
//  * @param errorNum
//  */
// function sendMsg(shop, area, time, task, errorNum) {
//     if (errorNum > 5) {
//         alert(task + '定时任务失败,并且没有记录到后台');
//         return;
//     }
//     errorNum++;
//     $.ajax({
//         type: 'delete',
//         timeout: 1000 * 60,
//         url: BASE_URL + '/data/record/dataGetErrorRecord/chromeAddRecord',
//         data: {
//             date: time,
//             shop,
//             area,
//             name: task,
//             remark: `浏览器获取亚马逊后台数据错误，任务名称:${task},出错时间:${time}`
//         },
//         success(res) {
//             let {code} = res;
//             if (200 !== code) {
//                 sendMsg(shop, area, time, task, errorNum);
//             }
//         },
//         error(error) {
//             let timer = setTimeout(() => {
//                 sendMsg(shop, area, time, task, errorNum);
//                 clearTimeout(timer);
//             }, 1000 * (2 * errorNum + 1));
//         }
//     });
// }

//