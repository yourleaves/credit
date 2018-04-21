'use strict';
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;
const fs = require('fs');

class AdminController extends Controller {
  async index() {
    const ctx = this.ctx;
    const data = { name: 'egg' };
    await ctx.render('admin.nj');
  }

   //登录接口
   async login(){
    const request_params= this.ctx.request.body;
    const timestamp=new Date().getTime();
    const ctx = this.ctx;

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

}

module.exports = AdminController;
