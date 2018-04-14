'use strict';

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
    }
  };
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1523539184882_5839';
  // add your config here
  config.middleware = [];
  
  return config;
};
