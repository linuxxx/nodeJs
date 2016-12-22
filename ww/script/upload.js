$(function() {
  $("form").submit(function(ev) {
    ev.preventDefault();
    // 获取表单数据
    var data = new FormData(this);
    $.ajax({
      type: "POST",
      url: "/user/photo",
      data: data,
      contentType: false,
      processData: false,
      success: function(res, status, xhr) {
        if (res.code == "success") {
          $.popup(res.content, function() {
            location.href = '/on'
          })
        }else{
          $.popup(res.content);
        }
      }
    })

  });
});