## Building the image locally

```bash
$ docker build -t jaimesalas/nginx-green -f green.dockerfile .
```

## Log into default registry Docker Hub

```bash
$ docker login
```

## Pushing the new created image

```bash
$ docker push jaimesalas/nginx-green
```
