$("#submit").click(function () {
  $.ajax({
    method: 'POST',
    contentType: 'application/json',
    url: '/resetpwd',
    data: JSON.stringify({
      password: $('#password').val()
    }),
    success: function(response) {
      if (response.status == 'SUCCESS') {
        window.alert('密碼已重設，請重新登入');
        window.location = '/app';
      } else if (response.status == 'FAIL') {
        $('.bar').html(response.content);
      } else {
        alert('出現到這裡就代表你ＧＧ了');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR + "\n" + errorThrown);
    },
    dataType: 'json'
  });
});
