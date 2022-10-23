## ConfigMaps Core Concepts

__ConfigMaps__ provide a way to store configuration information and provide it to containers.

* Provides a way to inject configuration data into a container

* Can store entire files or provide key/value pairs
    - Store in a File. Key is the filename, value is the file contents (can be JSON, XML, keys/values, etc.)
    - Provide on the command-line
    - ConfigMap manifest

### Accessing ConfigMap Data in a Pod

* ConfigMaps can be accessed from a Pod using:
    - Environment variables (key/value)
    - ConfigMap Volume (access as files)

## Creating a ConfigMap

### Defining Values in a ConfigMap Manifest

```yaml
apiVersion: v1
kind: ConfigMap # 1
metadata:
  name: app-settings # 2
  labels:
    app: app-settings
data:
  enemies: aliens # 3
  lives: "3"
  enemies.cheat: "true"
  enemies.cheat.level=noGoodRotten
```

1. A ConfigMap resource
2. Name of ConfigMap
3. ConfigMap data

```bash
# Create from a ConfigMap manifest
kubectl create -f file.configmap.yml
```

### Another option is defining key/value pairs in a file

```
enemies=aliens
lives=3
enemies.cheat=true
enemies.cheat.level=noGoodRotten
```

*  Let's assume that this file is named as _game.config_, we have Key/value pairs defined
*  Nested properties can be defined and assigned a value

```bash
# Create a ConfigMap using data from a file 
kubectl create configmap [cm-name] --from-file=[path-to-file]
```

```yaml
apiVersion: v1
kind: ConfigMap
data:
  game.config: |- # 1 # 2
    enemies=aliens
    lives=3
    enemies.cheat=true
    enemies.cheat.level=noGoodRotten
```

1. Note that the file name is used as the key for the values
2. Your application can now work with the content just as it would a normal configuration file (JSON, XML,  keys/values, could be used) 


### Defining Key/Value Pairs in an env file

```
enemies=aliens
lives=3
enemies.cheat=true
enemies.cheat.level=noGoodRotten
```
* Key/value pairs can be defined in an "environment" variables file (game-config.env)
* Nested properties can be defined and assigned a value

```bash
# Create a env ConfigMap using data from a file
kubectl create configmap [cm-name] --from-env-file=[path-to-file]
```

That will create something more close to the manifest

```yml
apiVersion: v1
kind: ConfigMap # 1
metadata:
  name: app-settings # 2
  labels:
    app: app-settings
data:
  enemies=aliens
  lives=3
  enemies.cheat=true
  enemies.cheat.level=noGoodRotten
```

* Note that the file name is not included as a key

Let's summarize the available options to create configmap

```bash
# Create a ConfigMap using data from a config file
kubectl create configmap [cm-name] --from-file=[path-to-file]

# Create a ConfigMap from an env file
kubectl create configmap [cm-name] --from-env-file=[path-to-file]

# Create a ConfigMap from individual data values
kubectl create configmap [cm-name] 
    --from-literal=apiUrl=https://my-api
    --from-literal=otherKey=otherValue
```

## Using a ConfigMap

* **Getting a ConfigMap**: `kubectl get cm` can be used to get a ConfigMap and view its content

```bash
# Get a ConfigMap
kubectl get cm [cm-name] -o yaml
```

### Accessing a ConfigMap: Environment Vars

* Pods can access ConfigMap values trough environment vars ENEMIES environment variable created (value=aliens)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-settings
  labels:
    app: app-settings
data:
  enemies: aliens
  lives: "3"
  enemies.cheat: "true"
  enemies.cheat.level=noGoodRotten
```

```yaml
apiVersion: apps/v1
...
spec:
  template:
    ...
  spec:
    containers: ...
    env:
    - name: ENEMIES # 1
      valueFrom:
        configMapKeyRef:
          key: app-settings # 2
          name: enemies # 3
```

1. Creates an env variable called _ENEMIES_
2. Search the values on a config map that has this name `app-settings`
3. The value that is going to load for _ENEMIES env_ is the one on the config map manifest that is called `enemies`

* **envFrom** can be used to load all ConfigMap keys/value into enviroment variables

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-settings
  labels:
    app: app-settings
data:
  enemies: aliens
  lives: "3"
  enemies.cheat: "true"
  enemies.cheat.level=noGoodRotten
```

```yaml
apiVersion: apps/v1
...
spec:
  template:
    ...
  spec:
    containers: ...
      envFrom:
      - configMapRef:
        name: app-settings
```

This will create four env variables based on the previous config map.

### Accessing a ConfigMap: Volume

* ConfigMap values can be loaded trough a Volume Each key is converted to a file - value is added into the file

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-settings
  labels:
    app: app-settings
data:
  enemies: aliens
  lives: "3"
  enemies.cheat: "true"
  enemies.cheat.level=noGoodRotten
```

```yaml
apiVersion: apps/v1
...
spec:
  template:
    ...
  spec:
    volumes:
    - name: app-config-vol
      configMap:
        name: app-settings
    containers: ...
      volumeMounts:
      - name: app-config-vol
        mountPath: /etc/config
```

## ConfigMaps Demo

[ConfigMaps Demo](01-config-maps-demo/readme.md)

> Code: 05_creating_configmaps_and_secrets/configMaps

When we create a `cm` we can inspect it as follows:

```bash
kubectl create cm app-settings --from-env-file=settings.config
```

```
configmap/app-settings created
```

```bash
kubectl get cm app-settings -o yaml
```

```
apiVersion: v1
data:
  enemies: aliens
  enemies.cheat: "true"
  enemies.cheat.level: noGoodRotten
  lives: "3"
```

If we make an `exec` into the running pod we can check the created files

```bash
kubectl exec node-configmap-<random-hash>
/ # cd /etc/config
```
