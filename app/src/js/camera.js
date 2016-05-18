var deviceWidth = $(window).width(), deviceHeight = $(window).height();

//開啟視訊串流------------------------------------------
//看瀏覽器支不支援
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var video = document.querySelector('#video');
var canvas = document.querySelector('#picture');

canvas.width = deviceWidth;
canvas.height = deviceHeight*0.8;

//  選擇開啟什麼
var constraints = {
  audio: false,
  video: true
};

//若成功則執行
function successCallback(stream) {
  window.stream = stream; // stream available to console

  //Chrome，Opera用
  if (window.URL)
    video.src = window.URL.createObjectURL(stream);
  //Firefox用
  else
    video.src = stream;
}
//若失敗則執行
function errorCallback(error) {
  alert("無法取得視訊串流 : ", error);
}

var exArray = []; //用來存裝置串流來源  
MediaStreamTrack.getSources(
  function(sourceInfos) {
    for (var i = 0; i != sourceInfos.length; ++i) {
      var sourceInfo = sourceInfos[i];
      if (sourceInfo.kind === 'video') //會遍歷audio,video，所以要判斷 
        exArray.push(sourceInfo.id);
    }
    //取得視訊串流
    navigator.getUserMedia({
      'video': { //0為前置，1為後置
        'optional': [{ 'sourceId': exArray[1] }]
        }
      },
      successCallback, errorCallback
    );
  }
);

//snap Click
document.querySelector('#snap').addEventListener('click', function() {
  snapshot();
}, false);

//拍照-------------------------------------
function snapshot() {
  ctx = canvas.getContext('2d');

  if (stream) {
    ctx.drawImage(video,0 ,0 , canvas.width , canvas.height);
    console.log(ctx);
    //存成image用 - Chrome：“image/webp”，其他：“image/png”
    //document.querySelector('img').src = canvas.toDataURL('image/webp');
  }
}
