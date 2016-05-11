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

		//開啟視訊串流------------------------------------------
    
    //看瀏覽器支不支援
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia|| navigator.msGetUserMedia;

    var video = $('#camera');
    
    //若成功則執行
    function successCallback(stream)
    {
        window.stream = stream; // stream available to console
        
        //Chrome，Opera用
        if (window.URL)
            video.src = window.URL.createObjectURL(stream);
        //Firefox用
        else
            video.src = stream;
    }  
    //若失敗則執行
    function errorCallback(error)
    {
        console.log("無法取得視訊串流 : ", error);
    }
    
    var exArray = []; //用來存裝置串流來源  
    MediaStreamTrack.getSources(
        function (sourceInfos)
        {  
            for(var i = 0; i != sourceInfos.length; ++i)
            {  
                var sourceInfo = sourceInfos[i];  
                if (sourceInfo.kind === 'video') //會遍歷audio,video，所以要判斷 
                    exArray.push(sourceInfo.id);  
            }
            //取得視訊串流
            navigator.getUserMedia(
                {
                 'video':
                 {  
                    //0為前置，1為後置
                    'optional': [ {'sourceId': exArray[1]} ]  
                 }
                },
                successCallback, errorCallback);
//            alert(exArray[0]+"\n"+exArray[1]);
            
        });  
    
    
    
    
    
    //拍照-------------------------------------
    
    function snapshot(canvasID)
    {   
        var canvas = document.querySelector('#'+canvasID);
        var ctx = canvas.getContext('2d');
        
        if (stream)
        {
            ctx.drawImage(video, -100, -100);
            console.log(ctx);
            //存成image用 - Chrome：“image/webp”，其他：“image/png”
            //document.querySelector('img').src = canvas.toDataURL('image/webp');
        }
    }

    video.addEventListener('click', function(){ snapshot('test') }, false);

	})
});

function goToByScroll(id){
  // Scroll
  $('html,body').animate({
    scrollTop: $("#"+id).offset().top},400);
}

