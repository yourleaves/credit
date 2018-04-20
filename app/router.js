'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/download', controller.home.download);
  router.get('/kefu', controller.home.kefuQRImage);
  router.post('/api', controller.api.index);
};
