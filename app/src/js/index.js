$(window).load(function(){
  console.log("都載入完囉");
  $('#modal img').delay(2000).animate({"opacity":0}, 500 , function(){
    $('#modal').css("display","none");
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
    introSwiper.slideNext();
    introSwiper.unlockSwipeToPrev();

    //Bug -- 應該要先滑動，再移除（時間點衝到了！）
    introSwiper.removeSlide(0); 
  })

  $('.intro2-content').click(function(){
  	console.log('11');
  	console.log($(this));
  	if (intro2ContentToggle == 0){
  		$(this).addClass('intro2-content-show');
	  	$(this).children('p.intro2-detail').animate({
	  		'margin-top':'1em',
	  		'opacity':'1'
	  	},400)

	  	intro2ContentToggle =1 ;
  	}
  	else if (intro2ContentToggle == 1 ){
  		$(this).removeClass('intro2-content-show');
	  	$(this).children('p.intro2-detail').css({
	  		'margin-top':'auto',
	  		'opacity':'0'
	  	});

	  	intro2ContentToggle =0 ;
  	}
  })

});
