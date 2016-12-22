const express = require('express'),
  bodyParser = require('body-parser'),
  multer = require('multer'),
  fs = require('fs'),
  app = express();
const template = require("art-template");

app.use(express.static('ww'));
var deng = false;
var login_name = '';
function denglu(req, res, next) {
  if (deng) {
    next();
  } else {
     res.redirect(`/login`)
  }
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
template.helper("formatTime", formatTime);
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'ww/uploads');
  },
  filename: function (req, file, cb) {
    // 在req加入一个属性file 等于一个file对象
    req.file = file;
    var name = login_name;
    // console.log(file);
    if (file.mimetype == "image/jpeg") {
      var extension = ".jpg";
    } else if (file.mimetype == "image/png") {
      var extension = ".png";
    } else if (file.mimetype == "image/gif") {
      var extension = ".gif";
    }
    cb(null, name + extension);
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
var upload = multer({ storage: storage });



// 用户注册
app.post('/user/register', (req, res) => {
  // 增加ip
  req.body.ip = req.ip;
  // 增加时间
  req.body.time = new Date().getTime();
  // 注册用户对象
  var user = req.body;
  if (user.password == user.password01) {
    // 删除一个
    delete user.password01;
    console.log(user);
    // 读取用户文件
    fs.readFile("users/user.txt", (err, data) => {
      var users = data.toString().trim();
      var douhao = users.length > 0 ? "," : "";
      var usersArr = JSON.parse("[" + users + "]");
      var isIn = usersArr.some(function (ele) {
        return (user.name == ele.name);
      })
      if (isIn) {
        res.status(200).json({ "code": "error", "content": "用户名已存在！" });
      } else {
        fs.appendFile("users/user.txt", douhao + JSON.stringify(user), (err) => {
          if (!err) {
            res.status(200).json({ "code": "success", "content": "恭喜，注册成功！" });
          }
        })
      }

    })
  } else {
    res.status(200).json({ "code": "error", "content": "密码输入不致！" });
  }
});
// 用户登陆
app.post('/user/login', (req, res) => {
  console.log(req.body);
  var user = req.body;
  fs.readFile("users/user.txt", (err, data) => {
    var users = data.toString().trim();
    var usersArr = JSON.parse("[" + users + "]");
    var isIn = usersArr.some(function (ele) {
      return (user.name == ele.name && user.password == ele.password)
    });
    if (isIn) {
      res.status(200).json({ code: "success", content: "登陆成功！", data: user })
      deng = true;
      login_name = user.name;
    } else {
      res.status(200).json({ code: "error", content: "用户名或密码不正确！" })
    }
  })
});

// 用户上传头像
app.post('/user/photo', upload.single("photo"), (req, res) => {
  if (req.file.mimetype == "image/jpeg") {
    res.status(200).json({ code: "success", content: "上传头像成功！" })
  } else {
    res.status(200).json({ code: "error", content: "上传失败！图片必须为.jpg格式" })
  }
});
// 用户提交问题
app.post('/user/ask', (req, res) => {
  // console.log(req.body);
  var user = {};
  // 格式ip的
  function formatIp(val) {
    // ::ffff:192.168.3.251
    // ::1
    val = val == "::1" ? "192.168.0.1" : val;
    if (val.startsWith("::ffff:")) {
      val = val.substr(7);
    }
    console.log(val);
    return val;
  }
  user.content = req.body.content;
  user.name = login_name;
  user.ip = formatIp(req.ip);
  user.time = new Date().getTime();
  console.log(user);
  var txtName = user.time + ".txt";
  fs.appendFile("querstions/" + txtName, JSON.stringify(user), (err) => {
    res.status(200).json({ code: "success", content: "提问成功！" })
  })
});
// 用户回答问题
app.post('/user/answer', (req, res) => {
  // console.log(req.body);
  // 回答的对象
  var answer = req.body;
  answer.name = login_name;
  answer.ip = req.ip;
  answer.time = new Date().getTime();
  console.log(answer.querstion);

  fs.readFile("querstions/" + answer.querstion + ".txt", (err, data) => {
    if (!err) {
      //问题的对象
      var askObj = JSON.parse(data.toString());
      if ((typeof askObj.answer) == "object") {
        askObj.answer.push(answer);
      } else {
        askObj.answer = [];
        askObj.answer.push(answer);
      }
      fs.writeFile("querstions/" + answer.querstion + ".txt", JSON.stringify(askObj), (err) => {
        if (!err) {
          res.status(200).json({ code: "success", content: "回答问题成功！" })
        }
      })
    }
  })
});

app.listen(3000, () => {
  console.log('服务器正常起动');
})

template.config('Cache', false);

app.engine('.html', template.__express);

app.set("view engine", 'html');
// 未登陆状态
app.get('/', (req, res) => {
  login_name='';
  deng=false;
  // files所有的文件名数组
  fs.readdir("querstions", (err, files) => {
    var querstions = [];
    if (!err) {
      // 倒序排列
      // files.reverse();
      // console.log(files);
      // 循环读出文件里内容加入querstions数组里
      files.forEach(function (file) {
        fs.readFile("querstions/" + file, (err, data) => {
          if (!err) {
            // console.log(data.toString())
            querstions.push(JSON.parse(data.toString()));
            if (querstions.length == files.length) {
              querstions.sort(down);
              if (login_name == '') {
                username = '登陆';
              } else {
                username = login_name;
              }
              res.render('index', {
                code: "success",
                title: '问答社区-首页',
                script: 'index',
                data: querstions,
                name: username
              });
              console.log(login_name);
            }
          }
        });
      });
    } 
  })
})
// 问答列表
app.get('/on', (req, res) => {
  console.log('111');  
  // files所有的文件名数组
  fs.readdir("querstions", (err, files) => {
    var querstions = [];
    if (!err) {
      // 倒序排列
      // files.reverse();
      // console.log(files);
      // 循环读出文件里内容加入querstions数组里
      files.forEach(function (file) {
        fs.readFile("querstions/" + file, (err, data) => {
          if (!err) {
            // console.log(data.toString())
            querstions.push(JSON.parse(data.toString()));
            if (querstions.length == files.length) {
              querstions.sort(down);
              if (login_name == '') {
                username = '登陆';
              } else {
                username = login_name;
              }
              res.render('index', {
                code: "success",
                title: '问答社区-首页',
                script: 'index',
                data: querstions,
                name: username
              });
              console.log(login_name);
            }
          }
        });
      });
    } 
  })
})

app.get('/zhuce',  (req, res) => {
  res.render('register', {
    title: '问答社区-注册',
    script: 'reg'
  });
});
app.get('/ask',denglu,  (req, res) => {
  res.render('ask', {
    title: '问答社区-提问',
    script: 'ask'
  });
});
app.get('/answer', denglu, (req, res) => {
  res.render('answer', {
    title: '问答社区-回答',
    script: 'answer'
  });
});
app.get('/upload',denglu,  (req, res) => {
  res.render('upload', {
    title: '问答社区-个人资料',
    script: 'upload'
  });
});
app.get('/login', (req, res) => {
  res.render('login', {
    title: '问答社区-登陆',
    script: 'login'
  });
});


function down(x, y) {
  return (x.time < y.time) ? 1 : -1
}
