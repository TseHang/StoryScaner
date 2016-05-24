$(window).load(function() {
  console.log("都載入完囉");

  $('form').submit(function(eve){
    eve.preventDefault();
  })
})

$('#signin').click(function(){
  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/signin',
    data: JSON.stringify({
      username: $('#usrname').val(),
      password: $('#password').val()
    }),
    success: function(response) {
      if (response.status == 'SUCCESS'){
        console.log("登入成功");

        $('#sign-status').css('color','#41637C');
        $('#sign-status').text("登入成功!!");

        $('#modal').delay(700).animate({"opacity":0}, 500 , function(){
          $('#modal').css("display","none");
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
})

$('#signup').click(function(){
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

        $('#sign-status').css('color','#41637C');
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
})

var intro2ContentToggle = 0;
var tempID;

$(document).ready(function (){

  console.log("Dom Tree 建好了");
  
  var introSwiper = new Swiper ('.intro-container', {
    direction: 'horizontal',
    //loop: true,
  }) ;

  $('a#okbtn').click(function(){
  	introSwiper.unlockSwipeToNext();
  	introSwiper.slideNext(300); 
  })

  $('.intro2-content').click(function(e){
  	//移動
  	e.preventDefault(); 
  	goToByScroll(this.id);

    //tempID == this.id ==> 同一個  代表縮起來
    //tempID != this.id ==> 不同個  先縮再放
    if (tempID == this.id){
      if (intro2ContentToggle == 0){
        $(this).addClass('intro2-content-show');
        intro2ContentToggle = 1;
      }
      else {
        $(this).removeClass('intro2-content-show');
        intro2ContentToggle = 0 ;
      }
    }
    else{
      $('#'+tempID).removeClass('intro2-content-show');
      $(this).addClass('intro2-content-show');
      intro2ContentToggle = 1 ;
    }

    tempID = this.id ;
  })

});

function goToByScroll(id){
	// Scroll
  $('html,body').animate({
  	scrollTop: $("#"+id).offset().top
  },400);
}


