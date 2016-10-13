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
    console.log(file);
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
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




  // console.log('这是根目录');
})
// 用户登陆
app.post('/user/login', (req, res) => {
  console.log(req.body);
  var user = req.body;
  fs.readFile("users/user.txt",(err,data)=>{
    var users = data.toString().trim();    
    var usersArr = JSON.parse("["+users +"]");
    var isIn = usersArr.some(function(ele){
      return (user.name == ele.name && user.password == ele.password)
    });
    if(isIn){
      res.status(200).json({code:"success",content:"登陆成功！",data:user})
    }else{
      res.status(200).json({code:"error",content:"用户名或密码不正确！"})
    }
  })
})

app.listen(3000, () => {
  console.log('服务器正常起动');
})
