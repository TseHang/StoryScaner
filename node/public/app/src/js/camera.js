// 一開始對camera.html的設定
//取得裝置高度
var deviceWidth = $(window).width(), deviceHeight = $(window).height();
var imagesAll = [];
var picNum =0 ;

var storyPoints = [];
var tempId = -1;

var userName = "匿名者";

// load 登入
// 還有所有一開始必須做的事情！！
$(window).load(function() {
  console.log("都載入完囉");

  // gallery API
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
      alert("我是galleryAPI\n"+jqXHR);
    },
    dataType: 'json'
  });

  // points API
  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/points',
    data: null,
    success: function(response) {
      storyPoints = response.content.points;
      storyBoxLoad(storyPoints);
     
      if (response.status == 'FAIL')
        alert(response.content);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert("我是pointsAPI\n"+jqXHR);
    },
    dataType: 'json'
  });

  //#intro-map
  touch.on('#intro-map-close' , 'tap' , function(ev){
    $('#intro-map').css("display" , "none");
  });

})

// 
// 
// 登出！！
// ***************************
touch.on('#signout', 'tap', function() {
  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/signout',
    success: function(response) {
      if (response.status == 'SUCCESS') {
        console.log("登出成功");
        alert('已登出');

        //登出 
        window.location.assign("index.html");

      } else if (response.status == 'FAIL') {
        alert('系統不讓你登出，我也不知道為啥');
      } else {
        alert('出現到這裡就代表你ＧＧ了');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR + "\n" + errorThrown);
    },
    dataType: 'json'
  });

})

//---------  顯示 left-nav 圖片 ------------
function leftnavLoadImages(images){
  for (i = 0 ; i < images.length ; i++){

    appendImg(images[i] , i);
    console.log(i+"  已經完成囉");
  };
}

function appendImg (src , pic_id){
  picNum++;
  //class = story-img pic1.2.3.4.....
  $('.left-nav-div').prepend("<div class = \"story-img pic"+pic_id+"\"><img src = \""+ src +"\" alt = \"無法顯示\" ></div>" );
  $('.picture-container-body').prepend("<div class = \"story-img pic"+pic_id+"\" ><img src = \""+ src +"\" alt = \"無法顯示\" ></div>" );
  $('.story-footer').prepend("<div class = \"story-img pic"+pic_id+"\" id = \"pic"+pic_id+"\"><img src = \""+ src +"\" alt = \"無法顯示\" ></div>" );
}

// -------- 顯示 story-box 圖片 ------------
function storyBoxLoad(points){
  for (i = 0 ; i < points.length ; i++){
    id = points[i].routeNum;
    src = points[i].image ;
    unlocked = points[i].unlocked;

    $('.story-box-footer').append("<div class = \"story-img picbox-"+id+"\" id = \"picbox-"+id+"\"><img src = \""+ src +"\" alt = \"無法顯示\" ></div>")

  }
}

$('.story-box-footer').on('click', '.story-img' , function() {

  //先把剛剛選個那個 pic_id 紅色邊匡消掉～～
  $('.'+tempId).removeClass("story-show");

  //選取 this_div.classList[1] --> pic_id
  picbox_id = this.classList[1];
  $('.'+picbox_id).addClass("story-show");

  // 取得id
  id = picbox_id.split("-")[1];

  // 未解開 -> true ， 解開 -> false
  if(storyPoints[id].unlocked == "true"){
    $(".locked").css("display","flex");
  }else{
    $(".locked").css("display","true");
  }

  // 取得三個title 訊息
  path = storyPoints[id].image;
  title = storyPoints[id].title ;
  story = storyPoints[id].story ;

  $('.story-box-content-img>img').attr("src" ,path);
  $('#story-box-title').text(title);
  $('#story-box-content').text(story);

  tempId = picbox_id;
});

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


// ************************************************
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
var left_nav_open = false;

leftNavWidth = deviceWidth*0.4;

touch.on('#video', 'touchstart', function(ev){
  ev.preventDefault();
});

touch.on('#video', 'swiperight', function(ev){
  $('.left-nav').css({
    "left":"0px",
    "boxShadow":"7px 0px 5px rgba(0,0,0,0.4)"
  }) ;

  $('#left-nav-cover').css("right","0%");
});

touch.on('#left-nav-cover', 'swipeleft', function(ev){
  $('.left-nav').css({
    "left" : "-40%",
    "boxShadow":"0px 0px 0px rgba(0,0,0,0.7)"
  }) ;

  $('#left-nav-cover').css("right","100%");
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

  // 把陰影刪掉
  $('.left-nav').css("boxShadow","0px 0px 0px rgba(0,0,0,0.7)");
});

//
//-------picture-container-back
//
touch.on('#picture-container-back' , 'tap' , function(ev){
  //pictue-container 回去
  $('.camera').css("left","0px") ;
  $('.picture-container').css("left","100%") ;
});

// 
// ---------mapbtn -------------------
// 
touch.on('.sub-map' , 'tap' , function(ev){
  //map 跑出來
  $('.camera').css("left","-100%") ;
  $('#map').css("left","0px") ;
});

// 
// ---------storyBoxBtn -------------------
// 
touch.on('.sub-box' , 'tap' , function(ev){
  //story-box 跑出來
  $('.camera').css("left","-100%") ;
  $('.story-box').css("left","0px") ;
})

//
//------- map--back
//
touch.on('#map-back' , 'tap' , function(ev){
  //pictue-container 跑出來
  $('.camera').css("left","0px") ;
  $('#map').css("left","100%") ;
});

//
//------- story-box--back
//
touch.on('#story-box-back' , 'tap' , function(ev){
  //pictue-container 跑出來
  $('.camera').css("left","0px") ;
  $('.story-box').css("left","100%") ;
});

// 
// 
//  /////////////
var pic_class_id ;
var images = [];
var autoSave_timer ;
$('.left-nav').on('click', '.story-img' , function() {
  //story 跑出來
  $('.camera').css("left","-100%") ;
  $('#story').css("left","0px") ;

  getStory(this);
  
});


$('.picture-container-body').on('click', '.story-img' , function() {

  //story 跑出來
  $('#story').css("left","0px") ;

  getStory(this);

});

$('.story-footer').on('click', '.story-img' , function() {
  
  // 把剛剛那張照片儲存的timer 消掉
  clearInterval(autoSave_timer);

  //先把剛剛選個那個 pic_id 紅色邊匡消掉～～
  $('.'+pic_class_id).removeClass("story-show");
  getStory(this);
});

function getStory(this_div){

  //選取 this_div.classList[1] --> pic_id
  pic_class_id = this_div.classList[1];
  $('.'+pic_class_id).addClass("story-show");

  //清空images
  images = [];
  imageName = this_div.children[0].src.split("/")[4].split(".")[0];
  images.push(imageName);

  //存下path 
  path = this_div.children[0].src;

  //移動到圖片位置
  goFindPic('.story-footer' , pic_class_id , picNum);

  // 自動儲存
  autoSave_timer = setInterval(autoSave,500 , imageName);

  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/story',
    data: JSON.stringify({
      images:images
    }),
    success: function(response) {
      if (response.status == 'SUCCESS'){
        $('.story-content-img img').attr("src" ,path);

        // 回傳上次儲存的內容
        $('#story-self-title').val(response.content[images[0]].title);
        $('#story-self-content').val(response.content[images[0]].story);
        // console.log("跑出： "+path+" 故事");
      }
      else if (response.status == 'FAIL'){
        alert(response);
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
}

function autoSave(imgPath){
  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/edit',
    data: JSON.stringify({
      image:imgPath,
      title:$('#story-self-title').val(),
      story:$('#story-self-content').val()
    }),
    success: function(response) {
      if (response.status == 'SUCCESS'){
        console.log("successSaved");
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
}

//
//------- story--back
//
touch.on('#story-back' , 'tap' , function(ev){
  //pictue-container 跑出來
  $('.camera').css("left","0px") ;
  $('#story').css("left","100%") ;

  $('.'+pic_class_id).removeClass("story-show");

  // 清掉setTimeOut
  clearInterval(autoSave_timer);
});


function goFindPic(goContainer , moveId , picNum){

  pic_id = moveId.split("pic")[1];

  // Scroll
  $(goContainer).animate({
    scrollLeft: 90*(picNum - 1 - pic_id),
  },400);
}

// 
// 
// 往左滑，personalBar!!!!!!
// 
touch.on('#camera' , 'swipeleft' , function(ev){
  console.log(left_nav_open);
  if (left_nav_open === true )
    ;
  else
    $('#personalBar').css("left","0%");
});

touch.on('#personalBar' , 'swiperight' , function(ev){
  $('#personalBar').css("left","100%");
});

touch.on('#signout', 'tap', function() {
  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/signout',
    success: function(response) {
      if (response.status == 'SUCCESS') {
        console.log("登出成功");
        alert('已登出');

        //登出 
        window.location.assign("index.html");

      } else if (response.status == 'FAIL') {
        alert('系統不讓你登出，我也不知道為啥');
      } else {
        alert('出現到這裡就代表你ＧＧ了');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR + "\n" + errorThrown);
    },
    dataType: 'json'
  });

})


