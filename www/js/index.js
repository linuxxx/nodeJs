$(function() {
  // 控制用户下拉的位置
  $("body").on("click", ".user-name", function() {
    $(".user-info").css({
      top: 50 + "px",
      right: -7 + "px"
    });
    $(".user-info").slideToggle();
  })

});
// 尺寸发改变时
window.onresize = function() {

}
