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
  res.json({"code":"",{}})
})

app.listen(3000, () => {
  console.log('服务器正常起动');
})
