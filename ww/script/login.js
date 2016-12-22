$(function() {
  $("form").submit(function(ev) {
    ev.preventDefault();
    var data = $(this).serialize();
    $.post("/user/login", data, function(res, statusText) {
      if (statusText == "success") {
        console.log(res);
        if (res.code == "success") {          
          $.popup(res.content, function() {
            location.href = "/on"
          })
        } else {
          $.popup(res.content);
        }
      }
    })

  });
   $(".reg").click(function () {
    location.href = "/zhuce";
  })
});