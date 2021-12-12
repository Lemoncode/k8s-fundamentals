const http = require('http'),
  fs = require('fs');

const handler = (_, response) => {
  fs.readFile('/etc/config/app.config.json', 'UTF-8', (err, fileData) => {

    if (err) {
      console.log(err);
      return;
    }

    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(`'config' (from volume): ${fileData}`);

    response.end();
  });
};

const www = http.createServer(handler);
www.listen(9000);
