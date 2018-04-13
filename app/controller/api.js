'use strict';

const Controller = require('egg').Controller;
const app = require('egg').Application;
const SMSClient = require('@alicloud/sms-sdk')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAIe6V8YY6pYZ9r'
const secretAccessKey = 'I5Xh7CbAVfndbLzCYBFpVyUSZL1lHW'
const smsClient = new SMSClient({accessKeyId, secretAccessKey});
//初始化sms_client

class ApiController extends Controller {
  async index() {
    const reqMap= this.ctx.request.query;
    const type = reqMap["interface"];
    if (type == "login"){
      
    }else if (type == "register"){

    }else if (type == "forget"){
      
    }else if (type == "vercode"){
      const number = reqMap["phone"];
      const type = reqMap["type"];
      const timestamp=new Date().getTime();
      const vercode = getRandCode(6);
      const ctx = this.ctx;
      var smsTemplate = "";
      if (type == "1"){//注册
        smsTemplate = "SMS_131750148";
      }else if (type == "2"){//修改密码
        smsTemplate = "SMS_131820140";
      }

      const result = await app.mysql.insert('cd_user_vercode', { phone: number,code:vercode,time:timestamp}); 
      
      // await smsClient.sendSMS({
      //   PhoneNumbers: number,
      //   SignName: '悠悠App',
      //   TemplateCode: smsTemplate,
      //   TemplateParam: '{"code":' + vercode + '}'
      // }).then(function (res) {
      //     let {Code}=res;
      //       if (Code === 'OK') {
      //         ctx.body = "OK";
      //     }else{
      //         ctx.body = "FAIL"+res.body;
      //       }
      //     }, function (err) {
      //         ctx.body = "ERROR"+err;
      // });

    }

//tools

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
