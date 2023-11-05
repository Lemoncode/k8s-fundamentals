# Blue-Green Deployments - The Green Deployment Demo

Once we have [published our image](./green/readme.md)

```bash
export TARGET_ROLE=green
export IMAGE_VERSION=jaimesalas/nginx-green
```

Now we're ready to do the green deployment

```bash
cat nginx.deployment.yml | sh config.sh | kubectl create --save-config -f -
```

```bash
kubectl get deployments
```

```
NAME                     READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment-blue    2/2     2            2           15m
nginx-deployment-green   2/2     2            2           15s
```

Right now this deployment is not accessible from outside of cluster, even that, there's no service that is reaching that service currently. The service that is going to expose this deployement:

```yml
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
  - port: 9001
    targetPort: 80
```

Recall that our public service is pointing to the blue deployment. Now if we run:

```bash
kubectl create -f nginx-green-test.service.yml
```

And we inspect the services, we will find out:

```bash
kubectl get svc
```

```
NAME               TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
kubernetes         ClusterIP      10.96.0.1       <none>          443/TCP          4d13h
nginx-blue-test    LoadBalancer   10.96.248.49    10.96.248.49    9000:31902/TCP   16m
nginx-green-test   LoadBalancer   10.102.49.12    10.102.49.12    9001:32117/TCP   13s
nginx-service      LoadBalancer   10.108.65.197   10.108.65.197   80:31661/TCP     20m
```

We can reach green the service via `10.102.49.12:9001`, to get to the blue, we currently have two options the public service and the blue test service, but the green is only working on green test service.

Now when we're happy with tests over green environment, we're ready to switch version, recall, that we change the env variables on current terminal. So we can run:

```bash
cat nginx.service.yml | sh config.sh | kubectl apply -f -
```

Now if we refresh `http://10.108.65.197/` we will find out that is pointing to green deployment.
