//$('#logo_wrapper').animo({animation: "spinner", duration: 1 , iterate: 3});/*

$('#logo_wrapper').delay(500).animate({ width:"30%" },1000)
  .animate({ width:0, top: "20%" },400 , function(){
    $('body').removeClass("loading");
  });


$(document).ready(function (){
  var introSwiper = new Swiper ('.intro-container', {
    wrapperClass : "intro-wrapper",
    direction: 'horizontal',
    //loop: true,
    speed: 400,
  });
});