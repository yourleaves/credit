module.exports = app => {
    return class mysql extends app.Service {
        async addVercode(number,vercode,smstype,timestamp) {
           const result = await app.mysql.insert('cd_user_vercode', { phone: number,code:vercode,type:smstype,time:timestamp}); 
           if(result.serverStatus == 2){
                return "OK";
           }else{
               return "FAIL";
           }
        }

        async addUser(account,password,timestamp) {
            let isUser = await this.findUser(account);
            if (isUser == "OK"){
                return "DUP";
            }else{
                const result = await app.mysql.insert('cd_user', { name: account,key:password,time:timestamp});
                if(result.serverStatus == 2){
                     return "OK";
                }else{
                    return "FAIL";
                }
            }
         }
        
        async findUser(account){
            const result = await app.mysql.select('cd_user', { where: { name: account}}); 
            if (result.length > 0){
                return "OK";
            }else{
                return "FAIL";
            }
        }

        async getVercode(number) {
            const result = await app.mysql.select('cd_user_vercode', { // 搜索 post 表
                where: { phone: number}, // WHERE 条件
                columns: ['code'], // 要查询的表字段
                orders: [['id','desc']], // 排序方式
                limit: 1, // 返回数据量
                offset: 0, // 数据偏移量
              });
              if (result.length > 0){
                return result[0];
              }else{
                return "FAIL";
              }
         }

         async login(account,password,timestamp){
            const result = await app.mysql.select('cd_user', { where: { name: account,key:password}}); 
            if (result.length > 0){
                const result_h = await app.mysql.insert('cd_user_history', { userid:result[0]["id"],time:timestamp}); 
                if(result_h.serverStatus == 2){
                    return "OK";
                }else{
                    return "FAIL";
                }
            }else{
                return "FAIL";
            }
            
         }

         async alertPassword(account,password){
            const row = {
                key: password,
              };
              const options = {
                where: {
                  name: account
                }
              };
              const result = await this.app.mysql.update('cd_user', row,options);
              const updateSuccess = result.affectedRows === 1;
              if (updateSuccess){
                return "OK";
              }else{
                return "FAIL";
              }
         }

         async getUserScore(id) {
            const result = await app.mysql.select('cd_user_score', { // 搜索 post 表
                where: { userid: number}, // WHERE 条件
                columns: ['score'], // 要查询的表字段
                orders: [['id','desc']], // 排序方式
                limit: 1, // 返回数据量
                offset: 0, // 数据偏移量
              });
              if (result.length > 0){
                return result[0];
              }else{
                return "FAIL";
              }
         }

         async getUserLimit(id) {
            const result = await app.mysql.select('cd_user_limit', { // 搜索 post 表
                where: { userid: id}, // WHERE 条件
                orders: [['id','desc']], // 排序方式
                limit: 1, // 返回数据量
                offset: 0, // 数据偏移量
              });
              if (result.length > 0){
                return result[0];
              }else{
                return "FAIL";
              }
         }


    }
};