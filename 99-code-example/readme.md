## Running with mock data

```bash
docker-compose up -d
```

```bash
docker-compose down
```

## Running with cache

```bash
docker-compose -f docker-compose.redis.yml up -d 
```

```bash
docker-compose -f docker-compose.redis.yml down
```

## Running  with cache and database

```bash
docker-compose -f docker-compose.redis-mongo.yml up -d 
```

```bash
docker-compose -f docker-compose.redis-mongo.yml down
```