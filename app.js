var express =require('express');
// 加载模版处理模块
var swig = require('swig');

var mongoose=require('mongoose');

//加载body-parse中间件,用来处理post提交过来的数据
var bodyParser=require('body-parser');

//引入User文件
var User=require('./models/User')

var Cookies=require('cookies');
//创建app应用=>Nodeja Http.createServer()
var app =express();

//设置静态文件托管
app.use('/public',express.static(__dirname+'/public'));


//第一个参数是模版引擎的名字,第二个参数是解析处理模版引擎的方法
app.engine('html',swig.renderFile);
// // 设置模版存放路径
app.set('views','./views');
// // 注册所使用的模版引擎,
app.set('view engine','html');

//取消缓存限制,开发时使用
swig.setDefaults({cache: false});

//设置cookise
app.use( function(req, res, next) {
    req.cookies = new Cookies(req, res);

    //解析登录用户的cookie信息
    req.userInfo = {};
    if (req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前登录用户的类型，是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){
            next();
        }

    } else {
        next();
    }
} );
//bodyparser设置
app.use(bodyParser.urlencoded({extended:true}));

// 根据不同的功能划分模块

app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));


// mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27018/blog',{useMongoClient:true},function(err){
    if(err){
        console.log('数据库连失败');
    }else{
        console.log('数据库连接成功');
        app.listen(8081);
    }
});
