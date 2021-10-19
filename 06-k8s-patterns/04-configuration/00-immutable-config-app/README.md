# Immutable config app

## Description

This application is design to work with configuration feed it by a file, via volumes.

The application is expecting to find its config on `/config/app-dev.config.json`. If we want to flexbilize this behavior, we can feed this as environment variable, although the code must align with this new feature.

## Building Image

```bash
./dockerize.sh "jaimesalas/immutable-config-app:0.0.1"
```

If we want to publish the image:

```bash
docker push jaimesalas/immutable-config-app:0.0.1
```


