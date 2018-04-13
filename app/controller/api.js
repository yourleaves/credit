'use strict';

const Controller = require('egg').Controller;

class ApiController extends Controller {
  async index() {
    this.ctx.body = this.ctx.request.body;
    this.ctx.session.user = "123";
  }
  async login() {
    this.ctx.body = 'login';
  }
}

module.exports = ApiController;
