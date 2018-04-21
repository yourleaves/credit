'use strict';
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;
const fs = require('fs');

class AppController extends Controller {
  async index() {
    const ctx = this.ctx;
    const data = { name: 'egg' };
    await ctx.render('app.nj');
  }

  async download() {

    const filePath = path.resolve(this.app.config.static.dir, 'youyoudai.apk');
    this.ctx.attachment('youyoudai.apk');
    this.ctx.set('Content-Type', 'application/octet-stream');
    this.ctx.body = fs.createReadStream(filePath);
  }

  async kefuQRImage() {

    const filePath = path.resolve(this.app.config.static.dir, 'kefu.jpeg');
    this.ctx.attachment('kefu.jpeg');
    this.ctx.set('Content-Type', 'application/octet-stream');
    this.ctx.body = fs.createReadStream(filePath);
  }
  
}

module.exports = AppController;
