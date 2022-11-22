# Job Demo

Let's revisit the yaml required to create a Job and see how we could put it into action with our kubectl commands. 

```yml
# pi-counter.job.yml
apiVersion: batch/v1 # 1.
kind: Job
metadata:
  name: pi-counter
spec:
  completions: 4 # required 4 Pods to complete for a succesful job # 2.
  parallelism: 2 # allow uo to 2 Pods to run in parallel # 3
  activeDeadlineSeconds: 240 # how long can the job be active before it's terminated? # 4
  template: # 5.
    metadata:
      name: pi-counter
    spec: # 6.
      restartPolicy: Never # OnFailure or Never
      containers: # 7.
      - name: pi-counter
        image: alpine
        command: 
          - "sh"
          - "-c" 
          - "echo 'scale=1000; 4*a(1)' | bc -l;sleep 2;"
# http://www.tux-planet.fr/calculer-le-chiffre-pi-en-ligne-de-commande-sous-linux/ 
# https://unix.stackexchange.com/questions/166220/how-do-i-print-pi-3-14159 


```
1. Notice the API version and the kind that we have. 

2. The completions were going to require four pods to complete for that job to be marked as successful, 

3. and we're gonna allow two pods to run in parallel at one time. 

4. Now, we also have an active deadlines seconds, and you'll see the comment there. How long can the job be active before it's terminated?

5. We have our template with its meta data and name. 

6. And then we have this spec. In this case, I said, we don't want to restart if there's a failure, that's the never. But if one of the containers fails and I do want to allow them to restart and give it another try, then we could say on failure. 

7. So we're simply going to fire up this alpine container shell out to run a command that calculates pie and then sleeps two seconds. 

So this will take a little bit of time.

How you start your job really depends if your container code automatically kicks off and starts up on its own or you have to call a command like we're doing here.

To get this going we can, do our normal kubectl create or apply command.

```bash
kubectl create -f pi-counter.job.yml --save-config 
```

Now we can get jobs 

```bash
kubectl get jobs
```
```
NAME          COMPLETIONS   DURATION   AGE
pi-counter   4/4           20s        35s
```

Notice that we have one of four completed. Let's just keep running this three of four completed, and there we go for four.

We can also describe a job:

```bash
kubectl describe jobs pi-counter
```

```
# .....
Events:
  Type    Reason            Age   From            Message
  ----    ------            ----  ----            -------
  Normal  SuccessfulCreate  2m4s  job-controller  Created pod: pi-counter-shvgw
  Normal  SuccessfulCreate  2m4s  job-controller  Created pod: pi-counter-v7kf9
  Normal  SuccessfulCreate  114s  job-controller  Created pod: pi-counter-thfng
  Normal  SuccessfulCreate  113s  job-controller  Created pod: pi-counter-c9hm4
  Normal  Completed         104s  job-controller  Job completed
```

We can actually go into the pods and there's they're still there. 

```bash
kubectl get pods
```

```
NAME                READY   STATUS      RESTARTS   AGE
pi-counter-c9hm4   0/1     Completed   0          3m20s
pi-counter-shvgw   0/1     Completed   0          3m31s
pi-counter-thfng   0/1     Completed   0          3m21s
pi-counter-v7kf9   0/1     Completed   0          3m31s
```

They're done, though. And let's go ahead and view the logs: 

```bash
kubectl logs pi-counter-c9hm4
```

```
3.141592653589793238462643383279502884197169399375105820974944592307\
81640628620899862803482534211706798214808651328230664709384460955058\
22317253594081284811174502841027019385211055596446229489549303819644\
28810975665933446128475648233786783165271201909145648566923460348610\
45432664821339360726024914127372458700660631558817488152092096282925\
40917153643678925903600113305305488204665213841469519415116094330572\
70365759591953092186117381932611793105118548074462379962749567351885\
75272489122793818301194912983367336244065664308602139494639522473719\
07021798609437027705392171762931767523846748184676694051320005681271\
45263560827785771342757789609173637178721468440901224953430146549585\
37105079227968925892354201995611212902196086403441815981362977477130\
99605187072113499999983729780499510597317328160963185950244594553469\
08302642522308253344685035261931188171010003137838752886587533208381\
42061717766914730359825349042875546873115956286388235378759375195778\
18577805321712268066130019278766111959092164201988
```

Notice that pods didn't go away. And they do that because when we kick this off, if something did happen, we might want to jump back and look at the logs to figure out what happened. 

We can describe the job, like we do with deployments, services...

```bash
kubectl get job pi-counter -o yaml
```

```
apiVersion: batch/v1
kind: Job
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"batch/v1","kind":"Job","metadata":{"annotations":{},"name":"pi-counter","namespace":"default"},"spec":{"activeDeadlineSeconds":240,"completions":4,"parallelism":2,"template":{"metadata":{"name":"pi-counter"},"spec":{"containers":[{"command":["sh","-c","echo 'scale=1000; 4*a(1)' | bc -l;sleep 2;"],"image":"alpine","name":"pi-counter"}],"restartPolicy":"Never"}}}}
  creationTimestamp: "2021-08-11T18:18:08Z"
  labels:
    controller-uid: ee7d695c-c02d-4af7-814a-814f3342ae73
    job-name: pi-counter
  name: pi-counter
  namespace: default
  resourceVersion: "150784"
  uid: ee7d695c-c02d-4af7-814a-814f3342ae73
spec:
  activeDeadlineSeconds: 240
  backoffLimit: 6
  completions: 4
  parallelism: 2
  selector:
    matchLabels:
      controller-uid: ee7d695c-c02d-4af7-814a-814f3342ae73
  template:
    metadata:
      creationTimestamp: null
      labels:
        controller-uid: ee7d695c-c02d-4af7-814a-814f3342ae73
        job-name: pi-counter
      name: pi-counter
    spec:
      containers:
      - command:
        - sh
        - -c
        - echo 'scale=1000; 4*a(1)' | bc -l;sleep 2;
        image: alpine
        imagePullPolicy: Always
        name: pi-counter
        resources: {}
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
      dnsPolicy: ClusterFirst
      restartPolicy: Never
      schedulerName: default-scheduler
      securityContext: {}
      terminationGracePeriodSeconds: 30
status:
  completionTime: "2021-08-11T18:18:27Z"
  conditions:
  - lastProbeTime: "2021-08-11T18:18:27Z"
    lastTransitionTime: "2021-08-11T18:18:27Z"
    status: "True"
    type: Complete
  startTime: "2021-08-11T18:18:08Z"
  succeeded: 4
```

> Print the output
