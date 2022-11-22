# Logging with EFK stack

## Prerequisites

`eks` cluster running, the ec2 instances must have more than 3GB of memory, run the following command to create the desired cluster:

```bash
eksctl create cluster \
--name lc-cluster \
--version 1.23 \
--region eu-west-3 \
--nodegroup-name lc-nodes \
--node-type t2.large \
--nodes 3 \
--nodes-min 1 \
--nodes-max 4 \
--with-oidc \
--managed
```

## Steps

## Deploy sample app

```bash
kubectl apply -f ./app-deploy/sample-service.yml
```

```
service/my-service created
deployment.apps/my-deployment created
```

```bash
kubectl get service my-service
```

```
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP                                                              PORT(S)        AGE
my-service   LoadBalancer   10.100.33.153   a5f026397c8624c71be8be7ad6f7b3a5-583470460.eu-west-3.elb.amazonaws.com   80:31509/TCP   87s
```

Grab the `EXTERNAL-IP`, and run:

```bash
curl a5f026397c8624c71be8be7ad6f7b3a5-583470460.eu-west-3.elb.amazonaws.com
```

We must have a response as follows:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to nginx!</title>
    <style>
      body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <h1>Welcome to nginx!</h1>
    <p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>

    <p>
      For online documentation and support please refer to <a href="http://nginx.org/">nginx.org</a>.<br />
      Commercial support is available at
      <a href="http://nginx.com/">nginx.com</a>.
    </p>

    <p><em>Thank you for using nginx.</em></p>
  </body>
</html>
```

### Deploy EFK

1. Create namespace

```bash
kubectl apply -f ./fluentd-elasticsearch/create-logging-namespace.yaml
```

```bash
kubectl get ns
```

```
NAME              STATUS   AGE
default           Active   62m
kube-node-lease   Active   62m
kube-public       Active   62m
kube-system       Active   62m
logging           Active   13s
```

2. Create elasticsearch

```bash
kubectl apply -f ./fluentd-elasticsearch/elasticsearch-deploy.yaml
```

```bash
kubectl get all -n kube-system
```

3. Deploy fluentd

```bash
kubectl apply -f ./fluentd-elasticsearch/fluentd-deploy.yaml
```

```bash
kubectl get all -n kube-system
```

4. Deploy Kibana

```bash
kubectl apply -f ./fluentd-elasticsearch/kibana-deploy.yaml
```

```bash
kubectl get service -n kube-system
```

```
NAME                    TYPE           CLUSTER-IP      EXTERNAL-IP                                                              PORT(S)             AGE
elasticsearch-logging   ClusterIP      None            <none>                                                                   9200/TCP,9300/TCP   110m
kibana-logging          LoadBalancer   10.100.47.135   a02ea42f7f34b4ff8a11f567e790c6ce-602092504.eu-west-3.elb.amazonaws.com   5601:31469/TCP      77m
kube-dns                ClusterIP      10.100.0.10     <none>                                                                   53/UDP,53/TCP       146m
```

Navigate to `Kibana` by running:

```
google a02ea42f7f34b4ff8a11f567e790c6ce-602092504.eu-west-3.elb.amazonaws.com:5601
```

A new window will be prompted, select explore by our own, on the left menu select the compass icon (discover). Now we have to create a new index, this is a little bit confusing, we can see `logstash-<date>`, well don't freak out, that is currently `fluentd`, a little bit confusing, but that's `fluentd` and is not `logstash`.

On index pattern input, type: `logstash*`, we will see that a new message appears telling us that a new index has been created. Click on next and a new drop down will appear, asking for time filter index, because we have added the configuration on `fluentd` we must see `@timestamp`, select that. Now click on `create index pattern`

Now on the time that we have been doing this, there must logs gather by `fluentd` and save by `Kibana`. If we click on compass icon again (discover), what we see now is basically a search engine, is the logs, that have been gather so far.

Let's try to find out something, let's type `nginx`. Bear in mind that we are only seeing results for a time period. We can set the time range, that's very flexible.

## Cleanup

Delete kubernetes resources

```bash
#remove app-deploy
kubectl delete -f ./app-deploy/sample-service.yml

#remove kibana
kubectl delete -f ./app-deploy/sample-service.yml

#remove fluentd
kubectl delete -f ./fluentd-elasticsearch/fluentd-deploy.yaml

#remove elasticsearch
kubectl delete -f ./fluentd-elasticsearch/create-logging-namespace.yaml
```

Delete cluster

```bash
eksctl delete cluster --name lc-cluster --region eu-west-3
```
