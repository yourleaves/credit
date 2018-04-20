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
                return result[0];
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

         async changePassword(userid,oldpwd,newpwd){
            const result = await app.mysql.select('cd_user', { where: { id: userid,key:oldpwd}}); 
            if (result.length > 0){
                const row = {
                    key: newpwd
                };
                const options = {
                    where: {
                      id: userid,
                    }
                };
                const updateR = await this.app.mysql.update('cd_user', row,options);
                const updateSuccess = updateR.affectedRows === 1;
                if (updateSuccess){
                    return "OK";
                }else{
                    return "FAIL";
                }
            }else{
                return "NOFIND";
            }

         }
         

         async getUserScore(id) {
            const result = await app.mysql.select('cd_user_score', { // 搜索 post 表
                where: { userid: id}, // WHERE 条件
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
                columns: ['limit','time','pay'], // 要查询的表字段
                limit: 1, // 返回数据量
                offset: 0, // 数据偏移量
              });
              if (result.length > 0){
                return result[0];
              }else{
                return "FAIL";
              }
         }


         async getAuthList(id) {
            const result = await app.mysql.select('cd_user_auth_list', { // 搜索 post 表
                where: { userid: id}, // WHERE 条件
                orders: [['id','desc']], // 排序方式
                columns: ['card','contact','phone','alipay','taobao','email'], // 要查询的表字段
                limit: 1, // 返回数据量
                offset: 0, // 数据偏移量
              });
              if (result.length > 0){
                return result[0];
              }else{
                return "FAIL";
              }
        }


         async uploadInfo(id,table,account,password) {

            const result = await app.mysql.select(table, { where: { userid: id}}); 
            if (result.length > 0){
                const row = {
                    name:account,
                    key: password,
                  };
                  const options = {
                    where: {
                        userid: id
                    }
                  };
                const result = await this.app.mysql.update(table, row,options);
                const updateSuccess = result.affectedRows === 1;
                if (updateSuccess){
                  return "OK";
                }else{
                  return "FAIL";
                }
            }else{
                const result = await app.mysql.insert(table, { name: account,key:password,userid:id});
                if(result.serverStatus == 2){
                     return "OK";
                }else{
                    return "FAIL";
                }
            }
         }

         async uploadContacts(id,add1,add2,cont1,cont2){
            const result = await app.mysql.select('cd_user_contact', { where: { userid: id}}); 
            if (result.length > 0){
                const row = {
                    address1:add1,
                    address2:add2,
                    contact1:cont1,
                    contact2:cont2,
                  };
                  const options = {
                    where: {
                        userid: id
                    }
                  };
                const result = await this.app.mysql.update('cd_user_contact', row,options);
                const updateSuccess = result.affectedRows === 1;
                if (updateSuccess){
                  return "OK";
                }else{
                  return "FAIL";
                }
            }else{
                const result = await app.mysql.insert('cd_user_contact', { address1:add1,address2:add2,contact1:cont1,contact2:cont2,userid:id});
                if(result.serverStatus == 2){
                     return "OK";
                }else{
                    return "FAIL";
                }
            }
         }

        async uploadImage(id,img1,img2,img3,img4){
            const result = await app.mysql.select('cd_user_image', { where: { userid: id}}); 
            if (result.length > 0){
                const row = {
                    image1:img1,
                    image2:img2,
                    image3:img3,
                    image4:img4,
                  };
                  const options = {
                    where: {
                        userid: id
                    }
                  };
                const result = await this.app.mysql.update('cd_user_image', row,options);
                const updateSuccess = result.affectedRows === 1;
                if (updateSuccess){
                  return "OK";
                }else{
                  return "FAIL";
                }
            }else{
                const result = await app.mysql.insert('cd_user_image', { image1:img1,image2:img2,image3:img3,image4:img4,userid:id});
                if(result.serverStatus == 2){
                     return "OK";
                }else{
                    return "FAIL";
                }
            }
         }

         
         async commitInfo(id,request_params){
            var keyValues = request_params;
            var rtype = request_params["type"];
            delete keyValues.interface;
            if (isGoReview(rtype)){
                keyValues["review"] = "1";
            }else{
                keyValues["review"] = "0";
            }
            keyValues["type"] = rtype.slice(0,1)
            const result = await app.mysql.select('cd_admin_review', { where: { userid: id,type:keyValues["type"],review:"0"}}); 
            if (result.length > 0){
                const row = keyValues;
                  const options = {
                    where: {
                        userid: id,
                        type:keyValues["type"],
                        review:"0",
                    }
                  };
                const result = await this.app.mysql.update('cd_admin_review', row,options);
                const updateSuccess = result.affectedRows === 1;
                if (updateSuccess){
                    return "OK";
                }else{
                  return "FAIL";
                }
            }else{
                keyValues["userid"] = id;
                const result = await app.mysql.insert('cd_admin_review', keyValues);
                if(result.serverStatus == 2){
                     return "OK";
                }else{
                    return "FAIL";
                }
            }      


            function isGoReview(value){
                let arr = ["1_2","2_2","3","4","5","6"];
                if(arr.indexOf&&typeof(arr.indexOf)=='function'){
                    var index = arr.indexOf(value);
                    if(index >= 0){
                        return true;
                    }
                }
                return false;
            }      

         }

        async updateAuthList(id,type){
            //'card','contact','phone','alipay','taobao','email'
            const result = await app.mysql.select('cd_user_auth_list', { where: { userid: id}}); 
            if (result.length > 0){

                const row = getCurrentObj(type);

                const options = {
                    where: {
                        userid: id
                    }
                };
                const result = await this.app.mysql.update('cd_user_auth_list', row,options);
                const updateSuccess = result.affectedRows === 1;
                if (updateSuccess){
                  return "OK";
                }else{
                  return "FAIL";
                }

            }else{
                var allObj = getAllObj(type);
                allObj["userid"] = id;
                const result = await app.mysql.insert('cd_user_auth_list', allObj);
                if(result.serverStatus == 2){
                    return "OK";
                }else{ 
                    return "FAIL";
                }
            }

            function getCurrentObj(type){
                let obj = {"1_1":"card","1_2":"card","2_1":"contact","2_2":"contact","3":"phone","4":"alipay","5":"taobao","6":"email"};
                let objValue = {"1_1":"0","1_2":"1","2_1":"0","2_2":"1","3":"1","4":"1","5":"1","6":"1"};
                let key = obj[type];
                let value = objValue[type];
                var updateKV = {};
                updateKV[key] = value;
                return updateKV;
            }

            function getAllObj(type){
                let objkey = {"1_1":"card","1_2":"card","2_1":"contact","2_2":"contact","3":"phone","4":"alipay","5":"taobao","6":"email"};
                let objValue = {"1_1":"0","1_2":"1","2_1":"0","2_2":"1","3":"1","4":"1","5":"1","6":"1"};
                let objDefault = {"card":"0","contact":"0","phone":"0","alipay":"0","taobao":"0","email":"0"};
                let key = objkey[type];
                objDefault[key] = objValue[type];
                return objDefault;
            }
        }

        async getOrderList(id,offset) {
            const result = await app.mysql.select('cd_user_order', { // 搜索 post 表
                where: { userid: id}, // WHERE 条件
                orders: [['id','desc']], // 排序方式
                columns: ['id','no','time','status','money','days','times','deadline','total'], // 要查询的表字段
                limit: 10, // 返回数据量
                offset: offset * 10, // 数据偏移量
              });
              if (result.length > 0){
                return result;
              }else{
                return "FAIL";
              }
        }

        async getOrderDetail(orderid) {
            const result = await app.mysql.select('cd_user_order', { // 搜索 post 表
                where: { id: orderid}, // WHERE 条件
                orders: [['id','desc']], // 排序方式
                columns: ['no','time','status','money','days','times','deadline','total'], // 要查询的表字段
                limit: 1, // 返回数据量
                offset:0, // 数据偏移量
              });
              if (result.length > 0){
                return result[0];
              }else{
                return "FAIL";
              }
        }

        async addUserOrder(noid,id,addTime,s,m,ts,dl,tl,ds) {

            const row = {limit: "0",time: "0",pay: "0"};
            const options = {where: {userid: id}};
            const result = await this.app.mysql.update('cd_user_limit', row,options);
            const updateSuccess = result.affectedRows === 1;
            if (updateSuccess){
                    const resultO = await app.mysql.insert('cd_user_order', { no: noid,days:ds,userid:id,time:addTime,status:s,money:m,times:ts,deadline:dl,total:tl});
                    if(resultO.serverStatus == 2){
                        return "OK";
                    }else{
                        return "FAIL";
                    }
            }else{
                return "FAIL";
            }
        
        }


    }
};