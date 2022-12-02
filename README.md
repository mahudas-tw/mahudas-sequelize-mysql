# @mahudas/sequelize-mysql
Sequelize + mysql2 plugin for Mahudas.

## Dependencies
+ mahudas^0.0.5
+ mysql2^2.3.3
+ sequelize^6.26.0

## 使用
### Standalone
```console
npm i
npm run mahudas
```

### As a plugin
如同一般的plugin，透過npm安裝之後，在Application的plugin.env.js裡設定啟用。  

```console
npm i @mahudas/sequelize-mysql -s
```
```js
// config/plugin.deafult.js
module.exports = {
  mysql: {
    enable: true,
    package: '@mahudas/sequelize-mysql',
  },
}
```

## 設定
```js
// config/config.default.js
module.exports = {
  mysql: {
    modelDir: 'app/model',
    options: {
      dialect: 'mysql',
      database: '',
      timezone: '+08:00',
      host: 'mysql ip',
      username: '',
      password: '',
      pool: {
        max: 5,
        min: 1,
        acquire: 30000,
        idle: 60000,
      },
      query: {
        // raw設為false, 回傳的資料不會有多餘的sequelize資訊
        raw: true,
        // 設定type 為 QueryTypes.SELECT，使用sequlize.query所查詢的資料就不會帶有meta
        type: 'SELECT',
      },
      // logging設為false，就不會把每個SQL都列印到console上
      logging: false,
    },
  },
}
```
參數 | 說明
--- | ---
modelDir | model放置的目錄，系統會去掃描這個目錄之下的所有檔案與子目錄，若是檔案或目錄開頭是dash(-)，則會被忽略不掃描
options | sequelize的參數，可直接參考sequelize文件

### 多資料庫連線
@mahudas/sequelize-mysql 也可以允許多個DB的連線，只要把config裡的mysql改成陣列就可以：
(需注意兩個資料庫的modelDir通常會是不同路徑)
```js
// config/config.default.js
module.exports = {
  mysql: [
    // 第一個DB
    {
      modelDir: 'app/model/first',
      options: {...},
    },
    // 第二個DB
    {
      modelDir: 'app/model/second',
      options: {...},
    }
  ]
}
```

## model的寫法
接收conn與DataTypes兩個參數，回傳model。
```js
module.exports = (conn, DataTypes) => {
  const Users = conn.define('users', 
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING
      }
  }, {
    // Other model options go here
  });
  return Users;
}
```

## 取用sequelzie
@mahudas/sequelize-mysql 針對 application 與 context 進行了擴充，將 sequelize 放到了 app/ctx 裡，因此可以透過 app/ctx 取用：  
```js
const { sequelize } = app;
// 或
const { sequelize } = ctx;

console.log(sequelize.DataTypes.STRING);
```

## 取用model
@mahudas/sequelize-mysql 針對 application 與 context 進行了擴充，可以透過app.mysql 或 ctx.mysql 進行操作。  
model被載入後，會被儲存在mysql.models裡，命名則是與model的命名一致，例如有個model是：
```js
const Users = conn.define('users', ...);
```
則可以用以下方式取得model：
```js
const Users = app.mysql.models.users;
await Users.findOne({});
```

### 多個資料庫連線的情況
如果有多個資料庫連線，app.mysql就會變成一個陣列，對應到config裡的資料庫連線。  
因此，如果要存取第二個資料庫的model：
```js
const Users = app.mysql[1].models.users;
await Users.findOne({});
```