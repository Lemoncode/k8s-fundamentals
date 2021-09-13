# Payroll Front

## Environment Variables

```ini
API_HOST=
API_PORT=
API_MOCK=
```

* **API_HOST** - The `host` where the data API is listening
* **API_PORT** - The `port` where the data API is listening
* **API_MOCK** - If `true` the app is running on stand alone mode (no API server to request data)

Create `.env` file on root to provide this variables on `local` development.

## Building Docker Image

To build the image and run on stand alone mode:

```dockerfile
FROM node:14.17.0 as builder

ARG API_MOCK=true

# ....
```

From root:

```bash
docker build -t jaimesalas/payroll-front -f ./.docker/nginx.dockerfile .
docker run -p 80:80 jaimesalas/payroll-front
```

## TODO

Investigate how to integrate axios with mock requests - https://dev.to/asantos00/using-mocked-apis-to-increase-developer-productivity-13a6
