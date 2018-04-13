'use strict';

const Controller = require('egg').Controller;

class ApiController extends Controller {
  async index() {
    this.ctx.body = this.ctx.request.querystring;
  }
  async login() {
    this.ctx.body = 'login';
  }
}

module.exports = ApiController;
