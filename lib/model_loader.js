/* eslint global-require:0, import/no-dynamic-require:0 */
const { DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const recursiveSearch = ({ conn, dirPath }) => {
  let modules = {};
  if (!fs.existsSync(dirPath)) return modules;
  const directX = fs.readdirSync(dirPath);
  directX.forEach((pName) => {
    const currentPath = path.join(dirPath, pName);
    const targetFS = fs.statSync(currentPath);

    // 如果命名是"-"開頭，就忽略
    if (pName.indexOf('-') === 0) return;

    if (targetFS.isDirectory()) {
      const subModules = recursiveSearch(currentPath);
      modules = { ...modules, ...subModules };
    } else {
      // 如果不是.js檔，就跳過
      if (!/\.js$/.test(pName)) return;
      const mName = pName.replace(/\.js$/, '')
        .replace(/^./, pName[0].toUpperCase());
      modules[mName] = require(currentPath)(conn, DataTypes);
    }
  });
  return modules;
};

const load = ({ conn, modelPath }) => {
  // 定義要掃描的目錄名稱，依序掃描並載入
  let scanPath = path.resolve('app/model');
  if (modelPath) {
    scanPath = path.resolve(modelPath);
  }
  const modules = recursiveSearch({ conn, dirPath: scanPath });
  return modules;
};

module.exports = load;
