//启动数据获取任务
$('#begin').click(() => {
    let sum = $('#sum').val();
    if (isBlank(sum)) {
        confirm('请输入任务数量');
        return;
    }
    let mac=new Date().getTime()
    window.open("https://www.amazon.com");
    var now_index = {"sum":sum,'postcode':0,'mac':mac,'forN':0,'country':'US'};
    chrome.storage.sync.set({'now_index':now_index}, function (result) {
        console.log("保存成功");
    });
});