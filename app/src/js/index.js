
$('#logo').delay(1500).animate({"opacity":0},400);
$('#storyscaner').delay(1500).animate({"opacity":0},400 , function(){
  $('body').removeClass("loading");
});


/*
$('#logo_wrapper').delay(1500).animate({ width:0, top: "20%" },500 , function(){
    $('body').removeClass("loading");
  });
*/

$(document).ready(function (){
  var introSwiper = new Swiper ('.intro-container', {
    wrapperClass : "intro-wrapper",
    direction: 'horizontal',
    //loop: true,
    speed: 400,
  });
});