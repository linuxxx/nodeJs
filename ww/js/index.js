function formatIp(val) {
  if (!val) {
    return "";
  }
  // ::ffff:192.168.3.251
  // ::1
  val = val == "::1" ? "192.168.0.1" : val;
  if (val.startsWith("::ffff:")) {
    val = val.substr(7);
  }
  console.log(val);
  return val;
}

function formatTime(val) {
  if (!val) {
    return "";
  }
  var time = new Date(val);
  //2016-10-09 09:10
  var year = time.getFullYear();
  var month = time.getMonth() + 1;
  var day = time.getDate();
  var hour = time.getHours();
  var minute = time.getMinutes();

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;

  return (year + "-" + month + "-" + day + " " + hour + ":" + minute);
}

function formatContent(val) {
  if (!val) {
    return "";
  }
  var str = val.replace(/</g, "&lt;");
  var str = str.replace(/>/g, "&gt;");
  return str;
}

$(function () {
  // 返回一步
  $(".back").click(function () {
    history.go(-1);
  })
});
// 尺寸发改变时
window.onresize = function () {

}

// template.helper("formatTime", formatTime);
// template.helper("formatContent", formatContent);    