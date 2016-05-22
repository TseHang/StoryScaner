$('#camera_out').animate({top:0}, 500 , bounce());
$('#camera_in').animate({top:208}, 500 );
$('#camera_btn').animate({top:305}, 500 );

$('#camera_btn').on('mouseover',function(){
	$('#camera_in').css("opacity",1);
	$('#camera_in img').animo('blur', {duration:0.5 , amount:5});

	$('#camera_btn').attr("src" , "./images/elements/btn2.png");
});

$('#camera_btn').on('mouseout',function(){
	$('#camera_in').css("opacity",1);
	$('#camera_in img').animo('focus');

	$('#camera_btn').animo({animation: "spinner", duration: 0.2 , iterate: 3});
	$('#camera_btn').attr("src" , "./images/elements/btn1.png");
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
