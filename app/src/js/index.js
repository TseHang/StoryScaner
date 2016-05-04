
$('#logo').delay(2000).animate({"opacity":0},300 , function(){
  $('body').removeClass("loading");
});
$('#storyscaner').delay(1800).animate({"opacity":0},400);


$(document).ready(function (){
  var introSwiper = new Swiper ('.intro-container', {
    preloadImages:true,
    wrapperClass : "intro-wrapper",
    direction: 'horizontal',
    //loop: true,
    speed: 400,
  });
  introSwiper.lockSwipeToPrev();
  introSwiper.lockSwipeToNext();

  $('.swiper-slide').dblclick(function(){
    introSwiper.unlockSwipeToPrev();
    introSwiper.unlockSwipeToNext();
  })

  $('div#border-flex a').click(function(){
    introSwiper.unlockSwipeToNext();
    introSwiper.slideNext();
    introSwiper.lockSwipeToNext();
  })
});