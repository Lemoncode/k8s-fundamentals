## Running Todo App solution locally with Docker

### Create network

```bash
docker network create todonet
```

### Set up database

```bash
docker run -d -p 27017:27017 \
  --rm --name mongo \
  --network todonet \
  -e MONGO_INITDB_DATABASE=tododb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0.6
```

### Set up api

```bash
docker run -d -p 8083:3000 \
  --network todonet \
  -e MONGODB_URI="mongodb://admin:password@mongo:27017/tododb?authSource=admin" \
  todo-app-backend:0.0.2
```

### Set up frontend

```bash
docker run -d -p 8080:8080 \
  --network todonet \
  -e TODO_APP_API=localhost:8083 \
  -e TODO_APP_TITLE=Other \
  -e CORS_ACTIVE=true \
  todo-app-frontend:0.0.2
```

After running the previous commands we must see the following output:

```bash
 docker ps
CONTAINER ID   IMAGE                     COMMAND                  CREATED              STATUS              PORTS                                               NAMES
32f51e1acf4c   todo-app-frontend:0.0.2   "sh /entry-point.sh …"   12 seconds ago       Up 11 seconds       80/tcp, 0.0.0.0:8080->8080/tcp, :::8080->8080/tcp   romantic_keller
0a484699577e   todo-app-backend:0.0.2    "docker-entrypoint.s…"   About a minute ago   Up About a minute   0.0.0.0:8083->3000/tcp, :::8083->3000/tcp           loving_mendeleev
dccf24d42bf4   mongo:4.4.7               "docker-entrypoint.s…"   18 minutes ago       Up 18 minutes       0.0.0.0:27017->27017/tcp, :::27017->27017/tcp       mongo
```