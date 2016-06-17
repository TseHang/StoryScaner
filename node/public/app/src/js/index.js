
$(window).load(function() {
  // check if signIn(seesion)
  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/checkLogin',
    success: function(response) {
      if (response.status == 'SUCCESS') {
        if (response.content.signed == true) {
          $('#checkText').text("歡迎你： " + response.content.username);

          // 先消掉後面那頁
          $('#login-slide').css("display", "none");

          $('#loading').delay(1000).animate({ "opacity": 0 }, 300, function() {
            $('#loading').css("display", "none");
            console.log("登入成功!!");
          });

          $('#personalName').text(response.content.username);
        }
        else if(response.content.signed == false){

          $('#checkText').text("");

          // 等Loading 然後登入
          console.log("還沒登入，等loading唷");
          $('#loading').delay(2000).animate({ 'opacity': 0 }, 300, function() {
            $('#loading').css("display", "none");
          });
        }

      } else if (response.status == 'FAIL') {
  
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR + "\n" + errorThrown);
    },
    dataType: 'json'
  });

  console.log("都載入完囉");

  $('form').submit(function(eve){
    eve.preventDefault();
  })
})

$('#signin').click(function(){
  if ($('#signin').attr("value") == "登入"){
    $.ajax({
      method: 'POST',
      contentType: 'application/json',
      url: '/signin',
      data: JSON.stringify({
        username: $('#usrname').val(),
        password: $('#password').val(),
        facebook: false
      }),
      success: function(response) {
        if (response.status == 'SUCCESS'){
          
          $('#sign-status').css('color','#BDD1C1');
          $('#sign-status').text("登入成功!!");

          // 更改personalBar
          if ($('#usrname').val() == "")
            $('#personalName').text("????????");
          else
            $('#personalName').text($('#usrname').val());

          $('#usrname').val("");
          $('#password').val("");


          $('#login-slide').delay(700).animate({"opacity":0}, 500 , function(){
            $('#login-slide').css("display","none");
            console.log("登入成功!!");
          });
        }
        else if(response.status == 'FAIL'){

          $('#sign-status').css('color','red');
          $('#sign-status').text(response.content);
          
          $('#password').val("");
        }
        else {
          alert('出現到這裡就代表你ＧＧ了');
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(jqXHR + "\n" + errorThrown);
      },
      dataType: 'json'
    });
  }
  else if ($('#signin').attr("value") == "註冊"){
    $.ajax({
      method: 'POST',
      contentType: 'application/json',
      url: '/signup',
      data: JSON.stringify({
        username: $('#usrname').val(),
        password: $('#password').val()
      }),
      success: function(response) {
        if (response.status == 'SUCCESS'){
          console.log("註冊成功");

          $('#sign-status').css('color','#BDD1C1');
          $('#sign-status').text("Hi，來登入吧！！");

          alert('恭喜：註冊成功');
        }
        else if(response.status == 'FAIL'){
          $('#sign-status').css('color','red');
          $('#sign-status').text(response.content);
          alert('帳號可能有人使用，或是密碼太過相似');
        }
        else {
          alert('出現到這裡就代表你ＧＧ了');
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(jqXHR + "\n" + errorThrown);
      },
      dataType: 'json'
    });

    $('#usrname').val("");
    $('#password').val("");

    $('#usrname').attr("placeholder","輸入你的電子信箱");
    $('#password').attr("placeholder","密碼");
    $('#signin').attr("value","登入");
  }
})

$('#signup').click(function(){
  if ($('#signup').text() == "＋註冊新帳號"){
    $('#usrname').val("");
    $('#password').val("");

    $('#usrname').attr("placeholder","輸入你的電子信箱");
    $('#password').attr("placeholder","輸入你的新密碼");
    $('#signin').attr("value","註冊");

    $('#signup').text("我要登入！！");
  }
  else{
    $('#usrname').val("");
    $('#password').val("");

    $('#usrname').attr("placeholder","帳號");
    $('#password').attr("placeholder","密碼");
    $('#signin').attr("value","登入");

    $('#signup').text("＋註冊新帳號");
  }
})

// 進入相機
$('.intro2-content-start').click(function() {
  idNum = this.id.split("start")[1] ;

  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/route',
    data: JSON.stringify({
      route: idNum
    }),
    success: function(response) {
      console.log("進入編號："+idNum);

      // 跳轉頁面
      window.location.assign("camera.html");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR + "\n" + errorThrown);
    },
    dataType: 'json'
  });
})


var intro2ContentToggle = 0;
var tempID;

$(document).ready(function (){

  console.log("Dom Tree 建好了");
  
  $('#intro2-btn').click(function(){
    $('.introduction').css("left","-100%");
    $('.route').css("left","0%");
  })

  var intro2Height = $('#content1').height()+24;
  $('.intro2-content').click(function(e){
  	//移動
  	e.preventDefault(); 
  	goToByScroll(this.id);

    pointID = "#intro2-"+this.id;

    //tempID == this.id ==> 同一個  代表縮起來
    //tempID != this.id ==> 不同個  先縮再放
    if (tempID == pointID){
      if (intro2ContentToggle == 0){
        $(pointID).addClass('intro2-content-show');
        $(pointID).css("height" , 2*intro2Height-70);

        intro2ContentToggle = 1;
      }
      else {
        $(pointID).removeClass('intro2-content-show');
        $(pointID).css("height" , 0);

        intro2ContentToggle = 0 ;
      }
    }
    else{
      $(tempID).removeClass('intro2-content-show');
      $(tempID).css("height" , 0);

      $(pointID).addClass('intro2-content-show');
      $(pointID).css("height" , 2*intro2Height-70);
      
      intro2ContentToggle = 1 ;
    }

    tempID = pointID ;
  })

});

function goToByScroll(id){
	// Scroll
  $('.intro2-body').animate({
  	scrollTop: $("#"+id).offset().top -120
  },200);
}

// 
// 
// 往左滑，personalBar!!!!!!
// 
touch.on('#slideleft' , 'swipeleft' , function(ev){
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





