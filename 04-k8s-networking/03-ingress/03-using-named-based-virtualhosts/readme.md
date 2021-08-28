# Using Named Based Virtualhosts

Create `ingress-namebased.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-namebased
spec:
  rules:
  - host: red.example.com
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: hello-world-service-red
            port: 
              number: 4242
  - host: blue.example.com
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: hello-world-service-blue
            port: 
              number: 4343

```


```bash
#Now, let's route traffic to the services using named based virtual hosts rather than paths, wait for ADDRESS to be populated
kubectl apply -f ingress-namebased.yaml
kubectl get ingress --watch
ingress-namebased   <none>   red.example.com,blue.example.com   192.168.64.6   80      28s
ingress-path        <none>   path.example.com                   192.168.64.6   80      61m
ingress-single      <none>   *                                  192.168.64.6   80      115m
```

```bash
curl http://$INGRESSIP/ --header 'Host: red.example.com'
curl http://$INGRESSIP/ --header 'Host: blue.example.com'
```

```bash
curl http://192.168.64.6/ --header 'Host: red.example.com'
curl http://192.168.64.6/ --header 'Host: blue.example.com'
```

```bash
#What about a name based virtual host that doesn't exist?
curl http://$INGRESSIP/ --header 'Host: what.example.com'
```

```bash
curl http://192.168.64.6/ --header 'Host: what.example.com'
Hello, world!
Version: 1.0.0
Hostname: hello-world-service-single-6c58c555f8-k2whh
```

```bash
#Why did it go to single? Remember our first ingress? It's listening on all hosts, so unspecified names will match there. And the second one has a default service
kubectl delete ingress ingress-single

kubectl delete ingress ingress-path
```

```bash
#This time we'll get a 404 because there's no ingress at this undefined host header and there's no default backend.
curl http://$INGRESSIP/ --header 'Host: what.example.com'
```

```bash
curl http://192.168.64.6/ --header 'Host: what.example.com'
```


