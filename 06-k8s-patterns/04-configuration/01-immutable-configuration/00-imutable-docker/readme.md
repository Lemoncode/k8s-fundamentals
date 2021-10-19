# Immutable Docker

## Creating a Config Image

```Dockerfile
FROM scratch  

COPY app-dev.config.json /config/app-dev.config.json # 1

VOLUME /config # 2
```

1. We add the config file
2. Create a mount point and mark it as `holding`

Now we can create the image as follows, from `./config-image` run

```bash
docker build -t jaimesalas/config-dev-image:0.0.1 .
docker create --name config-dev jaimesalas/config-dev-image:0.0.1 .
```

## Connecting to application container

```bash
docker run --name dev-app --volumes-from config-dev jaimesalas/immutable-config-app:0.0.1
```

## Clean up

```bash
docker stop dev-app && docker rm dev-app
```