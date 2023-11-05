# File-based Service Discovery

In this demo, you'll see how to use the most flexible service discovery mechanism in Prometheus, which is based on using one or more target files. We use this method to target a host outside of the Kubernetes infrastructure that Carved Rock uses. As I mentioned in the context for this course, we're going to be running Prometheus from a Kubernetes cluster. There will be Kubernetes‑specific ways that I configure the server, but all of the principles still apply to Prometheus installs on standalone machines. If you're looking to reproduce this setup, I use the blog post at this [Bitly link](https://bit.ly/prom-on-k8s) as a guide.

```bash
vagrant ssh c1-cp1
```

```bash
vi clusterRole.yaml
vi config-map.yaml
vi prometheus-deployment.yaml
vi prometheus-service.yaml
```

```bash
kubectl create namespace monitoring
kubectl create -f clusterRole.yaml
kubectl create -f config-map.yaml
kubectl create -f prometheus-deployment.yaml
kubectl create -f prometheus-service.yaml
```

```
Browse 10.0.0.11:30000
```

We're currently looking at the dashboard after a fresh install of Prometheus. The only target we have listed is the Prometheus server itself because Prometheus will monitor itself out of the box. Carved Rock ran a load balancer that I'd like to see on this screen. So I'll start the Node Exporter there, and then we'll configure file‑based service discovery to find it. 

Just in case you need reminding, Node Exporter is an exporter that Prometheus provides to expose system metrics from your hosts. I'm running the Node Exporter as a service under systemd, so I'll use systemctl to interact with it. 

```bash
vagrant ssh loadbalancer
```

```bash
# In our case it's already running as daemon --> "apt-get -y install prometheus-node-exporter"
sudo systemctl restart node_exporter && sudo systemctl status node_exporter
```

With the Node Exporter running on the load balancer, I need to give Prometheus the load balancer as a target. With my Prometheus being in Kubernetes, I'm going to update a ConfigMap. 

```yaml
# prometheus-config-map.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-server-conf
  labels:
    name: prometheus-server-conf
  namespace: monitoring
data:
  prometheus.rules.yml: |-
    # Rules

  prometheus.yml: |-
    global:
      scrape_interval: 5s
      evaluation_interval: 5s

    scrape_configs:
      - job_name: prometheus
        static_configs:
          - targets: ['localhost:9090']

  targets.yml: |-
    # Targets

```

A ConfigMap can create a file for use by an application being run in Kubernetes. In this case, it's the `prometheus.yml` configuration file. 

The sections of this file to pay attention to are the keys and the data. This is what will be put into each file that we'll use to configure Prometheus. 

If you're running Prometheus on its own machine then you'll just use a text editor to change the file directly. 

Inside prometheus.yml, I'm going to leave the default job named prometheus and add another for collecting node metrics called file‑node‑exporter. Note the dash before the job name here, as we're adding another instance of scrape_config under the list stored within scrape_configs. The `file_sd_configs` key allows us to define our file‑based service discovery. That's what the SD stands for. Under this key, you can use the files subkey to list one or more files that Prometheus will pull targets from for scraping in this job. 

```diff
data:
  prometheus.rules.yml: |-
    # Rules

  prometheus.yml: |-
    global:
      scrape_interval: 5s
      evaluation_interval: 5s

    scrape_configs:
      - job_name: prometheus
        static_configs:
          - targets: ['localhost:9090']
+
+     - job_name: file-node-exporter
+       file_sd_configs:
+         - files: 
+           - targets.yml
+
  targets.yml: |-
    # Targets

```

I've chosen to use a YAML file because I'll be entering targets by hand. You can equally choose JSON if you have a script or other method to produce targets. Remember that file‑based service discovery is the most simple from a Prometheus point of view, but you do have to manage adding and removing the targets yourself. 

File‑based discovery is good for demonstrating or experimenting, but it also serves as the escape hatch that allows you to integrate machines into your monitoring that are outside any supported automatic service discovery. 

Inside the targets file, I'll add YAML to describe the target of our load balancer. We use the labels key to associate targets to a job defined in the configuration file. 

```diff
prometheus.yml: |-
    global:
      scrape_interval: 5s
      evaluation_interval: 5s

    scrape_configs:
      - job_name: prometheus
        static_configs:
          - targets: ['localhost:9090']

      - job_name: file-node-exporter
        file_sd_configs:
          - files: 
            - targets.yml

  targets.yml: |-
+   - labels:
+       job: file-node-exporter
+     targets:
+       - 10.0.0.13:9100
```

Now that these two files are in place, we need to get Prometheus to restart and reload its configuration. 

```bash
vagrant ssh c1-cp1
```

```bash
vi prometheus-config-map.yaml
```

This could mean restarting the process or service for you. In Kubernetes, we need to use the ConfigMap file to replace our ConfigMap object and run a command to restart the Pod that Prometheus is running in. 

```bash
kubectl replace -f prometheus-config-map.yaml && \
  kubectl rollout restart deployment -n monitoring prometheus-deployment
```

Back on the Targets dashboard, we see the load balancer is now being scraped. Its status is up, and you can see its last scrape time. 

Another dashboard of interest is Service Discovery. On this page, we can see our two current jobs. Expanding the file‑node‑exporter job, you can see there are discovered labels that offer some extra metadata like `__meta_filepath`, which tells us where the targets file is located on the server. This is very useful if you're going to make extensive use of file‑based service discovery. 

If you're eagle eyed, you may have spotted that targets in the original Prometheus job were defined in `prometheus.yml`, but we went to the extra hassle of defining another file called `targets.yml` for the new job. This highlights a key difference between a static target, as defined directly in the Prometheus configuration file, and a file‑based service discovery approach. 

With file‑based service discovery, you do not have to restart Prometheus for changes in targets to be picked up. Prometheus monitors the file using file system events and updates itself whenever required. 

To demonstrate this, I'll switch to the load balancer and change which port the Node Exporter runs on. Inside the service file for Node Exporter, we need to add an argument, `‑‑web.listener‑address` and the new port of `9101`. 

```bash
sudo vi /etc/systemd/system/node_exporter.service
```

```ini
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter --web.listen-address=:9101 

[Install]
WantedBy=multi-user.target
EOF
```

Then reload the service and restart it. 

```bash
sudo systemctl daemon-reload
sudo systemctl restart node_exporter
sudo systemctl status node_exporter
```

If you're not using a systemd service, restart the Node Exporter process however else you're running it. Back in the ConfigMap, I'll update the target port of the load balancer from the original 9100 to 9101 and save the file. 

Update `prometheus-config-map.yaml`

```diff
targets.yml: |-
    - labels:
        job: file-node-exporter
      targets:
-       - 10.0.0.13:9100
+       - 10.0.0.13:9101
```

Standalone Prometheus would detect these changes almost immediately. In Kubernetes, I'll replace the ConfigMap object. 

```bash
kubectl replace -f prometheus-config-map.yaml
```

In either case, you do not need to restart the running Prometheus. And now I'm on the Targets dashboard again. If I refresh the page, we can see the port for the load balancer Node Exporter has been updated. No matter how machines are added or removed from your environment, if you can produce a YAML or JSON file of the current inventory and get it to Prometheus then it will begin to monitor the correct hosts right away. This is powerful when you need to monitor infrastructure outside a standard service discovery mechanism.