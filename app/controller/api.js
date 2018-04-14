'use strict';

const Controller = require('egg').Controller;
const app = require('egg').Application;
const SMSClient = require('@alicloud/sms-sdk');
const accessKeyId = 'LTAIe6V8YY6pYZ9r';
const secretAccessKey = 'I5Xh7CbAVfndbLzCYBFpVyUSZL1lHW';
const smsClient = new SMSClient({accessKeyId, secretAccessKey});



class ApiController extends Controller {
  async index() {
    const request_params= this.ctx.request.query;
    const type = request_params["interface"];
    const timestamp=new Date().getTime();
    const ctx = this.ctx;

    switch(type)
    { 
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
      default:
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
      ctx.body = await this.jsonResult("登录成功",200,"登录成功!");
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
      ctx.body = await this.jsonResult("登录成功",201,"验证码发送次数过多请稍后再试!");
    }

  }
//tools
  async  jsonResult(result,code,mess){
    return {data:result,status:code,message:mess};
  }

  async getRandCode(n) {
    var all = "0123456789";
    var b = "";
    for (var i = 0; i < n; i++) {
      var index = Math.floor(Math.random() * 9);
      b += all.charAt(index);
    }
    return b;
  }

}

module.exports = ApiController;
