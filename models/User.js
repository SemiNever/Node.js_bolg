/**
 * Created by 韩震 on 2017/8/2.
 */
var mongoose=require('mongoose');

var userSchema=require('../schemas/users');

module.exports=mongoose.model('Users',userSchema);