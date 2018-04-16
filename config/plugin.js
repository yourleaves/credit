'use strict';

// had enabled by egg
// exports.static = true;
exports.mysql = {
    enable: true,
    package: 'egg-mysql',
};

exports.nunjucks = {
  enable: true,
  package: 'egg-view-nunjucks',
};

exports.security = {
  csp: {
    ignore: '/upload',
    xframe: {
      enable: true,
    },
  },
};

exports.oss = {
  enable: true,
  package: 'egg-oss',
  useAgent: true,
};
