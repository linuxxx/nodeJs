const express = require('express'),
  bodyParser = require('body-parser'),
  multer = require('multer'),
  cookieParser = require('cookie-parser'),
  fs = require('fs'),
  app = express();

app.use(express.static('www'));
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'www/uploads');
  },
  filename: function(req, file, cb) {
    // 在req加入一个属性file 等于一个file对象
    req.file = file;
    var name = req.cookies.name;
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
app.use(cookieParser());

app.get('', (req, res) => {
  console.log('这是根目录');
})

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
      var isIn = usersArr.some(function(ele) {
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
    var isIn = usersArr.some(function(ele) {
      return (user.name == ele.name && user.password == ele.password)
    });
    if (isIn) {
      res.status(200).json({ code: "success", content: "登陆成功！", data: user })
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
  user.name = req.cookies.name;
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
  answer.name = req.cookies.name;
  answer.ip = req.ip;
  answer.time = new Date().getTime();
  // console.log(answer.querstion);

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
// 问答列表
app.get('/querstions', (req, res) => {
  // 读取一个目录
  // files所有的文件名数组
  fs.readdir("querstions", (err, files) => {
    var querstions = [];
    if (!err) {
      // 倒序排列
      files.reverse();
      // console.log(files);
      // 循环读出文件里内容加入querstions数组里
      files.forEach(function(file) {
        fs.readFile("querstions/" + file, (err, data) => {
          if (!err) {
            // console.log(data.toString())
            querstions.push(JSON.parse(data.toString()));
            if (querstions.length == files.length) {
              // console.log(querstions);
              res.status(200).json({ code: "success", data: querstions })
            }
          }
        });
      });

    } else {

    }
  })

});
app.listen(3000, () => {
  console.log('服务器正常起动');
})
