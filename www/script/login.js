$(function() {
  $("form").submit(function(ev) {
    ev.preventDefault();
    var data = $(this).serialize();
    $.post("/user/login", data, function(res, statusText) {
      if (statusText == "success") {
        console.log(res);
        if (res.code == "success") {
          $.cookie("name", res.data.name);
          $.popup(res.content, function() {
            location.href = "/index.html"
          })
        } else {
          $.popup(res.content);
        }
      }
    })

  });
});