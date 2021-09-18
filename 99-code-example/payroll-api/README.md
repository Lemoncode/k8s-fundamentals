# Payroll API

## Environment Variables

```ini
PORT=
CACHE_ENABLED=
REDIS_PORT=
REDIS_HOST=
```

* **PORT** - The port where the Application is listening for http
* **CACHE_ENABLED** - If set to true, the system will cache data on REDIS
* **REDIS_PORT** - The port where Redis service will be listening, if `CACHE_ENABLED` is set to `false` this value is not used. 
* **REDIS_HOST** - The host where Redis service will be listening, if `CACHE_ENABLED` is set to `false` this value is not used.

## Running Locally

Install dependencies

```bash
npm ci
```
Start up the application

```bash
npm run start:development
```

And check the API, by running:

```bash
curl localhost:3000/api/employee
```

## Building Container Image

```bash
docker build -t <your user>/payroll-api:<version> .
```

## Publishing the Image

```bash
docker login
```

```bash
docker push <your user>/payroll-api:<version>
```

Or running both by:

```bash
./build-push.sh "<your user>/payroll-api:<version>"
```

## Using REDIS on local

Set the following environment variables:

```ini
PORT=3000
CACHE_ENABLED=true
REDIS_PORT=6379
REDIS_HOST=localhost
```

Start up the Redis container

```bash
docker run -d --rm -p 6379:6379 redis:6.2.5
```
