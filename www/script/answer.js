if ($.cookie("name")) {} else {
  location.href = '/login.html'
}
$(function() {
  $("form").submit(function(ev) {
    ev.preventDefault();
    var data = $(this).serialize();
    data = data + "&querstion=" + $.cookie("querstion");
    console.log(data);
    $.post("/user/answer", data, function(res, status, xhr) {
      if (status == "success") {
        if (res.code == "success") {
          $.popup(res.content, function() {
            location.href = "/index.html"
          })
        } else {
          $.popup(res.content)
        }
      }
    })
  });
});
