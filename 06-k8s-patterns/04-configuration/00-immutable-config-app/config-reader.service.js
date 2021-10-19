const fs = require('fs');

const readConfig = () => new Promise((resolve, reject) => {
  fs.readFile('/config/app-dev.config.json', null, (err, data) => {
    if (err) {
      reject(err);
      return;
    }

    resolve(JSON.parse(data));
  });
});

module.exports.configReader = {
  readConfig,
};