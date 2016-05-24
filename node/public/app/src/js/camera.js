
//取得裝置高度
var deviceWidth = $(window).width(), deviceHeight = $(window).height();
var imagesAll = [];
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

      imagesAll = response.content.images;
      leftnavLoadImages(imagesAll);
     
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

    appendImg(images[i]);
    console.log(i+"  已經完成囉");
  };
}

function appendImg (src){
  $('.left-nav').prepend("<div><img class = \"story-img\" src = \""+ src +"\" alt = \"無法顯示\" ></div>" );
  $('.picture-container-body').prepend("<div><img class = \"story-img\" src = \""+ src +"\" alt = \"無法顯示\" ></div>" );
  $('.story-footer').prepend("<div><img class = \"story-img\" src = \""+ src +"\" alt = \"無法顯示\" ></div>" );
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
  //Upload photo
  $.ajax({
    method: 'POST',
    contentType: 'application/octet-stream',
    url: '/upload',
    data: canvas.toDataURL(),
    success: function(response) {
      if (response.status == 'SUCCESS'){
        appendImg(response.content.path);
        alert('照片成功儲存!');

        console.log(response.content);
      }
      else if (response.status == 'FAIL'){
        alert('上傳過程出錯！\nerror: '+response.content);
      }
      else{
        alert('出現這個代表你真的完蛋惹');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
    },
    dataType: 'json',
    processData: false
  });

  $('#snapShot').css("display" , "none");
});

touch.on('#pic-btn-delete' , 'tap' , function(ev){
  
  //Come back Camera state

  console.log('Dlete!!!');
  $('#snapShot').css("display" , "none");
});

//
//---------- 相機照片 left-nav -----
//
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

//
//------- 更多--> 進入 picture-cpntainer
//
touch.on('#more-photo', 'tap', function(ev){
  //把藍色縮回去
  $('.left-nav').css("left" , "-40%") ;

  //pictue-container 跑出來
  $('.camera').css("left","-100%") ;
  $('.picture-container').css("left","0px") ;
});

//
//-------picture-container-back
//
touch.on('#picture-container-back' , 'tap' , function(ev){
  //pictue-container 跑出來
  $('.camera').css("left","0px") ;
  $('.picture-container').css("left","100%") ;
});

// 
// ---------mapbtn -------------------
// 
touch.on('.sub-map' , 'tap' , function(ev){
  //pictue-container 跑出來
  $('.camera').css("left","-100%") ;
  $('#map').css("left","0px") ;
});

//
//------- map--back
//
touch.on('#map-back' , 'tap' , function(ev){
  //pictue-container 跑出來
  $('.camera').css("left","0px") ;
  $('#map').css("left","100%") ;
});

// 
// ---------storty -------------------
// 需要用 子元素監聽 才監聽得到～
// 
// touch.on('.story-img' , 'tap' , '.left-nav' ,function(ev){
//   //pictue-container 跑出來
//   $('.camera').css("left","-100%") ;
//   $('#story').css("left","0px") ;

//   console.log(111);
// });

$('.left-nav').on('click', '.story-img' , function() {
    //pictue-container 跑出來
  $('.camera').css("left","-100%") ;
  $('#story').css("left","0px") ;

  var images = [];
  images.push(this.src.split("/")[4].split(".")[0]);

  //存下path 
  path = this.src;

  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/story',
    data: JSON.stringify({
      images:images
    }),
    success: function(response) {
      if (response.status == 'SUCCESS'){
        $('.story-content-text').html("&nbsp;&nbsp;&nbsp;"+response.content.stories[images[0]]);
        $('.story-content-img img').attr("src" ,this.src );
        console.log($('.story-content-img img').attr("src",path));
        console.log(path);
      }
      else if (response.status == 'FAIL'){
        alert(response.content);
      }
      else{
        alert('出現這個代表你真的完蛋惹');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
    },
    dataType: 'json',
  });

  console.log("出來照片囉");
});


//
//------- story--back
//
touch.on('#story-back' , 'tap' , function(ev){
  //pictue-container 跑出來
  $('.camera').css("left","0px") ;
  $('#story').css("left","100%") ;
});
