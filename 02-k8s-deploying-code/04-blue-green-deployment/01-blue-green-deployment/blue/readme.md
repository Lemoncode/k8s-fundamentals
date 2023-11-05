## Building the image locally

```bash
docker build -t jaimesalas/nginx-blue -f blue.dockerfile .
```

## Log into default registry Docker Hub

```bash
docker login
```

## Pushing the new created image

```bash
docker push jaimesalas/nginx-blue
```
