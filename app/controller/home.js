'use strict';
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;
const fs = require('fs');

class HomeController extends Controller {
  async index() {
    const ctx = this.ctx;
    const data = { name: 'egg' };
    // render a template, path relate to `app/view`
    await ctx.render('home.nj');
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

   async upload() {
    const ctx = this.ctx;
    const parts = ctx.multipart();
    let part;
    while ((part = await parts()) != null) {
      if (part.length) {
        // arrays are busboy fields
        console.log('field: ' + part[0]);
        console.log('value: ' + part[1]);
        console.log('valueTruncated: ' + part[2]);
        console.log('fieldnameTruncated: ' + part[3]);
      } else {
        if (!part.filename) {
          // user click `upload` before choose a file,
          // `part` will be file stream, but `part.filename` is empty
          // must handler this, such as log error.
          return;
        }
        // otherwise, it's a stream
        console.log('field: ' + part.fieldname);
        console.log('filename: ' + part.filename);
        console.log('encoding: ' + part.encoding);
        console.log('mime: ' + part.mime);
        let result;
        try {
          result = await ctx.oss.put('card/' + part.filename, part);
          ctx.body = result["url"];
        } catch (err) {
          await sendToWormhole(part);
          throw err;
        }
        console.log(result);
      }
    }
    console.log('and we are done parsing the form!');
  }
  
}

module.exports = HomeController;
