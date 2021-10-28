# Demo: Using Kompose

> This directory contains the demo final result, follow the steps on this readme to achieve the same result 

## Boiler Plate

Copy into a new directory the content of `./102-todo-app`

## Steps 

### 1. Create a docker compose file that runs on local frontend and backend services


Create `./docker-compose.yml`

```yaml

# Run docker-compose build
# Run docker-compose up
# Visit http://localhost:8080
# May the force be with you

version: '3.9'

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

