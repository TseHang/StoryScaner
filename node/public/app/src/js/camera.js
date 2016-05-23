
//取得裝置高度
var deviceWidth = $(window).width(), deviceHeight = $(window).height();
var images = [];
// load 登入
$(window).load(function() {
  console.log("都載入完囉");

  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/gallery',
    data: null,
    success: function(response) {
      console.log(response.content.images);
      var images = response.content.images;
      leftnavLoadImages(images);
     
      if (response.status == 'FAIL')
        alert(response.content);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR);
    },
    dataType: 'json'
  });
})

//---------  顯示 left-nav 圖片 ------------
function leftnavLoadImages(images){
  for (i = 0 ; i < images.length ; i++){
    $('.left-nav').prepend("<div><img src = \""+ images[i] +"\" alt = \"無法顯示\" ></div>" );
    console.log(i+"  已經完成囉");
  };
  // $('.left-nav').append('<a id = "more-photo" > 更多... </a>');
}

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

//拍照-------------------------------------
function snapshot() {
  ctx = canvas.getContext('2d');

  if (stream) {
    ctx.drawImage(video,0 ,0 , canvas.width , canvas.height);
    //存成image用 - Chrome：“image/webp”，其他：“image/png”
    //document.querySelector('img').src = canvas.toDataURL('image/webp');
  }
}

//Snap Click
touch.on('#snap' , 'tap' , function(ev){
  $('#snapShot').css("display" , "block");
  snapshot();
});


//--------相機拍完照後的回傳 頁面------------
touch.on('#pic-btn-submit' , 'tap' , function(ev){
  console.log(canvas.toDataURL('image/png'));
  
  //Submit photo
  $.ajax({
    method: 'POST',
    contentType: 'application/octet-stream',
    url: '/upload',
    data: canvas.toDataURL(),
    success: function(response) {
     
     if (response.status == 'FAIL')
      alert(response.content);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
    },
    dataType: 'json',
    processData: false
  });

  alert('U have already submit picture!');
  $('#snapShot').css("display" , "none");
});

touch.on('#pic-btn-delete' , 'tap' , function(ev){
  
  //Come back Camera state

  alert('Dlete!!!');
  $('#snapShot').css("display" , "none");
});

//---------- 相機照片 left-nav -----
leftNavWidth = deviceWidth*0.4;
touch.on('#video', 'touchstart', function(ev){
  ev.preventDefault();
});

touch.on('#video', 'swiperight', function(ev){
  $('.left-nav').css("left" , "0px") ;
});
touch.on('#video', 'swipeleft', function(ev){
  $('.left-nav').css("left" , "-40%") ;
});

touch.on('#more-photo', 'tap', function(ev){
  //把藍色縮回去
  $('.left-nav').css("left" , "-40%") ;
  //pictue-container 跑出來
  $('.picture-container').css("left","0px") ;
  console.log("綠色出來");
});

