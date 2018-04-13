'use strict';

const Controller = require('egg').Controller;
const SMSClient = require('@alicloud/sms-sdk')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAIe6V8YY6pYZ9r'
const secretAccessKey = 'I5Xh7CbAVfndbLzCYBFpVyUSZL1lHW'
//初始化sms_client

class ApiController extends Controller {
  async index() {
    const reqMap= this.ctx.request.query;
    const type = reqMap["type"];
    if (type == "login"){
      
    }else if (type == "register"){

    }else if (type == "forget"){
      
    }else if (type == "vercode"){
      const number = reqMap["phone"];
      const timestamp=new Date().getTime();
      var vercode = '897232';
      let smsClient = new SMSClient({accessKeyId, secretAccessKey});
      //发送短信
      smsClient.sendSMS({
        PhoneNumbers: number,
        SignName: '悠悠App',
        TemplateCode: 'SMS_131750148',
        TemplateParam: '{"code":' + vercode + '}'
      }).then(function (res) {
        let {Code}=res;
        if (Code === 'OK') {
          const result = await this.app.mysql.insert('cd_user_vercode', { phone:number,code:vercode,time:timestamp});
          this.ctx.body = "发送成功"+result;
        }else{
          this.ctx.body = "发送失败";
        }
      }, function (err) {
        this.ctx.body = "发送失败";
      })
    }
  }

}

module.exports = ApiController;
