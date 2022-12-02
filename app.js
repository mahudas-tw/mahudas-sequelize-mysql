/* eslint no-param-reassign:0 */
const sequelize = require('sequelize');
const modelLoader = require('./lib/model_loader');

module.exports = (app) => {
  app.on('configDidLoad', () => {
    let dbConfigs = app.config.mysql;
    // 如果dbConfigs不是陣列，一樣把它轉換成長度為1的陣列
    if (!Array.isArray(dbConfigs)) dbConfigs = [dbConfigs];
    app.mysql = [];
    // 將sequelize放置到app/ctx裡，以供後續開發者使用
    app.sequelize = sequelize;
    app.context.sequelize = sequelize;

    dbConfigs.forEach((itm, index) => {
      const conn = new sequelize.Sequelize(itm.options);
      if (dbConfigs.length === 1) {
        app.mysql = conn;
      } else {
        app.mysql[index] = conn;
      }

      // 進行連線測試
      conn.authenticate()
        .then(() => {
          console.log('\x1b[32m%s\x1b[0m', `[mysql] connection-${index} connected.`);
        })
        .catch((error) => {
          console.error('\x1b[34m%s\x1b[0m', `[mysql] connection-${index} connect error`, error);
        });

      // 讀取該設定歸屬的model
      if (itm.modelDir) modelLoader({ conn, modelPath: itm.modelDir });
    });

    // 擴充context，讓ctx也可以直接存取mysql
    app.context.mysql = app.mysql;
  });

  app.on('beforeClose', async () => {
    // 切斷所有DB連線
    // 判斷app.mysql是否為單一連線，否的話就一一切斷
    if (!Array.isArray(app.mysql)) {
      await app.mysql.close();
    } else {
      const conns = app.mysql.map((v) => v.close());
      await Promise.all(conns);
    }
  });
};
