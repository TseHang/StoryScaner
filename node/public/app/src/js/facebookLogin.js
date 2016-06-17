
// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.login(function(response){
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
      facebookLogin(response.authResponse.userID);
    } else if (response.status === 'not_authorized') {
      // 自動幫你驗證
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  },{scope: 'public_profile,email'});
}

window.fbAsyncInit = function() {
  FB.init({
    appId: '145125035895568',
    cookie: true, // enable cookies to allow the server to access 
    // the session
    xfbml: true, // parse social plugins on this page
    version: 'v2.2' // use version 2.2
  });
};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');

  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    
    $('#personalName').text(response.name);
    document.getElementById('sign-status').innerHTML =
      '歡迎來到 StoryScaner , ' + response.name + ' !';
  });
}


function facebookLogin(userID) {
  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/signin',
    data: JSON.stringify({
      username: userID,
      password: " ",
      facebook: true
    }),
    success: function(response) {
      if (response.status == 'SUCCESS') {
        console.log(userID + "登入成功");

        $('#login-slide').delay(700).animate({ "opacity": 0 }, 500, function() {
          $('#login-slide').css("display", "none");
        });
      } else if (response.status == 'FAIL') {

        $('#sign-status').css('color', 'red');
        $('#sign-status').text(response.content);

        $('#password').val("");
      } else {
        alert('出現到這裡就代表你ＧＧ了');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR + "\n" + errorThrown);
    },
    dataType: 'json'
  });
}
