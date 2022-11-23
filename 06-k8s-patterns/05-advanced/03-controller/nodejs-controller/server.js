const { request } = require("http");

// localhost:8001/api/v1/namespaces/default/services
const hostname = "localhost";
const ns = "default"; // load using env variables

const options = {
  hostname,
  port: 8001,
  path: `/api/v1/namespaces/${ns}/services?watch=true`,
};

const doRequest = () => {
  return request(options, (res) => {
    res.on("data", (chunk) => {
      console.log(chunk);
    });
  });
};

let id;

const main = () => {
    if (id) {
        clearTimeout(id);
    }

    const req = doRequest();
    req.on('error', (err) => {
        console.log('error inside main', err);
        id = setTimeout(() => {
            main();
        }, 3_000);
    });
};

main();