# Amazon Elastic File System

Amazon Elastic File System (Amazon EFS) provides a simple, scalable, fully managed elastic NFS file system for use with AWS Cloud services and on-premises resources. It is built to scale on demand to petabytes without disrupting applications, growing and shrinking automatically as you add and remove files, eliminating the need to provision and manage capacity to accommodate growth.

Multiple Amazon EC2 instances can access an Amazon EFS file system at the same time, providing a common data source for workloads and applications running on more than one instance or server.

## Creating an EFS File System

An EFS file system may be created and configured either from the AWS Management Console or using AWS CLI. An EFS file system may be accessed concurrently by worker nodes (EC2 instances) running inside the EKS cluster VPC. Instances connect to a file system by using a network interface called a mount target.

Let’s define a set of environment variables pertaining to the name of your EKS cluster, VPC where it is deployed and the IPv4 CIDR block associated with that VPC.

```bash
eksctl get cluster
```
Using this command we can find out the current cluster info

```
2021-08-29 13:00:32 [ℹ]  eksctl version 0.62.0
2021-08-29 13:00:32 [ℹ]  using region eu-west-3
NAME            REGION          EKSCTL CREATED
lc-cluster      eu-west-3       True
```

```bash
CLUSTER_NAME=lc-cluster
VPC_ID=$(aws eks describe-cluster --name $CLUSTER_NAME --query "cluster.resourcesVpcConfig.vpcId" --output text)
CIDR_BLOCK=$(aws ec2 describe-vpcs --vpc-ids $VPC_ID --query "Vpcs[].CidrBlock" --output text)
```

Next, create a security group to be associated with the mount targets. Then, add an ingress rule to this security group that allows all inbound traffic using NFS protocol on port 2049 from IP addresses that belong to the CIDR block of the EKS cluster VPC. This rule will allow NFS access to the file system from all worker nodes in the EKS cluster.

```bash
MOUNT_TARGET_GROUP_NAME="eks-efs-group"
MOUNT_TARGET_GROUP_DESC="NFS access to EFS from EKS worker nodes"
MOUNT_TARGET_GROUP_ID=$(aws ec2 create-security-group --group-name $MOUNT_TARGET_GROUP_NAME --description "$MOUNT_TARGET_GROUP_DESC" --vpc-id $VPC_ID | jq --raw-output '.GroupId')
aws ec2 authorize-security-group-ingress --group-id $MOUNT_TARGET_GROUP_ID --protocol tcp --port 2049 --cidr $CIDR_BLOCK
```

Now create and EFS file system

```bash
FILE_SYSTEM_ID=$(aws efs create-file-system | jq --raw-output '.FileSystemId')
```

Check the `LifeCycleState` of teh file system using the following command and wait until it changes from `creating` to `available`

```bash
aws efs describe-file-systems --file-system-id $FILE_SYSTEM_ID
```

```
{
    "FileSystems": [
        {
            "OwnerId": "092312727912",
            "CreationToken": "859c93eb-5346-4b41-aa65-6488e6668b2c",
            "FileSystemId": "fs-81e7e530",
            "FileSystemArn": "arn:aws:elasticfilesystem:eu-west-3:092312727912:file-system/fs-81e7e530",
            "CreationTime": "2021-08-29T13:08:55+02:00",
            "LifeCycleState": "available",
            "NumberOfMountTargets": 0,
            "SizeInBytes": {
                "Value": 6144,
                "ValueInIA": 0,
                "ValueInStandard": 6144
            },
            "PerformanceMode": "generalPurpose",
            "Encrypted": false,
            "ThroughputMode": "bursting",
            "Tags": []
        }
    ]
}
```

The EKS cluster that you created comprises worker nodes that are resident in the public subnets of the cluster VPC. Each public subnet resides in a different Availability Zone. As mentioned earlier, worker nodes connect to an EFS file system by using a mount target. It is best to create a mount target in each of the EKS cluster VPC’s Availability Zones so that worker nodes across your EKS cluster can all have access to the file system.

The following set of commands identifies the public subnets in your cluster VPC and creates a mount target in each one of them as well as associate that mount target with the security group you created above.

```bash
TAG1=tag:alpha.eksctl.io/cluster-name
TAG2=tag:kubernetes.io/role/elb
subnets=($(aws ec2 describe-subnets --filters "Name=$TAG1,Values=$CLUSTER_NAME" "Name=$TAG2,Values=1" | jq --raw-output '.Subnets[].SubnetId'))
for subnet in ${subnets[@]}
do
    echo "creating mount target in " $subnet
    aws efs create-mount-target --file-system-id $FILE_SYSTEM_ID --subnet-id $subnet --security-groups $MOUNT_TARGET_GROUP_ID
done

```

> NOTE: When eksctl provisions your VPC and EKS cluster, it assigns the following tags to all public subnets in the cluster VPC. The above command leverages these tags to identify the public subnets. **kubernetes.io/cluster/eksworkshop-eksctl = shared** and **kubernetes.io/role/elb = 1**

```bash
aws efs describe-mount-targets --file-system-id $FILE_SYSTEM_ID | jq --raw-output '.MountTargets[].LifeCycleState'

```

## EFS Provisioner for EKS with CSI Driver

### About the Amazon EFS CSI Driver

On Amazon EKS, the open source [EFS Container Storage Interface (CSI)](https://github.com/kubernetes-sigs/aws-efs-csi-driver) driver is used to manage the attachment of Amazon EFS volumes to Kubernetes Pods.

### Deploy EFS CSI Driver

We are going to deploy the driver using the stable release:

```bash
kubectl apply -k "github.com/kubernetes-sigs/aws-efs-csi-driver/deploy/kubernetes/overlays/stable/?ref=release-1.0"
```

Verify pods have been deployed:

```bash
kubectl get pods -n kube-system
```

Should return new pods with csi driver:

```
NAME                      READY   STATUS    RESTARTS   AGE
aws-node-8qnkx            1/1     Running   0          110m
aws-node-zgmxt            1/1     Running   0          110m
coredns-9b5d74bfb-c567m   1/1     Running   0          120m
coredns-9b5d74bfb-zk67b   1/1     Running   0          120m
efs-csi-node-4vq4t        3/3     Running   0          64s
efs-csi-node-5pwsz        3/3     Running   0          64s
kube-proxy-79jgv          1/1     Running   0          110m
kube-proxy-brxgw          1/1     Running   0          110m
```

### Create a persistent volume

```bash
cp efs-pvc.ini.yaml efs-pvc.yaml
```

We need to update `efs-pvc.yaml` with `EFS ID` previously created

```bash
sed -i "s/EFS_VOLUME_ID/$FILE_SYSTEM_ID/g" efs-pvc.yaml
```

Now we can apply:

```bash
kubectl apply -f efs-pvc.yaml
```

Next, check if a PVC resource was created. The output from the command should look similar to what is shown below, with the `STATUS` field set to `Bound`.

```bash
kubectl get pvc -n storage
```

Output:

```
NAME                STATUS   VOLUME    CAPACITY   ACCESS MODES   STORAGECLASS   AGE
efs-storage-claim   Bound    efs-pvc   5Gi        RWX            efs-sc         62s
```

A PV corresponding to the above PVC is dynamically created. Check its status with the following command.

```bash
kubectl get pv
```

Output:

```
NAME      CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                       STORAGECLASS   REASON   AGE
efs-pvc   5Gi        RWX            Retain           Bound    storage/efs-storage-claim   efs-sc                  2m9s
```

## Deploying the Stateful Services

Create `efs-writer.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: efs-writer
  namespace: storage
spec:
  containers:
  - name: efs-writer
    image: busybox
    command: ["/bin/sh"]    
    args: ["-c", "while true; do echo $POD_NAME.$POD_NAMESPACE - $(date -u) >> /shared/out.txt; sleep 5; done"]
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name    
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          fieldPath: metadata.namespace           
    volumeMounts:
    - name: efs-pvc
      mountPath: /shared
  volumes:
  - name: efs-pvc
    persistentVolumeClaim:
      claimName: efs-storage-claim

```

Create `efs-reader.yaml`

```yml
apiVersion: v1
kind: Pod
metadata:
  name: efs-reader
  namespace: storage
spec:
  containers:
  - name: efs-reader
    image: busybox
    command: ["/bin/sh"]
    args: ["-c", "while true; do sleep 5; done"]
    volumeMounts:
    - name: efs-pvc
      mountPath: /shared
  volumes:
  - name: efs-pvc
    persistentVolumeClaim:
      claimName: efs-storage-claim

```

Now apply both pods:

```bash
kubectl apply -f efs-writer.yaml
kubectl apply -f efs-reader.yaml
```

Each one of these pods references the PVC resource named `efs-storage-claim` created earlier and mounts the backing PV to a local directory named `/shared`.

Verify that the `efs-writer` pod is successfully writing data to the shared persistent volume.

```bash
kubectl exec -it efs-writer -n storage -- tail /shared/out.txt

```

The output looks like:

```
efs-writer.storage - Sun Aug 29 11:46:49 UTC 2021
efs-writer.storage - Sun Aug 29 11:46:54 UTC 2021
efs-writer.storage - Sun Aug 29 11:46:59 UTC 2021
efs-writer.storage - Sun Aug 29 11:47:04 UTC 2021
efs-writer.storage - Sun Aug 29 11:47:09 UTC 2021
efs-writer.storage - Sun Aug 29 11:47:14 UTC 2021
efs-writer.storage - Sun Aug 29 11:47:19 UTC 2021
efs-writer.storage - Sun Aug 29 11:47:24 UTC 2021
efs-writer.storage - Sun Aug 29 11:47:29 UTC 2021
efs-writer.storage - Sun Aug 29 11:47:34 UTC 2021
```

Verify that the `efs-reader` pod is able to successfully read the same data from the shared persistent volume.

```bash
kubectl exec -it efs-reader -n storage -- tail /shared/out.txt

```

The output looks like:

```
efs-writer.storage - Sun Aug 29 11:49:54 UTC 2021
efs-writer.storage - Sun Aug 29 11:49:59 UTC 2021
efs-writer.storage - Sun Aug 29 11:50:04 UTC 2021
efs-writer.storage - Sun Aug 29 11:50:09 UTC 2021
efs-writer.storage - Sun Aug 29 11:50:14 UTC 2021
efs-writer.storage - Sun Aug 29 11:50:19 UTC 2021
efs-writer.storage - Sun Aug 29 11:50:24 UTC 2021
efs-writer.storage - Sun Aug 29 11:50:29 UTC 2021
efs-writer.storage - Sun Aug 29 11:50:34 UTC 2021
efs-writer.storage - Sun Aug 29 11:50:39 UTC 2021
```

## Clean up

```bash
kubectl delete -f efs-reader.yaml
kubectl delete -f efs-writer.yaml
kubectl delete -f efs-pvc.yaml

```

Delete the efs-csi-node daemonset from the kube-system namespace

```bash
kubectl delete ds efs-csi-node -n kube-system
```

Delete the mount targets associated with the EFS file system

```bash
FILE_SYSTEM_ID=$(aws efs describe-file-systems | jq --raw-output '.FileSystems[].FileSystemId')
targets=$(aws efs describe-mount-targets --file-system-id $FILE_SYSTEM_ID | jq --raw-output '.MountTargets[].MountTargetId')
for target in ${targets[@]}
do
    echo "deleting mount target " $target
    aws efs delete-mount-target --mount-target-id $target
done

```

Check the status of EFS file system to find out if the mount targets have all been deleted.

```bash
aws efs describe-file-systems --file-system-id $FILE_SYSTEM_ID

```

```
# ....
"FileSystemId": "fs-81e7e530",
"FileSystemArn": "arn:aws:elasticfilesystem:eu-west-3:092312727912:file-system/fs-81e7e530",
"CreationTime": "2021-08-29T13:08:55+02:00",
"LifeCycleState": "available",
"NumberOfMountTargets": 0,
"SizeInBytes": {
    "Value": 6144,
    "ValueInIA": 0,
    "ValueInStandard": 6144
},
"PerformanceMode": "generalPurpose",
"Encrypted": false,
"ThroughputMode": "bursting",
"Tags": []
# ....
```

When the `NumberOfMountTargets` field in the JSON output reads 0, run the following command to delete the EFS file system.

```bash
aws efs delete-file-system --file-system-id $FILE_SYSTEM_ID

```

Delete the security group that is associated with the EFS file system

```bash
aws ec2 delete-security-group --group-id $MOUNT_TARGET_GROUP_ID

```

```bash
eksctl delete cluster --name lc-cluster --region eu-west-3
```