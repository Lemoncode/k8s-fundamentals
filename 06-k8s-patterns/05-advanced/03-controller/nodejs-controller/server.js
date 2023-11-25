const {request, Agent} = require("http");
const internal = require("stream");

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
  // path: `/api/v1/namespaces/${ns}/services?watch=true`,
  path: `/api/v1/namespaces/${ns}/services`,
};

let requests = 0;

const doRequest = () => {
  console.log(++requests);
  return request(options, (res) => {
    console.log(res);
    res.on("data", (chunk) => {
      console.log(chunk);
    });
  });
};

const polling = () => {
  const id =  setInterval(() => {
    const req = doRequest();
    req.on('error', () => {
      console.log('error inside main', err);
      clearInterval(id);
      polling();
    });
  }, 5_000);
}; 

polling();