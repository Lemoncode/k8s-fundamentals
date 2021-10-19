const fs = require('fs');
const template = require('./app-dev.config.json');
const { config } = require('./config');

const processTemplate = () => {
  const cpTemplate = { ...template };
  cpTemplate.port = config.appPortValue;
  return cpTemplate;
};

const resolvePath = () => (
  (process.env.NODE_ENV === 'production') ?
    '/config/app-dev.config.json' :  // app-dev.config.json
    `${__dirname}/tmp/app-dev.config.json`
);

const dumpConfig = () => {
  console.log(resolvePath());
  fs.writeFile(
    resolvePath(),
    JSON.stringify(templateProcessed),
    function(err, r) {
      console.log(err || r);

      fs.readFile(resolvePath(), (err, data) => {
        console.log(err || data);
      });
    }
  );
};

const templateProcessed = processTemplate();
dumpConfig();
