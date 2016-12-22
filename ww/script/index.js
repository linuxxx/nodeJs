$(function () {
  // 控制用户下拉，如果同有登陆跳登陆页面
  $('main').css({
    'background': 'url("/images/nav5.jpg")',
    'background-size': '100% auto',
    'background-repeat': 'repeat',
    'box-shadow': '0 4px 20px #ccc'
  })
  $("body").on("click", ".user-name", function () {
    if (!($(".user-name").text() == '登陆')) {
      console.log('1111');
      $(".user-info").css({
        top: 50 + "px",
        right: -7 + "px"
      });
      $(".user-info").slideToggle();
    } else {
      location.href = "/login";
    }
  });

  $(".user-info a:first-child").click(function () {
    location.href = "/upload";
  });
  $(".user-info a:last-child").click(function (event) {
    $.cookie("name", name, {
      expires: -1
    });
    $.popup("退出成功", function () {
      location.href = "/";
    });
  });

  // 提问跳转
  $(".asksrc").click(function () {
    location.href = "/ask";
  })

  // 点击某个问题事件
  $(".messages").on("click", ".ask", function (e) {
    // 获取问题的文件名   
    var question = $(this).attr("data-id");
    // 跳转回答问题页面
    location.href = "/answer?question=" + question;
  });

  $(".ask img,.answer img").attr('onerror', "this.src='images/photo_default.jpg'")
});