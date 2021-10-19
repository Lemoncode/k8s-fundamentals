const startServer = (config, app) => {
  const { todos, port } = config;

  app.get('/todos', (_, res) => {
    res.send(todos);
  });

  app.listen(port, () => {
    console.log(`App listening on ${3000}`);
  });
};

module.exports.startServer = startServer;