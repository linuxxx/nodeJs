$(function () {
  $("form").submit(function (ev) {
    ev.preventDefault();
    var data = $(this).serialize();
    data = data+location.search.replace('?','&');
    console.log(data);
    $.post("/user/answer", data, function(res, status, xhr) {
      if (status == "success") {
        if (res.code == "success") {
          $.popup(res.content, function() {
            location.href = "/"
          })
        } else {
          $.popup(res.content)
        }
      }
    })
  });
});
