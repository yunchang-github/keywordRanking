/**
 * 判断是否为空
 * @param str
 * @returns {boolean}
 */
function isBlank(str) {
    if (null == str) {
        return true;
    }
    return '' === ('' + str).replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * 从谷歌存储中取出数据
 * @param key
 * @param success
 */
function chromeStorageSyncGet(key, success = function() {

}) {
    chrome.storage.sync.get(key, function(result) {
        success(result[key]);
    });
}

/**url地址参数值替换
 *
 * @param url
 * @param key
 * @param value
 * @param isFirst
 * @returns {void | string | *}
 */
function urlParamReplaceValue(url, key, value, isFirst = false) {
    let reg = (isFirst ? "?" : "&") + key + "=[^&]*&";
    let nowValue = (isFirst ? "?" : "&") + key + "=" + value + "&";
    return url.replace(new RegExp(reg), nowValue);
}

/**获取距离现在某天的日期
 *
 * @param num
 */
function getDate(num = 0) {
    let date = new Date();
    date = new Date(date.getTime() + num * 24 * 60 * 60 * 1000);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month > 9 ? month : '0' + month;
    let day = date.getDate();
    day = day > 9 ? day : '0' + day;
    return year + '-' + month + '-' + day;
}

/**
 * 数组移除某个元素
 * @param array
 * @param value
 */
function arrayRemove(array, value) {
    return array.filter(item => item !== value);
}
/**
 * 定时任务每天1点
 */
function scheduledEveryDayEightHour(success = function() {

}) {
    //1点时候的分钟数
    let everyDayEightHourSecond = hourMinuteSecondToSecond(1, 0, 0);
    let date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let nowSecond = hourMinuteSecondToSecond(hour, minute, second);
    if (everyDayEightHourSecond === nowSecond) {
        //当前时间为8点
        startScheduledEveryDayEightHour(success());
    } else if (everyDayEightHourSecond > nowSecond) {
        //当前时间早于8点
        let timer = setTimeout(() => {
            startScheduledEveryDayEightHour(success());
            clearTimeout(timer);
        }, (everyDayEightHourSecond - nowSecond) * 1000);
    } else if (everyDayEightHourSecond < nowSecond) {
        //当前时间晚于8点
        let everyDayTwentyThreeHourFiftyNineFiftyNineSecond = hourMinuteSecondToSecond(23, 59, 59);
        let timer = setTimeout(() => {
            startScheduledEveryDayEightHour(success());
            clearTimeout(timer);
        }, (everyDayTwentyThreeHourFiftyNineFiftyNineSecond - nowSecond + 1 + everyDayEightHourSecond) * 1000);
    }
}

/**小时、分钟、秒转化为秒
 *
 * @param hour
 * @param minute
 * @param second
 * @returns {*}
 */
function hourMinuteSecondToSecond(hour, minute, second) {
    return hour * 60 * 60 + minute * 60 + second;
}

/**开始8点的定时任务
 *
 * @param success
 */
function startScheduledEveryDayEightHour(success = function() {

}) {
    success();
    setInterval(() => {
        success();
    }, 24 * 60 * 60 * 1000);
}