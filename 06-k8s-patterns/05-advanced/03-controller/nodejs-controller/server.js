const { request, Agent } = require("http");

// localhost:8001/api/v1/namespaces/default/services
// https://medium.com/@onufrienkos/keep-alive-connection-on-inter-service-http-requests-3f2de73ffa1
const hostname = "localhost";
const ns = "default"; // load using env variables

const agent = new Agent({
  keepAlive: true,
  maxSockets: 1,
});

const options = {
  agent,
  hostname,
  port: 8001,
  path: `/api/v1/namespaces/${ns}/services?watch=true`,
};

let requests = 0;

const doRequest = () => {
  console.log(++requests);
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

    req.on('close', () => {
      console.log('request closed');
    })
};

main();