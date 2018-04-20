'use strict';

const path = require('path');
module.exports = appInfo => {
  const config = exports = {
      mysql: {
        client: {
            host: '127.0.0.1',
            port: '3306',
            user: 'root',
            password: '',
            database: 'credit',    
        },
        app: true,
        agent: false,
      },
      oss:{
        client: {
          accessKeyId: 'LTAIe6V8YY6pYZ9r',
          accessKeySecret: 'I5Xh7CbAVfndbLzCYBFpVyUSZL1lHW',
          bucket: 'lccredit',
          endpoint: 'oss-cn-beijing.aliyuncs.com',
          timeout: '60s',
        }
      },
  };
  config.view = {
    root: [
      path.join(appInfo.baseDir, 'app/view'),
    ].join(','),
    defaultViewEngine: 'nunjucks'
  };
  
  config.security = {
    csrf:{
      ignore: '/api'
    },
  };
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1523539184882_5839';
  // add your config here
  config.middleware = [];

  config.cors = {

  };
  return config;
};
