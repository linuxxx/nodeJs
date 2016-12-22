$(function() {
  // 拦截form表单的提交事件
  $("form").submit(function(ev) {
    //阻止默认事件
    ev.preventDefault();
    // 可以把表单里的所有内容都读出来形成一个字符串
    var data = $(this).serialize();
    // 把表单里的所有内容都读出来放在一个数组里
    // console.dir( $(this).serializeArray() );

    // ajax 发送请求
    $.post('user/register', data, function(res, statusText, xhr) {
      if (statusText == "success") {
        // console.log(res)
        if (res.code == "success") {
          $.popup(res.content, function() {
            location.href = "/login";
          })
        } else {
          $.popup(res.content);
        }

      }

    })

  });

});
