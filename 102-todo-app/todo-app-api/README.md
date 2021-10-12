
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
```