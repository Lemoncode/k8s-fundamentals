# Building Helm Chart

> Starting from 02-building-helm-charts/01-deploying-frontend

Create the following directory structure

```
chart/
 ├─todos/
    ├─ Chart.yaml
    ├─ templates/
        ├─ frontend-service.yaml
        ├─ frontend.yaml
        ├─ ingress.yaml
```

```bash
mkdir -p chart/todos
```

Create `charts/todos/Chart.yaml`

```yaml
apiVersion: v2
name: todos
appVersion: "1.0"
description: A Helm Chart for Todos Awesome App
version: 0.1.0
type: application
```

Now we can create the `templates` directory and populate with the `yaml` directory content, change directory to root, and run:

```bash
cp -r yaml/ chart/todos/templates
```

> Continue with Helm Concepts