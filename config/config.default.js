module.exports = {
  mysql: {
    modelDir: 'app/model',
    options: {
      dialect: 'mysql',
      database: '',
      timezone: '+08:00',
      host: '',
      username: '',
      password: '',
      pool: {
        max: 30,
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
};
