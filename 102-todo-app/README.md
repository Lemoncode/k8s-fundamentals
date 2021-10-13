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
  mongo:4.4.7
```

### Set up api

### Set up frontend
