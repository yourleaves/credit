'use strict';

const Controller = require('egg').Controller;

class ApiController extends Controller {
  async index() {
    this.ctx.body = this.ctx.request.body;
  }
  async login() {
    this.ctx.body = 'login';
  }
}

module.exports = ApiController;
