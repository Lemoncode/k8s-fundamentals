# Creating K8s objects for Green/Blue Deployment

## Create the public service

This will be the template service that will use to access the `stable` version:

```yml
# nginx.service.yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  labels:
    app: nginx
    role: $TARGET_ROLE
    env: prod
spec:
  type: LoadBalancer
  selector:
    app: nginx
    role: $TARGET_ROLE
  ports:
  - port: 80
    targetPort: 80

```

We will create a deployment template to help us on create different deployments:

```yml
# nginx.deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment-$TARGET_ROLE
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx 
      role: $TARGET_ROLE
  template:
    metadata:
      labels:
        app: nginx
        role: $TARGET_ROLE
    spec:
      containers:
      - name: nginx-$TARGET_ROLE
        image: $IMAGE_VERSION
        imagePullPolicy: Always
        resources:
          limits:
            memory: "128Mi"
            cpu: "200m"
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: / 
            port: 80
        livenessProbe:
          httpGet:
            path: / 
            port: 80

```

Now for last we're going to create two new services, one to reach the blue version on test, and another one to reach the green version on test:

```yml
# nginx-blue-test.service.yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-blue-test
  labels:
    app: nginx
    role: blue-test 
    env: test
spec:
  type: LoadBalancer
  selector:
    app: nginx
    role: blue 
  ports:
  - port: 9000
    targetPort: 80

```

```yml
# nginx-green-test.service.yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-green-test
  labels:
    app: nginx
    role: green-test 
    env: test
spec:
  type: LoadBalancer
  selector:
    app: nginx
    role: green 
  ports:
  - port: 9000
    targetPort: 80


```

For last we're going to create a simple script to replace `$TARGET_ROLE` and `$IMAGE_VERSION`

```bash
#!/bin/bash
sed 's,\$TARGET_ROLE,'$TARGET_ROLE',g' |
sed 's,\$IMAGE_VERSION,'$IMAGE_VERSION',g' |
tee
```

* `sed` will replace the value
* `tee` copies the stdin to stdout, making a copy in zero or more files.
