const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/html');
const db = mongoose.connection;
//监听数据库连接事件
db.on('error', (err) => {
    console.log('数据库连接失败');
})
db.on('open', () => {
    console.log('数据库连接成功');
})
const User = mongoose.model('user', {
    name: String,
    password: String,
    sex: String,
    phone: Number,
    email: String,
    course: String,
    photo: String,
    ip: String,
    time: Number
});
const Question = mongoose.model('question', {
    content: String,
    creatName: {
        type: "ObjectId",
        ref: 'user'
    },
    ip: String,
    creatTime: Number,
    answers: [{
        type: "ObjectId",
        ref: 'answer'
    }]
});
const Answer = mongoose.model('answer', {
    content: String,
    querstion: String,
    creatName: {
        type: "ObjectId",
        ref: 'user'
    },
    ip: String,
    creatTime: Number
});
module.exports.User = User;
module.exports.Question = Question;
module.exports.Answer = Answer;