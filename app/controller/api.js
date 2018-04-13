'use strict';

const Controller = require('egg').Controller;

class ApiController extends Controller {
  async index() {
    let count = ctx.cookies.get('count');
    count = count ? Number(count) : 0;
    this.ctx.cookies.set('count', ++count);
    this.ctx.body = this.ctx.request.body;
  }
  async login() {
    this.ctx.body = 'login';
  }
}

module.exports = ApiController;
