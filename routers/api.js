/**
 * Created by 韩震 on 2017/8/2.
 */
var express= require('express');
var router =express.Router();
// 引入操作数据库的模块
var User=require('../models/User');
var Content=require('../models/Content');
// 返回格式
var responseData;
router.use(function(req,res,next){
    responseData={
        code:0,
        message:''
    }
    next();
});
//处理用户注册逻辑1.用户名不能为空2.密码不为空3.重复密码同密码
//4.数据库查询:用户名是否被注册
router.post('/user/register',function(req,res,next){
    // console.log('register');
    // console.log(req.body);
    var username=req.body.username;
    var password=req.body.password;
    var repassword=req.body.repassword;
    if(username==''){
        responseData.code=1;
        responseData.message='用户名不能为空';
        res.json(responseData);
        return;
    }
    if(password==''){
        responseData.code=2;
        responseData.message='密码不能为空';
        res.json(responseData);
        return;
    }
    if(password!=password){
        responseData.code=3;
        responseData.message='两次输入的密码不一致';
        res.json(responseData);
        return;
    };
    //用户名是否已经被注册了，如果数据库中已经存在和我们要注册的用户名同名的数据，表示该用户名已经被注册了
    User.findOne({
        username: username
    }).then(function( userInfo ) {
        if ( userInfo ) {
            //表示数据库中有该记录
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            res.json(responseData);
            return;
        }
        //保存用户注册的信息到数据库中
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then(function(newUserInfo) {
        console.log(newUserInfo);
        responseData.message = '注册成功';
        req.cookies.set('userInfo',JSON.stringify({
            _id:newUserInfo._id,
            username:newUserInfo.username
        }));
        res.json(responseData);
    });

});

router.post('/user/login',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    if(username==''||password==''){
        responseData.code=1;
        responseData.message='用户名和密码不能为空';
        res.json(responseData);
        return;
    };
    User.findOne({
        username:username,
        password:password
    }).then(function(userInfo){

        if(!userInfo){
            responseData.code=2;
            responseData.message='用户名或密码错误';
            res.json(responseData);
            return;
        }
        //用户名和密码是正确的
        responseData.message='登陆成功';
        responseData.userInfo={
            _id:userInfo.id,
            username:userInfo.username
        }
        req.cookies.set('userInfo',JSON.stringify({
            _id:userInfo._id,
            username:userInfo.username
        }));
        res.json(responseData);
        return;

    });
});


// 处理用户的退出
router.get('/user/logout',function(req,res){
    req.cookies.set('userInfo',null);
    responseData.message='用户已退出';
    res.json(responseData);
});


//处理评论的提交
router.post('/comment/post',function(req,res){
    //内容的ID
    var contentId=req.body.contentid || '';
    var postData={
        username:req.userInfo.username,
        postTime:new Date(),
        content:req.body.content
    };
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent){
        responseData.message='评论成功';
        responseData.data = newContent;
        res.json(responseData);
    })

});



// 获取访问文章的所有评论
router.get('/comment',function(req,res){

 var  contentId=req.query.contentid||'';
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        responseData.data=content.comments;
        res.json(responseData);
    });
});

module.exports=router;
