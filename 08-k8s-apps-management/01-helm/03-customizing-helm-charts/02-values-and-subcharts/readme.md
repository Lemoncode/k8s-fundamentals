# Values and Subcharts

> Start from `03-customizing-helm-charts/01-helm-data`

## Steps

### 1. Create values.yaml on Chart child

Create `./chart/todos/charts/backend/values.yaml`

```yaml
#Child Chart values.yaml
secret:
  mogodb_uri:
    username: your_user
    password: your_password
service:
  type: NodePort
```

### 2. Create values.yaml on parent Chart

Create `./chart/todos/values.yaml`

```yaml
#Parent Chart values.yaml
Todos:
  title: "Super"
backend:
  mogodb_uri:
    username: admin
    password: password
```

Here, for example, we'll override the MongoDB username and password properties of the backend chart. The way to do this is by adding a backend property in the parent chart, and nested in that backend property, we redefine the MongoDB secret property of the child chart. In fact, internally, Helm merges all those values into one single entity. If you are curious, you can have a look at the values compiled by Helm. 

Change directory into `chart`

```bash
helm install demo todos
```

Or

```bash
helm upgrade demo todos
```

```bash
helm get all demo
```

Run `helm get all` and the release's name, and you'll see that Helm computes a set of values containing values from the parents chart and its children's charts.

```bash
helm get all demo
```

We get 

```yaml
NAME: demo
LAST DEPLOYED: Fri Oct 15 21:22:43 2021
NAMESPACE: default
STATUS: deployed
REVISION: 2
TEST SUITE: None
USER-SUPPLIED VALUES:
null

COMPUTED VALUES:
Todos:
  title: Super
backend:
  global: {}
  mogodb_uri:
    password: password
    username: admin
  secret:
    mongodb_uri:
      password: your_password
      username: your_user
    service:
      type: NodePort
```

What is that global property? 

A reserved name for a property is the name `global`. A global property, when defined in a parent chart, is available in the chart and all its sub‑charts. It can be accessed with the same `.Values.global` directive whether you are in the parent or sub‑chart template. This is a convenient way to declare a common property for a parent chart and all its sub‑charts.

> Note that the global property will be passed downward from the parent to the sub‑charts, but not upward from the child chart to the parent chart.