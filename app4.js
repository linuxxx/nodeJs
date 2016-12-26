const express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    cookieParser = require('cookie-parser'),
    fs = require('fs'),
    db = require('./db/db.js'),
    app = express();
const template = require("art-template");
app.use(express.static('ww'));
app.use(cookieParser());
var deng = {};

function denglu(req, res, next) {
    console.log(req.cookies._id)
    if (!!req.cookies._id) {
        db.User.findById(req.cookies._id, function (err, data) {
            if (!err) {
                if (!!data) {
                    next();
                }
            }
        });
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
        var name = req.cookies.user;
        var id = req.cookies._id;
        // console.log(file);
        if (file.mimetype == "image/jpeg") {
            var extension = ".jpg";
        } else if (file.mimetype == "image/png") {
            var extension = ".png";
        } else if (file.mimetype == "image/gif") {
            var extension = ".gif";
        }
        var photo = {
            photo: "/uploads/" + name + extension
        };
        db.User.findByIdAndUpdate(id, photo, function (err) {
            if (!err) {
                cb(null, name + extension);
            }
        });
    }
});

app.use(bodyParser.urlencoded({
    extended: true
}));
var upload = multer({
    storage: storage
});

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
        user.photo = 'images/photo_default.jpg';
        console.log(user);
        // 读取用户文件
        db.User.find({
            name: user.name
        }).select('name').exec(function (err, data) {
            if (!err) {
                if (data.length > 0) {
                    res.status(200).json({
                        "code": "error",
                        "content": "用户名已存在！"
                    });
                } else {
                    new db.User(user).save((err) => {
                        if (!err) {
                            res.status(200).json({
                                "code": "success",
                                "content": "恭喜，注册成功！"
                            });
                        }
                    })
                }
            }
        })
    } else {
        res.status(200).json({
            "code": "error",
            "content": "密码输入不一致！"
        });
    }
});
// 用户登陆
app.post('/user/login', (req, res) => {
    var user = req.body;
    // 读取用户文件
    db.User.find({
        name: user.name
    }).exec(function (err, data) {
        if (!err) {
            if (data.length == 0) {
                res.status(200).json({
                    "code": "error",
                    "content": "用户名不存在！"
                });
            } else {
                if (user.password == data[0].password) {
                    deng[user.name] = true;
                    res.cookie("user", user.name);
                    var _id = data[0]._id;
                    res.cookie("_id", _id);
                    res.status(200).json({
                        code: "success",
                        content: "登陆成功！",
                        data: user
                    })
                } else {
                    res.status(200).json({
                        code: "error",
                        content: "用户名或密码不正确！"
                    })
                }
            }
        }
    })
});

// 用户上传头像
app.post('/user/photo', upload.single("photo"), (req, res) => {
    if (req.file.mimetype == "image/jpeg") {
        res.status(200).json({
            code: "success",
            content: "上传头像成功！"
        })
    }
});
// 用户提交问题
app.post('/user/ask', (req, res) => {
    var question = {};
    // 格式ip的
    function formatIp(val) {
        val = val == "::1" ? "192.168.0.1" : val;
        if (val.startsWith("::ffff:")) {
            val = val.substr(7);
        }
        console.log(val);
        return val;
    }
    question.content = req.body.content;
    question.creatName = req.cookies._id;
    question.ip = formatIp(req.ip);
    question.creatTime = new Date().getTime();
    console.log(question);
    new db.Question(question).save((err) => {
        if (!err) {
            res.status(200).json({
                code: "success",
                content: "提问成功！"
            })
        }
    });
});
// 用户回答问题
app.post('/user/answer', (req, res) => {
    var answer = req.body;
    answer.creatName = req.cookies._id;
    answer.ip = req.ip;
    answer.creatTime = new Date().getTime();
    var answers = {};
    new db.Answer(answer).save((err, product) => {
        if (!err) {
            answers.answers = product._id;
            db.Question.findByIdAndUpdate(answer.question, {
                $addToSet: answers
            }, function (err, data) {
                if (!err) {
                    //问题的对象  
                    console.log('回答更新成功');
                    res.status(200).json({
                        code: "success",
                        content: "回答问题成功！"
                    })
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
// 
app.get('/', (req, res) => {
    console.log('刷新页面');
    db.Question.find().populate({
        path: 'creatName',
        select: '-password'
    }).populate({
        path: 'answers',
        populate: {
            path: 'creatName',
            select: '-password'
        }
    }).exec(function (err, data) {
        if (!err) {
            data.sort(down);
            if (!req.cookies.user) {
                username = '登陆';
            } else {
                username = req.cookies.user;
            }
            res.render('index', {
                code: "success",
                title: '问答社区-首页',
                script: 'index',
                data: data,
                name: username
            })
        }
    })
})

app.get('/zhuce', (req, res) => {
    res.render('register', {
        title: '问答社区-注册',
        script: 'reg'
    });
});
app.get('/ask', denglu, (req, res) => {
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
app.get('/upload', denglu, (req, res) => {
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
    return (x.creatTime < y.creatTime) ? 1 : -1
}
