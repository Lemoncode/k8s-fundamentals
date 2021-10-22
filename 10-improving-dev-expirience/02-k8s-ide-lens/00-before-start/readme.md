## Before Start

For the following demos we're going to create an `EKS` cluster

### Create a key pair

```bash
aws ec2 create-key-pair --key-name WorkersKey --query 'KeyMaterial' --output text > WorkersKey.pem
```

We have to grant permissions to the key:

```bash
chmod 400 WorkersKey.pem
```

We can display our key pair by running

```bash
aws ec2 describe-key-pairs --key-name WorkersKey
```

### Create the cluster

```bash
eksctl create cluster \
--name lc-cluster \
--version 1.19 \
--region eu-west-3 \
--nodegroup-name lc-nodes \
--node-type t2.small \
--nodes 2 \
--nodes-min 1 \
--nodes-max 2 \
--with-oidc \
--ssh-access \
--ssh-public-key WorkersKey \
--managed
```

> NOTE: Align the cluster region with your aws user settings

### View resources

```bash
kubectl get nodes -o wide
```

We get something similar to this:

```bash
NAME                                          STATUS   ROLES    AGE     VERSION               INTERNAL-IP     EXTERNAL-IP     OS-IMAGE         KERNEL-VERSION                CONTAINER-RUNTIME
ip-192-168-30-8.eu-west-3.compute.internal    Ready    <none>   3h40m   v1.19.14-eks-dce78b   192.168.30.8    15.236.91.119   Amazon Linux 2   5.4.149-73.259.amzn2.x86_64   docker://20.10.7
ip-192-168-53-91.eu-west-3.compute.internal   Ready    <none>   3h40m   v1.19.14-eks-dce78b   192.168.53.91   35.181.52.239   Amazon Linux 2   5.4.149-73.259.amzn2.x86_64   docker://20.10.7
```


### Connecting to EC2 node

```bash
$ ssh -i ./WorkersKey.pem ec2-user@ec2-35-180-29-45.eu-west-3.compute.amazonaws.com
```

## Cleanup

```bash
$ eksctl delete cluster --name lc-cluster --region eu-west-3
```
