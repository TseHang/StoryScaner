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

  $('.intro2-content').click(function(e){
  	//移動
  	e.preventDefault(); 
  	goToByScroll(this.id);  

  	if (intro2ContentToggle == 0){
  		$(this).addClass('intro2-content-show');
	  	$(this).children('p.intro2-detail').animate({
	  		'margin-top':'1em',
	  		'opacity':'1'
	  	},400)

	  	intro2ContentToggle =1 ;
	  	console.log('展開囉');
  	}
  	else if (intro2ContentToggle == 1 ){
  		$(this).removeClass('intro2-content-show');
	  	$(this).children('p.intro2-detail').css({
	  		'margin-top':'auto',
	  		'opacity':'0'
	  	});

	  	intro2ContentToggle =0 ;
	  	console.log('收縮囉');
  	}
  })

  $('.intro2-button').click(function(){
		console.log("111");
		introSwiper.slideNext();

	})
});

function goToByScroll(id){
  // Scroll
  $('html,body').animate({
    scrollTop: $("#"+id).offset().top},400);
}


////// Web RTC 技術 /////////
/*
function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasGetUserMedia()) {
  // Good to go!
} else {
  alert('getUserMedia() is not supported in your browser');
}

var errorCallback = function(e) {
  console.log('Reeeejected!', e);
};

navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

// Not showing vendor prefixes.
navigator.getUserMedia({video: true, audio: true}, function(localMediaStream) {
  var video = document.querySelector('video');
  video.src = window.URL.createObjectURL(localMediaStream);

  // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
  // See crbug.com/110938.
  video.onloadedmetadata = function(e) {
    // Ready to go. Do some stuff.
  };
}, errorCallback);
*/

// Put event listeners into place
window.addEventListener("DOMContentLoaded", function() {
	// Grab elements, create settings, etc.
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		video = document.getElementById("video"),
		videoObj = { "video": true },
		errBack = function(error) {
			console.log("Video capture error: ", error.code); 
		};

	// Put video listeners into place
	if(navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function(stream) {
			video.src = stream;
			video.play();
		}, errBack);
	} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function(stream){
			video.src = window.webkitURL.createObjectURL(stream);
			video.play();
		}, errBack);
	}
	else if(navigator.mozGetUserMedia) { // Firefox-prefixed
		navigator.mozGetUserMedia(videoObj, function(stream){
			video.src = window.URL.createObjectURL(stream);
			video.play();
		}, errBack);
	}
}, false);

// Trigger photo take
document.getElementById("snap").addEventListener("click", function() {
	context.drawImage(video, 0, 0, 640, 480);
});