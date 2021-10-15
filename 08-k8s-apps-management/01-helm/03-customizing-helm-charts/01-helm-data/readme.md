# Helm Data In Cluster

> Start from `03-customizing-helm-charts/01-helm-data`

## Steps

### 1. Install chart

Change directory to `chart`, and install it:

```bash
helm install demo todos 
```

```
NAME: demo
LAST DEPLOYED: Fri Oct 15 20:19:38 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

### 2. Find secrets

The Helm release name is `demo`. If we look at the secrets in our Kubernetes cluster, we can see one secret that has been created by hand for the demo release.

```bash
helm list --short
```

```bash
kubectl get secrets
```

We get something like this:

```
NAME                         TYPE                                  DATA   AGE
backend-secret               Opaque                                1      2m35s
default-token-h5dm7          kubernetes.io/service-account-token   3      54d
mongodb-secret               Opaque                                2      2m35s
sh.helm.release.v1.demo.v1   helm.sh/release.v1                    1      2m35s
```

We're interested on `sh.helm.release.v1.demo.v1`, to get the data of this secret we have to decode Base64 twice and unzips it:

```bash
kubectl get secrets sh.helm.release.v1.demo.v1 -o jsonpath="{ .data.release }" | base64 -d | base64 -d | zcat
```

Those are manifest files encoded in JSON and also their values.

If you want to get the values or the manifest of your release, you can use the `helm get manifest` or `helm get values` command. 

```bash
helm get manifest demo
```