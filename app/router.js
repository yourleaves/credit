'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/admin', controller.admin.index);
  router.post('/admin/login', controller.admin.login);
  router.get('/app', controller.app.index);
  router.get('/download', controller.app.download);
  router.get('/kefu', controller.app.kefuQRImage);
  router.post('/api', controller.api.index);
};
