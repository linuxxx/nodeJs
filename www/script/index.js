$(function() {
  var name = $.cookie("name");
  if (name) {
    $(".user-name").html('<span class="glyphicon glyphicon-user"></span>' + name).addClass("online");
  } else {
    $(".user-name").html('<span class="glyphicon glyphicon-user"></span>登陆');
  }
  // 控制用户下拉，如果同有登陆跳登陆页面
  $("body").on("click", ".user-name", function() {
    if ($(this).hasClass("online")) {
      $(".user-info").css({
        top: 50 + "px",
        right: -7 + "px"
      });
      $(".user-info").slideToggle();
    } else {
      location.href = "/login.html";
    }
  });
  $(".user-info a:first-child").click(function() {
    location.href = "/upload.html";
  });
  $(".user-info a:last-child").click(function(event) {
    $.cookie("name", name, {
      expires: -1
    });
    $.popup("退出成功", function() {
      location.href = "/index.html";
    });
  });
  // 提问跳转
  $(".asksrc").click(function() {
    if (name) {
      location.href = "/ask.html"
    } else {
      location.href = "/login.html"
    }
  })

  // 点击某个问题事件
  $(".messages").on("click", ".ask", function(e) {
    // 获取问题的文件名
    var querstion = $(this).attr("data-time");
    // 把文件名写入cookie
    $.cookie("querstion", querstion);
    // 跳转回答问题页面
    location.href = "/answer.html?querstion=" + querstion;
  });
  // 问答列表
  $.getJSON("/querstions", function(res, status) {
    if (status == "success") {
      //所有问题的数据（包括回答）
      var allAsks = res.data;
      var html = "";
      allAsks.forEach(function(askObj, index) {
        html = html + "<li class=\"ask\" data-time=\"" + askObj.time + "\">" + "    <img src=\"uploads/" + askObj.name + ".jpg\" alt=\"\" class=\"user-photo fl\" width=\"64\" height=\"64\" onerror=\"this.src=\'/images/photo_default.jpg\'\">" + "    <h2 class=\"h2-title\">" + askObj.name + "</h2>" + "    <p class=\"ptext\">" + formatContent(askObj.content) + "</p>" + "    <p class=\"ptime\">" + formatTime(askObj.time) + "</p>" + "</li>";
        // askObj.answer 所有的一个问题的所有回答      
        if (askObj.answer) {
          askObj.answer.forEach(function(answer) {
            // answer 每一个回答
            html = html + "<li class=\"answer\">" + "    <img src=\"uploads/" + answer.name + ".jpg\" alt=\"\" class=\"user-photo fl\" width=\"64\" height=\"64\" onerror=\"this.src=\'/images/photo_default.jpg\'\">" + "    <h2 class=\"h2-title\">" + answer.name + "</h2>" + "    <p class=\"ptext\">" + formatContent(answer.content) + "</p>" + "    <p class=\"ptime\">" + formatTime(answer.time) + "</p>" + "</li>";
          });
        }
      });
      $(".messages").html(html);
    }
  });
});