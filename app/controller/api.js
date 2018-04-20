'use strict';
const path = require('path');
const ms = require('ms');
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;
const app = require('egg').Application;
const SMSClient = require('@alicloud/sms-sdk');
const accessKeyId = 'LTAIe6V8YY6pYZ9r';
const secretAccessKey = 'I5Xh7CbAVfndbLzCYBFpVyUSZL1lHW';

const smsClient = new SMSClient({accessKeyId, secretAccessKey});

class ApiController extends Controller {
  async index() {
    const request_params= this.ctx.request.body;
    const type = request_params["interface"];
    const timestamp=new Date().getTime();
    const ctx = this.ctx;

    switch(type)    { 
      case "login":
        await this.ApiLogin(request_params,timestamp,ctx);
        break;
      case "register":
        await this.ApiRegister(request_params,timestamp,ctx);
        break;
      case "forget":
        await this.ApiForget(request_params,timestamp,ctx);
        break;
      case "vercode":
        await this.ApiSendSMS(request_params,timestamp,ctx);
        break;
      case "score":
        await this.getCreditScore(request_params,timestamp,ctx);
        break;
      case "limit":
        await this.getUserLimit(request_params,timestamp,ctx);
        break; 
      case "uploadInfo":
        await this.commitUserInfo(request_params,timestamp,ctx);
        break;
      case "authList":
        await this.authList(request_params,timestamp,ctx);
        break;
      case "orderList":
        await this.orderList(request_params,timestamp,ctx);
        break;
      case "orderDetail":
        await this.getOrderDetail(request_params,timestamp,ctx);
        break;
      case "commitOrder":
        await this.addOrder(request_params,timestamp,ctx);
        break;
      case "alertPassword":
        await this.changePassword(request_params,timestamp,ctx);
        break;
      default:
        await this.commitImage(request_params,timestamp,ctx);
        break;
    }

  }


  //登录接口
  async ApiLogin(request_params,timestamp,ctx){
    const account = request_params["account"];
    const password = request_params["password"];
    const isUser = await ctx.service.mysql.findUser(account);
      if (isUser == "FAIL"){
        ctx.body = await this.jsonResult("",201,"用户不存在!");
        return;
      }
    const result = await this.ctx.service.mysql.login(account,password,timestamp);
    if (result == "OK"){
      ctx.session.user = account;
      ctx.session.maxAge = ms('10d');
      ctx.body = await this.jsonResult({mobile:account},200,"登录成功!");
    }else{
      ctx.body = await this.jsonResult("",201,"账号密码错误!");
    }
  }

  //注册接口
  async ApiRegister(request_params,timestamp,ctx){
    const number = request_params["phone"];
    const code = request_params["code"];
    const password = request_params["password"];
    const result = await this.ctx.service.mysql.getVercode(number);

    if (result["code"] == code){
      const result = await this.ctx.service.mysql.addUser(number,password,timestamp);
      if (result == "OK"){
        ctx.body = await this.jsonResult("",200,"注册成功!");
      }else if (result == "DUP"){
        ctx.body = await this.jsonResult("",201,"已注册!");
      }else{
        ctx.body = await this.jsonResult("",201,"注册失败!");
      }
    }else{
      ctx.body = await this.jsonResult("",201,"验证码不正确!");;
    }
  }

  //忘记密码接口

  async ApiForget(request_params,timestamp,ctx){
    const number = request_params["phone"];
    const code = request_params["code"];
    const password = request_params["password"];
    const isUser = await ctx.service.mysql.findUser(number);
      if (isUser == "FAIL"){
        ctx.body = await this.jsonResult("",201,"用户不存在!");
        return;
      }
    //判断验证码
    const result = await this.ctx.service.mysql.getVercode(number);
      if (result["code"] == code){
        const result = await this.ctx.service.mysql.alertPassword(number,password);
        if (result == "OK"){
          ctx.body = await this.jsonResult("修改成功",200,"操作成功!");
        }else{
          ctx.body = await this.jsonResult("",201,"修改失败!");
        }
      }else{
          ctx.body = await this.jsonResult("",201,"验证码不正确!");;
      }
  }

  async ApiSendSMS(request_params,timestamp,ctx){
  
    const number = request_params["phone"];
    const type = request_params["type"];
    const vercode = await this.getRandCode(6);
    var result = "OK"
    var smsTemplate = "";
    //判断类型
    if (type == "1"){       //注册
      smsTemplate = "SMS_131750148";
      const result = await ctx.service.mysql.findUser(number);
      if (result != "FAIL"){
        ctx.body = await this.jsonResult("",201,"用户已存在!");
        return;
      }
    }else if (type == "2"){ //修改密码
      smsTemplate = "SMS_131820140";
      const result = await ctx.service.mysql.findUser(number);
      if (result == "FAIL"){
        ctx.body = await this.jsonResult("",201,"用户不存在!");
        return;
      }
    }

    //发送验证码

    await smsClient.sendSMS({
      PhoneNumbers: number,
      SignName: '悠悠App',
      TemplateCode: smsTemplate,
      TemplateParam: '{"code":' + vercode + '}'
    }).then(function (res) 
      {
        let {Code}=res;
          if (Code === 'OK') {
            result = "OK";
           }else{
            result = "FAIL"+res.body;
          }
       }, function (err) {
            result = "ERROR"+err;
    });
    //存库
    if (result == "OK"){
      const result = await ctx.service.mysql.addVercode(number,vercode,type,timestamp);
      ctx.body = await this.jsonResult("验证码发送成功",200,"验证码发送成功!");
    }else{
      ctx.body = await this.jsonResult("验证码发送失败",201,"验证码发送次数过多请稍后再试!");
    }

  }

  // 获取信用分

  async getCreditScore(request_params,timestamp,ctx){
    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }

    const socre = await ctx.service.mysql.getUserScore(user["id"]) 
    if (socre == "FAIL"){
      ctx.body = await this.jsonResult({"socre":"0"},200,"请求成功!");
    }else{
      ctx.body = await this.jsonResult(socre,200,"请求成功!");
    }
  }

  // 获取当前额度
  
  async getUserLimit(request_params,timestamp,ctx){

    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }

    const limit = await ctx.service.mysql.getUserLimit(user["id"]) 
    if (limit == "FAIL"){
      ctx.body = await this.jsonResult({"limit":"0","time":"0","pay":"0"},200,"请求成功!");
    }else{
      ctx.body = await this.jsonResult(limit,200,"请求成功!");
    }

  }

//获取当前认证列表

  async authList(request_params,timestamp,ctx){

    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }

    const limit = await ctx.service.mysql.getAuthList(user["id"]) 
    if (limit == "FAIL"){
      ctx.body = await this.jsonResult({"card":"0","contact":"0","phone":"0","alipay":"0","taobao":"0","email":"0"},200,"请求成功!");
    }else{
      ctx.body = await this.jsonResult(limit,200,"请求成功!");
    }

  }

//上传认证信息
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
  async commitUserInfo(request_params,timestamp,ctx){
    const type = request_params["type"];

    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }
    request_params["time"] = timestamp;
    const result = await ctx.service.mysql.commitInfo(user["id"],request_params); 
    if (result == "FAIL"){
      ctx.body = await this.jsonResult("",201,"提交失败!");
    }else{
      const update = await ctx.service.mysql.updateAuthList(user["id"],type); 
      if (update == "FAIL"){
        ctx.body = await this.jsonResult("",202,"提交失败!");
      }else{
        ctx.body = await this.jsonResult("提交成功",200,"提交成功!");
      }
      
    }

  }

  //获取订单列表

  async getOrderDetail(request_params,timestamp,ctx){

    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }

    const id = request_params["id"];
    const order = await ctx.service.mysql.getOrderDetail(id);
    if (order == "FAIL"){
      ctx.body = await this.jsonResult([],201,"请求失败!");
    }else{
      ctx.body = await this.jsonResult(order,200,"请求成功!");
    }

  }

  async orderList(request_params,timestamp,ctx){

    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }
    const offset = request_params["offset"];
    const limit = await ctx.service.mysql.getOrderList(user["id"],parseInt(offset));
    if (limit == "FAIL"){
      ctx.body = await this.jsonResult([],200,"请求成功!");
    }else{
      ctx.body = await this.jsonResult(limit,200,"请求成功!");
    }

  }

  //提交订单

  async addOrder(request_params,timestamp,ctx){
    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }

    const limit = await ctx.service.mysql.getUserLimit(user["id"]);
    if (limit == "FAIL"){
      ctx.body = await this.jsonResult([],201,"您当前额度不够,无法申请!");
      return;
    }
    if (parseInt(limit["limit"]) <=0){
      ctx.body = await this.jsonResult([],201,"您当前额度不够,无法申请!");
      return;
    }
  
    const socre = await ctx.service.mysql.getUserScore(user["id"]);
    if (socre == "FAIL"){
      ctx.body = await this.jsonResult("",203,"您当前信用值不够,无法申请!");
      return;
    }
    if (parseInt(socre["score"]) <=0){
      ctx.body = await this.jsonResult("",203,"您当前信用值不够,无法申请!");
      return;
    }

    let id = user["id"];
    let noid = timestamp + "" + id;
    let addTime = timestamp;
    let s = "1";
    let m = limit["pay"];
    let ts = "1";
    let days = limit["time"];
    let daysInt = parseInt(days);
    var d = new Date();
        d.setDate(d.getDate() + daysInt);
    let dl = d.getTime();
    let tl = limit["limit"];
    
    const result = await ctx.service.mysql.addUserOrder(noid,id,addTime,s,m,ts,dl,tl,days);
    if (result == "FAIL"){
      ctx.body = await this.jsonResult([],201,"提交失败成功!");
    }else{
      ctx.body = await this.jsonResult("",200,"请求成功!");
    }
  }

// 上传图片
  async commitImage(request_params,timestamp,ctx) {
    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }
    const parts = ctx.multipart();
    let part;
    var imgs = new Array();
    var type = "";
    while ((part = await parts()) != null) {
      if (part.length) {
        // arrays are busboy fields
        if (part[0] == "type"){
          type = part[1];
        }
        console.log('field: ' + part[0]);
        console.log('value: ' + part[1]);
        console.log('valueTruncated: ' + part[2]);
        console.log('fieldnameTruncated: ' + part[3]);
      } else {
        if (!part.filename) {
          // user click `upload` before choose a file,
          // `part` will be file stream, but `part.filename` is empty
          // must handler this, such as log error.
          return;
        }
        // otherwise, it's a stream
        console.log('field: ' + part.fieldname);
        console.log('filename: ' + part.filename);
        console.log('encoding: ' + part.encoding);
        console.log('mime: ' + part.mime);
        let result;
        try {
          result = await ctx.oss.put('card/' + part.filename, part);
          imgs.push(result['url']);
        } catch (err) {
          await sendToWormhole(part);
          throw err;
        }
        console.log(result);
      }
    }

    var keyVaule = {};
    if (imgs.length == 2){
      if (type == "1_1"){
        keyVaule["image1"] = imgs[0];
        keyVaule["image2"] = imgs[1];
      }else{
        keyVaule["image3"] = imgs[0];
        keyVaule["image4"] = imgs[1];
      }
      keyVaule["interface"] = "upload";
      keyVaule["type"] = type;
    
    }else{
      ctx.body = await this.jsonResult(imgs,201,"上传失败!");
      return;
    }
    request_params["time"] = timestamp;
    const commitResult = await ctx.service.mysql.commitInfo(user["id"],keyVaule);
    if (commitResult == "FAIL"){
      ctx.body = await this.jsonResult("",201,"提交失败!");
    }else{
      const update = await ctx.service.mysql.updateAuthList(user["id"],type); 
      if (update == "FAIL"){
        ctx.body = await this.jsonResult("",202,"提交失败!");
      }else{
        ctx.body = await this.jsonResult("提交成功",200,"提交成功!");
      }
    }

  }
  
  async changePassword(request_params,timestamp,ctx){
    const user = await this.validateSession(ctx);
    if (user == "FAIL"){
      ctx.body = await this.jsonResult(ctx.session.user,202,"用户未登录!");
      return;
    }
    const newpwd = request_params["new"];
    const oldpwd = request_params["old"];

    const result = await this.ctx.service.mysql.changePassword(user["id"],oldpwd,newpwd);
    if (result == "OK"){
      ctx.body = await this.jsonResult("修改成功",200,"操作成功!");
    }else if (result == "NOFIND"){
      ctx.body = await this.jsonResult("",203,"旧密码不争取!");
    }else{
      ctx.body = await this.jsonResult("",201,"修改失败!");
    }

  }
//tools
  
  async  validateSession(ctx){
    let phone = ctx.session.user;
    const user = await ctx.service.mysql.findUser(phone);
    if (user == "FAIL"){
      return "FAIL";
    }else{
      ctx.session.maxAge = ms('10d');
      return  user;
    }
  }

  async  jsonResult(result,code,mess){
    return {data:result,status:code,message:mess};
  }

  async getRandCode(n) {
    var all = "123456789";
    var b = "";
    for (var i = 0; i < n; i++) {
      var index = Math.floor(Math.random() * 8);
      b += all.charAt(index);
    }
    return b;
  }

}

module.exports = ApiController;
