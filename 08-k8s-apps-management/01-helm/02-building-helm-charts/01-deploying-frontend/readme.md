# Deploying Frontend

## Steps

### 1. Creating directory structure

In this demo we're going to create the basic infrastructure to work with Helm charts, create a new directory on root named `app` and copy inside it `00-start-code/todo-app-frontend`

```
app/
├─ todo-app-frontend
```

To simplify naming and paths, rename `app/todo-app-frontend` to `app/frontend`

```
app/
├─ frontend/
```

### 2. Creating manifests

Now let's create a new directory, `yaml`, that will contain the manifests to deploy our frontend application.

```
app/
├─ frontend/
├─ yaml/
```

Create `frontend.yaml`

Create `frontend-service.yaml`

Create `ingress.yaml`



