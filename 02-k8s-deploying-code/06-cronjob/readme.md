## Understanding CronJobs

Some time when we have a job, we want to run on a recurring basis. A job is intending to run once and then terminate. But if you've ever needed to run a job on a scheduled basis, then you could do a cron job. K8s documentation, they define it this way: 

> A Cron Job creates Jobs on a time based schedule 

Uses Cron format. A CronJob is a Job that runs on a schedule basis. Once you learn how to do the primitive Job, all you really have to learn after that is the cron format and add it to the yaml, and then you can schedule that job to run as much as you'd like. It could run every minute, every hour, every month, every year... 

In order to do that, we have to learn a little bit about a format called the Cron format. 

* A CronJob is a Job that runs on scheduled basis

* Scheduled using the Cron format

* CronJob names must be less than 52 characters

Now, what can you do with the cron job? Same thing is a job:

* Retrieve and cache remote data

* Truncate logs

* Perform Backup

* Move data between DBs

Let's talk about the Cron formats that we can understand how this works, if you think about scheduling anything, what would you need to know? Well, you need to know what hour is to run. What minute? What day? What month? Things along those lines. 

The cron format does scheduling, but it breaks down the hours and minutes and days and months into individual pieces. For example: 

```
1  2  3  4  5
*  *  *  *  * 
```


1. the 1st 1 represents the minutes. It could have a value from 0 to 59. 

2. the next one's going to be, hour 0 to 23. It's a 24 hour type of clock versus AM PM. 

3. The next one's going to be the day of the month in which this runs one through 31. 

4. Next up is what month does run. Here we have a couple options, you could do one through 12 or you could do friendly names. 

5. And then finally, we have the day of the week. Sunday is zero, although Sunday can also be seven not confusing at all right, but that one's a little unique. You can also use friendly values like Sun Mon to wed. 

Now we're putting of five of these together, we have everything we need to schedule a job that we could say, I want to run it every minute every five minutes or I want to run it at 10:30 on a certain day of the month. Or maybe I want to run it on a certain day of the week. 

Let's see some examples:

So if we wanted to run a job at 22:30 or if you do pm. 10:30 p.m. On every Monday, then we would do the following. 

```bash
# Run at 22:30 every Monday
30 22 * * 1
```

Now for the next example. What if we want to run at basically midnight 12:01 a.m. on the first day of each month?.

```bash
# Run at 00:01 on the first day of each month
1 0 1 * *
```

Well, we would define the minute that's the one. The hour midnight would be zero course. And then what's the day of the month one. Notice the last two were left alone, they're just asterics, that's because we're not going to say what month to run it, and what day of the week we just want to say, run it at midnight, `0 1 0 0 1` he could say, on the first day of each month. Now it's like it's some other things you could do with this as well. 

There's a shortcut syntax for some of these that you can use. It's a string format. So, for example, 

```bash
0 * * * * # 1.
0 0 * * * # 2.
0 0 * * 0 # 3.
0 0 1 * * # 4.
0 0 1 1 * # 5.
*/1 * * * # 6.
```

1. @hourly - run once every hour. We said zero on the minutes, but we didn't say the hour. So what this would do is at every hour on the top of the hour, it would run this job. 

2. @daily - run once every day at midnight. This has run at midnight with all the days, we didn't say the month. We didn't say the day of the week. We didn't say the day, none of that. Okay, so this would be a daily run at midnight. 

3. @weekly - run once every week. We have run at midnight, and then the last one is the day of the week.This would be run once a week on a Sunday and that would be a weekly run. So like with the others you could do at hourly at daily or weekly as a shortcut code. 

4. @monthly - run once every month. We have midnight, but we have a day of the month, one January 1st February 1st things like that that would be a monthly run. 

5. @yearly - run once every year. This would be a yearly run because we're gonna run it in January on the first at midnight. 

6. Run once every minute. 

[crontab.guru](https://crontab.guru/)

## Creating a CronJob

The CronJob, it's pretty similar to a Job, there is a little bit of a different template you're going to see. But other than that, it's very similar: 

```yaml
apiVersion: batch/v1beta1 # 1.
kind: CronJob
metadata:
  name: pi-counter
spec:
  concurrencyPolicy: Allow # 2.
  schedule: "*/1 * * * *" # 3.
  jobTemplate: # 6
    spec:
      template:
        spec:
          restartPolicy: OnFailure # OnFailure Never # 4 
          containers:
          - name: pi-counter 
            image: alpine
            command: # 5.
            - "sh"
            - "-c" 
            - "echo 'scale=1000; 4*a(1)' | bc -l;sleep 2;"

```

1. Notice this API is actually at`V1beta1`, so it's a little bit different than obviously what we saw with jobs kind again is a CronJob instead of a Job. 

2. Now moving on down, we have `concurrencyPolicy: Allow.` This is for is what if we schedule a job to run on a CronJob timer type basis and it's running, but the next Job then starts, should they be allowed to run concurrently at the same time? In this case, we're saying yes. If we don't allow it, then obviously it wouldn't start up the 2nd, because one would still be running. So this is a good way to either allow overlapping or to prevent overlapping if you like. 

3. Now the actual cron format that we talked about is defined with this schedule property. It's going to run every minute. 

4. Now moving on down. We also have the restart policy in this case, I'm saying, if the container fails, then let's go ahead and try to restart it. 

5. And then, of course, we have the actual command to run, and this would be your custom code here. 

6. One of the big things you'll notice is the `jobTemplate`, though this is different than what we saw with a regular `job`. 


As with a job, we can use the kubectl create or apply commands to actually take that yaml and get our CronJob up and running and scheduled.

We now have a job scheduler that's going to be scheduling this throw a controller, and then it will make sure that this particular Job runs if a node or nodes is down and it can't schedule them, then you can even set up a max number of times that's allowed to try to run a Job before it just errors. 

```bash
kubectl create -f file.cronjob.yml --save-config
```

```bash
kubectl apply -f file.cronjob.yml
```

## CronJobs Demo

[CronJob Demo](01-cronjob-demo/readme.md)


### Cleanup

```bash
kubectl delete -f pi-counter.cronjob.yml
```
