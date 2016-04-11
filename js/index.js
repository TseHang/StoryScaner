$('#camera_out').animate({top:0}, 400 , bounce());
$('#camera_in').animate({top:208}, 400 );
$('#camera_btn').animate({top:305}, 400 );

$('#camera_btn').on('mouseover',function(){
	$('#camera_in').css("opacity",1);
	$('#camera_btn').attr("src" , "./images/elements/btn2.png");
	$('#camera_in').animo('blur' ,{duration: 0.3, amount: 30});
});

$('#camera_btn').on('mouseout',function(){
	$('#camera_in').css("opacity",1);
	$('#camera_btn').animo({animation: "spinner", duration: 0.2 , iterate: 3});
	$('#camera_btn').attr("src" , "./images/elements/btn1.png");
	$('#camera_in').animo('focus');
});

$('#camera_in').on('mouseover',function(){
	$('#camera_in').css("opacity",1);
});

$('#camera_in').on('mouseout',function(){
	$('#camera_in').css("opacity",0);
});



function bounce (){
	console.log("相機掉下來囉");
	$('#camera').animo( { animation: ['bounce' , 'tada'], duration: 0.7 } , function(){
		$('#about_us').animo( { animation: 'bounceInLeft', duration: 0.5 } );
		$('#about_us').css("opacity",1);
	});
}
