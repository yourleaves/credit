'use strict';

const Controller = require('egg').Controller;
const app = require('egg').Application;
const SMSClient = require('@alicloud/sms-sdk');
const accessKeyId = 'LTAIe6V8YY6pYZ9r';
const secretAccessKey = 'I5Xh7CbAVfndbLzCYBFpVyUSZL1lHW';
const smsClient = new SMSClient({accessKeyId, secretAccessKey});



class ApiController extends Controller {
  async index() {
    const reqMap= this.ctx.request.query;
    const type = reqMap["interface"];
    const timestamp=new Date().getTime();
    const ctx = this.ctx;

    if (type == "login"){

      const account = reqMap["account"];
      const password = reqMap["password"];

      const result = await this.ctx.service.mysql.login(account,password,timestamp);
      if (result == "OK"){
        ctx.body = jsonResult("登录成功",200,"登录成功!");
      }else{
        ctx.body = jsonResult("",201,"账号密码错误!");
      }

    }else if (type == "register"){

      const number = reqMap["phone"];
      const code = reqMap["code"];
      const password = reqMap["password"];
      const result = await this.ctx.service.mysql.getVercode(number);

      if (result["code"] == code){
        const result = await this.ctx.service.mysql.addUser(number,password,timestamp);
        if (result == "OK"){
          ctx.body = jsonResult("",200,"注册成功!");
        }else if (result == "DUP"){
          ctx.body = jsonResult("",201,"已注册!");
        }else{
          ctx.body = jsonResult("",201,"注册失败!");
        }
      }else{
        ctx.body = jsonResult("",201,"验证码不正确!");;
      }

    }else if (type == "forget"){
      
      const number = reqMap["phone"];
      const code = reqMap["code"];
      const password = reqMap["password"];
      //判断验证码
      const result = await this.ctx.service.mysql.getVercode(number);
      if (result["code"] == code){
        const result = await this.ctx.service.mysql.alertPassword(number,password);
        if (result == "OK"){
          ctx.body = jsonResult("修改成功",200,"操作成功!");
        }else{
          ctx.body = jsonResult("",201,"修改失败!");
        }
      }else{
          ctx.body = jsonResult("",201,"验证码不正确!");;
      }

    }else if (type == "vercode"){

      const number = reqMap["phone"];
      const type = reqMap["type"];
      const vercode = getRandCode(6);
      var result = "OK"
      var smsTemplate = "";
      //判断类型
      if (type == "1"){       //注册
        smsTemplate = "SMS_131750148";
      }else if (type == "2"){ //修改密码
        smsTemplate = "SMS_131820140";
        const result = await ctx.service.mysql.findUser(number);
        if (result == "FAIL"){
          ctx.body = jsonResult("",201,"用户不存在!");
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
        ctx.body = jsonResult("验证码发送成功",200,"验证码发送成功!");
      }else{
        ctx.body = jsonResult("登录成功",201,"验证码发送次数过多请稍后再试!");
      }
      
    }
    



//tools

    function jsonResult(result,code,mess){
      return {data:result,status:code,message:mess};
    }

    function getRandCode(n) {
      var all = "0123456789";
      var b = "";
      for (var i = 0; i < n; i++) {
        var index = Math.floor(Math.random() * 9);
        b += all.charAt(index);
      }
      return b;
    };

  }

}

module.exports = ApiController;
