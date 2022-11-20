# Demo: Using Kompose

> This directory contains the demo final result, follow the steps on this readme to achieve the same result 

## Boiler Plate

Copy into a new directory the content of `./102-todo-app`

## Steps 

### 1. Create a docker compose file that runs on local frontend and backend services


Create `./docker-compose.yml`

```yml
version: '3'

services:

  frontend:
    container_name: todo-app-frontend
    image: todo-app-frontend:0.0.1
    build:
      context: ./todo-app-frontend
      dockerfile: Dockerfile
    environment:
      - TODO_APP_API=localhost:3000
      - TODO_APP_TITLE=Kompose
      - CORS_ACTIVE=true
    ports:
      - "8080:8080"
    depends_on: 
      - backend
    networks:
      - todo-network

  backend:
    container_name: todo-app-backend
    image: todo-app-backend:0.0.1
    build:
      context: ./todo-app-api
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"
    networks:
      - todo-network

networks:
  todo-network:
    driver: bridge
```

Now we can run 

```bash
kompose convert --out k8s.yaml
```

We get the following output:

```
INFO Network todo-network is detected at Source, shall be converted to equivalent NetworkPolicy at Destination 
INFO Network todo-network is detected at Source, shall be converted to equivalent NetworkPolicy at Destination 
INFO Kubernetes file "k8s.yaml" created 
```

Notice that's warning us about `Network Policies`. This is the way too emulate the Docker netwwork that was declared on compose file. Follow this [link](https://kubernetes.io/docs/concepts/services-networking/network-policies/) to get a better understanding of this kind of Kubernetes resource. 
