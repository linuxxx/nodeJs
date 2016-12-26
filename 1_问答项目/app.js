const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const app = express();
const form = multer();
// 指定一个静态目录
app.use(express.static('www'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// 监听端口
app.listen(2000, function () {
    console.log('Node服务器运行正常');
})


//调用diskStorage(硬盘存储)函数
var storage = multer.diskStorage({
    // destination 上传的目的地
    destination: function (req, file, cb) {
        cb(null, 'www/img')
    },
    // filename:上传的文件的名字 
    filename: function (req, file, cb) {
        //   file 原始上传图片相关信息
        cb(null, req.cookies.user + '.png')
    }
})
//  执行
var upload = multer({ storage: storage })

// 接收刷新
app.post('/user/index', form.array(), (req, res) => {
    var user = req.body;
    fs.readFile('text.txt', function (err, data) {
        var usersStr = data.toString().trim();
        var usersObj = JSON.parse('[' + usersStr + ']');
        res.status(200).send(usersObj);
    });
});


// 接收图片
app.post("/user/photo", upload.single('photo'), (req, res) => {    
    console.log('---------------');
    console.log('图片上传信息：');
    console.log(get_time()+'：用户“'+req.cookies.user+'”上传头像成功');
    res.status(200).send(true);
})
function get_time() {
    var date = new Date();
    var time = date.getFullYear() + "-" + (date.getMonth() < 9? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + " " + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return time;
}

// 接收注册提交
app.post('/user/zhuce', form.array(), function (req, res) {
    console.log('---------------');
    console.log('我接受注册内容：');
    fs.readFile('students.txt', form.array(), function (err, data) {
        var user = req.body;
        var usersStr = data.toString().trim();
        var douhao = usersStr.length > 0 ? ',' : '';
        var usersObj = JSON.parse('[' + usersStr + ']');
        var isIn = false;
        usersObj.forEach(function (ele, index) {
            if (user.name == ele.name) {
                isIn = true;
            }
        });
        if (isIn) {
            var content = "你好，用户名已存在。";
            res.status(200).send(content);
        } else {
            // 向文件中追加内容
            var userStr = JSON.stringify(user);
            fs.appendFile('students.txt', douhao + userStr, function (err) {
                if (err) {
                    res.status(200).send("注册失败");
                } else {
                    res.status(200).send(true);
                    console.log(get_time()+'：用户“'+user.name+'”注册成功');
                }
            });
        }
    });
})

// 接收登陆提交
app.post('/user/denglu', form.array(), function (req, res) {
    console.log('---------------');
    console.log('我接受登陆内容：');
    var user = req.body;
    fs.readFile('students.txt', function (err, data) {
        if (err) { } else {
            //    文件的内容
            var userStr = data.toString().trim();
            var usersObj = JSON.parse('[' + userStr + ']');
            var isIn = usersObj.some(function (ele, index, arr) {
                return (user.name == ele.name && user.pass == ele.pass);
            })
            // 判断用户名对应密码是否一致
            if (isIn) {
                res.cookie("user", user.name);
                res.status(200).send(true);
                console.log(get_time()+'：用户“'+user.name+'”登陆成功');
            } else {
                res.status(200).send('登陆失败');
                console.log('登陆失败');
            }
        }

    })
})

// 提问
app.post('/info/ask', form.array(), (req, res) => {
    var user = req.body;
    user['name'] = req.cookies.user;
    user['time'] = get_time();
    user['answer'] = [];
    console.log('---------------');
    console.log('我接受提问内容：');
    fs.readFile('text.txt', function (err, data) {
        var usersStr = data.toString().trim();
        var douhao = usersStr.length > 0 ? ',' : '';
        // 向文件中追加内容
        var userStr = JSON.stringify(user);
        fs.appendFile('text.txt', douhao + userStr, function (err) {
            if (err) {
                console.log('写入失败');
            } else {
                res.status(200).send(true);
                console.log(get_time()+'：用户“'+user.name+'”提问写入成功');
            }
        });
    });
});
// 回答
app.post('/info', form.array(), (req, res) => {
    var user = req.body;
    user['name'] = req.cookies.user;
    user['time'] = get_time();
    var a = req.cookies.ind;
    console.log('---------------');
    console.log('我接收回答内容：');
    fs.readFile('text.txt', function (err, data) {
        var usersStr = data.toString().trim();
        var usersObj = JSON.parse('[' + usersStr + ']');
        // 向文件中追加内容     
        var answerArr = usersObj[a].answer;
        answerArr.push(user);
        usersObj[a].answer = answerArr;
        var userStr = JSON.stringify(usersObj).substr(1, JSON.stringify(usersObj).length - 2);;
        fs.writeFile('text.txt', userStr, function (err) {
            if (err) {
                console.log('写入失败');
            } else {
                res.status(200).send(true);
                console.log(get_time()+'：用户“'+user.name+'”回答问题'+a+'写入成功');
            }
        });
    });
});