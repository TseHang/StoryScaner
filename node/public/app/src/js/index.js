$(window).load(function() {
  console.log("都載入完囉");
<<<<<<< HEAD
  $('#modal img').delay(2000).animate({ "opacity": 0 }, 500, function() {
    $('#modal').css("display", "none");
=======

  $('#modal img').delay(2000).animate({"opacity":0}, 500 , function(){
    $('#modal').css("display","none");
>>>>>>> 317c2ab6113253664f1f0fa4e4605cbb99bdc702
    console.log("loading結束了");
  });

  data = {
    username: "test",
    password: "1357"
  };

  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: 'luffy.ee.ncku.edu.tw:16043/signup',
    data: JSON.stringify({
      username: "test",
      password: "1357"
    }),
    success: function(response) {
     console.log(response)
     if (response.status == 'FAIL')
      alert(response.content);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(11121);
      console.log(jqXHR);
    },
    dataType: 'json'
  });
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

    //Bug -- 應該要先滑動，再移除（時間點衝到了！）
    //introSwiper.removeSlide(0); 
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


