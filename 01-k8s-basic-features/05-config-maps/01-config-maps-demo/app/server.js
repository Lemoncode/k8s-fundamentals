const http = require('http'), 
      fs = require('fs');

const handler = (_, response) => {
    fs.readFile('/etc/config/enemies.cheat.level', 'UTF-8', (err, fileData) => {
        
        if (err) {
            console.log(err);
            return;
        }

        response.writeHead(200, { "Content-Type": "text/html" });
        response.write(`
            'ENEMIES' (from ConfigMap): ${process.env.enemies} <br />
            'LIVES' (from ConfigMap): ${process.env.lives} <br />
        `);
        response.write(`'enimies.cheat.level' (from volume): ${fileData}`);
        
        response.end();
    });
};

const www = http.createServer(handler);
www.listen(9000);
