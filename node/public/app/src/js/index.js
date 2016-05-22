$(window).load(function() {
  console.log("都載入完囉");
  $('#modal img').delay(2000).animate({ "opacity": 0 }, 500, function() {
    $('#modal').css("display", "none");
    console.log("loading結束了");
  });
})

var intro2ContentToggle = 0;

$(document).ready(function (){

  console.log("Dom Tree 建好了");
  
  var introSwiper = new Swiper ('.intro-container', {
    direction: 'horizontal',
    //loop: true,
  }) ;
  introSwiper.lockSwipeToPrev();
  introSwiper.lockSwipeToNext();

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

  	if (intro2ContentToggle == 0){
  		$(this).addClass('intro2-content-show');
  		console.log($(this).children("intro2-content-body"));
	  	
	  	intro2ContentToggle =1 ;
	  	console.log('展開囉');
  	}
  	else if (intro2ContentToggle == 1 ){
  		$(this).removeClass('intro2-content-show');

	  	intro2ContentToggle =0 ;
	  	console.log('收縮囉');
  	}
  })

});

function goToByScroll(id){
	// Scroll
  $('html,body').animate({
  	scrollTop: $("#"+id).offset().top
  },400)
}


