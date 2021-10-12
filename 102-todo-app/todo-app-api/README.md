
```ini
MONGODB_URI=
```

## Testing locally

If we don't feed the `mongo uri`, the service will work with data in memory.

```bash
npm start
```

In a new terminal, create a new todo by running:

```bash
curl -d '{"title":"Testing service", "done":"true"}' -H "Content-Type: application/json" -X POST http://localhost:3000/todos
```

For testing agains mongo we can use Docker:

```bash
docker run -d -p 27017:27017 \
  --rm --name mongo \
  -e MONGO_INITDB_DATABASE=tododb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:4.4.7
```

With this database configuration, create `.env` and set the following content

```ini
MONGODB_URI=mongodb://admin:password@localhost:27017/tododb?authSource=admin
```