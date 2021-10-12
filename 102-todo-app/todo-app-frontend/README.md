# Todo App Frontend

## How to use on local development

Create `.env` file on root directory, adding the host for the API

```ini
TODO_APP_API=localhost:8081
TODO_APP_TITLE=Default
```

Start the application on dev mode by running `npm start` 

```bash
npm start
```

## How to use as running container

Build your image tagging with any value that you disare:

```bash
./dockerize.sh "todo-app-frontend:0.0.2"
```

Now fater build we can run as follows:

```bash
docker run -d -p 8080:8080 \
  -e TODO_APP_API=localhost:8083 \
  -e TODO_APP_TITLE=Other \
  todo-app-frontend:0.0.2
```