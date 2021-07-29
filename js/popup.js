
//启动数据获取任务
$('#begin').click(() => {
    let sum = $('#sum').val();
    if (isBlank(sum)) {
        confirm('请输入服务器序号');
        return;
    }
    window.open("https://www.amazon.com");
    var now_index = {"sum":sum,'postCode':0,'forN':0,'countryCode':'US'};
    chrome.storage.sync.set({'now_index':now_index}, function (result) {
        console.log("保存成功");
    });

});