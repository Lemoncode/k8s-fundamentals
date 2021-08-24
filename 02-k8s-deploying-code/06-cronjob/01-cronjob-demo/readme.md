# CronJob Demo

Now let's take a look at how CronJobs can be put into action and some of the key differences between them and regular jobs. So coming back into the same jobs folder that we looked at earlier, and now this, I have this `pi-counter.cronjob.yml` in this case is gonna be very similar to what we saw earlier. 

```yml
# pi-counter.cronjob.yml
apiVersion: batch/v1beta1 
kind: CronJob
metadata:
  name: pi-counter
spec:
  # concurrencyPolicy Choices:
  # Allow    (it's ok to run concurrent jobs)
  # Forbid   (no concurrent jobs)
  # Replace (replace unfinished job with new one)
  concurrencyPolicy: Allow
  schedule: "*/1 * * * *" # Run the job every minute
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure # OnFailure Never 
          containers:
          - name: pi-counter 
            image: alpine
            command: 
            - "sh"
            - "-c" 
            - "echo 'scale=1000; 4*a(1)' | bc -l;sleep 2;"

```

This CronJob that can run it's gonna run on a schedule, but it's just going to calculate pi digits and you'll notice that we have are scheduled to find right here. It's gonna run every minute. 

Now you notice concurrency policy Allow if, when this runs Is it okay for concurrent jobs or multiple jobs, In other words, to run at the same time, or is that not Ok. You notice some options here, `allow`, `forbid` or `replace` now replace we haven't talked about it allows an unfinished job to be replaced with a brand new job, which actually could be pretty useful because of the unfinished job, was taking too long for some reason you could just automatically replace it when the next schedule is hit, and that would start up the next CronJob. 

Now, as mentioned, we have a `jobTemplate` that is different than a regular job. And then from there, it's all pretty standard now. In this case, I made the restart policy on failure. So if one of the containers in the pod does fail, we can go ahead and try it again. The other option there again is never. And then I have an Alpine image and we do our little pie calculation here. You'll see. Let's go ahead and get this going so we'll let this start. 

```bash
$ kubectl create -f pi-counter.cronjob.yml --save-config
Warning: batch/v1beta1 CronJob is deprecated in v1.21+, unavailable in v1.25+; use batch/v1 CronJob
```

There we go and let's do a get pods and you'll notice nothing is running yet. 

```bash
$ kubectl get pods
```

Okay, let's get jobs now, you might wonder, why don't we see anything?

```bash
$ kubectl get jobs
```

Well, this is a CronJob.

```bash
$ kubectl get cj 
$ kubectl get cronjob 
```

You notice we have schedule, it's not suspended, it's not active. Let's do get pods again but with watch. 

```bash
$ kubectl get pods --watch
```

If we wait you'll notice it started of pending a couple times. Then the container got created. 

```bash
NAME                        READY   STATUS      RESTARTS   AGE
pi-counter-27145158-wfl4q   0/1     Completed   0          2m43s
pi-counter-27145159-hvrcz   0/1     Completed   0          103s
pi-counter-27145160-tsgmv   0/1     Completed   0          43s
pi-counter-27145161-fgcnd   0/1     Pending     0          0s
pi-counter-27145161-fgcnd   0/1     Pending     0          0s
pi-counter-27145161-fgcnd   0/1     ContainerCreating   0          0s
pi-counter-27145161-fgcnd   1/1     Running             0          4s
pi-counter-27145161-fgcnd   0/1     Completed           0          7s
pi-counter-27145158-wfl4q   0/1     Terminating         0          3m7s
pi-counter-27145158-wfl4q   0/1     Terminating         0          3m7s
```

Then the job ran. Then the job completed. Let's do get our CronJob again. 

```bash
$ kubectl get cronjob 
```

and notice we have some info, but then we could go in and do our normal -o. 

```bash
$ kubectl cj -o yaml
```

We could do the yaml, We make this a little bigger and we can get some information about it as you'll see up top here. So there's our command that was running our image, all that type of great info we'd want. And then, of course, if we do get pods, 

```bash
$ kubectl get pods
```

though, Okay, who knows? Another one just started. There's another one that was completed. Now notice I ran it again, and we have to have now been completed. And this just kind of keeps going. We can come on in to a logs and there's our pie calculation. 

```bash
$ kubectl logs pi-counter-<serial-number>
```

