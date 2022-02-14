# Kubernetes Service Discovery

> TODO: Use jaimesalas/prom-web

This demo will see us configure Kubernetes service discovery in the Prometheus server we'll use the Kubernetes node role and the Kubernetes service role. Let's start collecting information from Kubernetes by adding a service discovery block using the node role. 

This will create a scrape target to retrieve Kubernetes metrics from each node in the cluster. I'll use a new job called Kubernetes nodes to differentiate the Kubernetes concept of a node from the Prometheus node exporter. 

Update `prometheus-config-map.yaml`

```yaml
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

      - job_name: file-node-exporter
        file_sd_configs:
          - files: 
            - targets.yml
      # diff #
      - job_name: k8s-nodes
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
          insecure_skip_verify: true 
        authorization:
          credentials_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        kubernetes_sd_configs:
          - role: node
      # diff #
  targets.yml: |-
    - labels:
        job: file-node-exporter
      targets:
        - 10.0.0.13:9100

```

You can see under `kubernetes_sd_configs` that right now, we're just going to specify the single key of role. The lines dictating the scheme and tls_config are specifically for when Prometheus scrapes the targets. Because Prometheus is running inside the Kubernetes cluster, the Discovery phase where the Kubernetes API is queried for nodes automatically uses the correct certificate and credentials file; however, the scraping phase does not automatically set these, so we're appointing them at the default credentials that come with each pod deployment in Kubernetes. 

> NOTE: Right now, the kube node metrics are only accesible from https://kubernetes.default.svc/metrics, we will set up this on relabel pahse. 

There is a lot more detail and examples of different configurations for Kubernetes service discovery in here [bit.ly link](https://bit.ly/k8s-sd-example).

For other service discovery methods, keep in mind that this two‑step process still applies. Prometheus first has to query something external to find targets, and then it has to go to the targets and scrape them. Depending on how your service discovery mechanism and targets themselves are secured, you may need to use different combinations of `tls_config`, `bearer token`, or `username and password`. Be sure to read the documentation for your service discovery method thoroughly when configuring Prometheus to access it. 

This was a change to the `prometheus.yml` file, so again, you need to restart Prometheus in whichever way is appropriate. 

```bash
vi prometheus-config-map.yaml
```

```bash
kubectl replace -f prometheus-config-map.yaml && kubectl rollout restart deployment -n monitoring prometheus-deployment
```

On the Targets dashboard, we can now see three new targets under a job called Kubernetes nodes. Remember that these are nodes in the Kubernetes sense and won't provide the same time series as the Prometheus node exporter. 

Let's expand our service discovery a little and retrieve metrics from tests service that we're going to deploy on the Kubernetes cluster. 

```bash
vi hw-app.yaml
```

```bash
kubectl apply -f hw-app.yaml
```

This job is simpler than the one for Kubernetes nodes because scraping the metrics from hw-app services does not require authentication. Whether they should require it is outside the scope for this course, but this is an example of metrics over HTTP, which are open for scraping. 

Update `prometheus-config-map.yaml`

```diff
# ....
   kubernetes_sd_configs:
     - role: node

+- job_name: k8s-hw-app-services
+  kubernetes_sd_configs:
+    - role: service 
+      namespace:
+        names: 
+          - hwns
```

Within the kubernetes_sd_config, I've specified a namespace of `hwns`, which is the namespace that hw-app deploy their microservices under. 

Excluding the namespaces key would include all services from the other namespaces too, including services deployed as part of providing system functionality. 

Querying for targets by namespace, tag, or region is something that will be very dependent on the type of service discovery mechanism that you use. Once again, Prometheus needs to be restarted in order to pick up this new job. 

```bash
kubectl replace -f prometheus-config-map.yaml && kubectl rollout restart deployment -n monitoring prometheus-deployment
```

Another job is now listed on the Targets dashboard for Carved Rock's Kubernetes services. Before we leave this demo, I want to show you a new service being created in Kubernetes and the result on the dashboard. It should go to prove that a Prometheus restart is required to create a new job, but if the job uses service discovery, then any relevant new targets are discovered automatically. The kubectl command on screen will take an already running application on this Kubernetes cluster and create a service from it so that the application is accessible from other apps running in the cluster. One comparable event in another service discovery mechanism would be deploying a new application to Google Compute Engine. We're back on the Targets dashboard, and without having to restart Prometheus, we can see the new service is up and being scraped automatically.