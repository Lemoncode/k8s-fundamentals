# Using TLS Certificates

```bash
#TLS Example
#1 - Generate a certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout tls.key -out tls.crt -subj "/C=ES/ST=ANDALUCIA/L=MALAGA/O=IT/OU=IT/CN=tls.example.com"

```

```bash
#2 - Create a secret with the key and the certificate
kubectl create secret tls tls-secret --key tls.key --cert tls.crt
```

Create `ingress-tls.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-tls
spec:
  tls:
    - hosts:
        - tls.example.com
      secretName: tls-secret
  rules:
  - host: tls.example.com
    http:
      paths:
      - pathType: Prefix
        path: /
        backend:
          service:
            name: hello-world-service-single
            port: 
              number: 80
```

```bash
#3 - Create an ingress using the certificate and key. This uses HTTPS for both / and /red 
kubectl apply -f ingress-tls.yaml
```

```bash
#Check the status...do we have an IP?
kubectl get ingress --watch
NAME                CLASS    HOSTS                              ADDRESS        PORTS     AGE
ingress-namebased   <none>   red.example.com,blue.example.com   192.168.64.6   80        30m
ingress-path        <none>   path.example.com                   192.168.64.6   80        91m
ingress-tls         <none>   tls.example.com                    192.168.64.6   80, 443   21s
```

```bash
#Test access to the hostname...we need --resolve because we haven't registered the DNS name
#TLS is a layer lower than host headers, so we have to specify the correct DNS name. 
curl https://tls.example.com:443 --resolve tls.example.com:443:$INGRESSIP --insecure --verbose
```

```bash
curl https://tls.example.com:443 --resolve tls.example.com:443:192.168.64.6 --insecure --verbose
* Added tls.example.com:443:192.168.64.6 to DNS cache
* Hostname tls.example.com was found in DNS cache
*   Trying 192.168.64.6...
* TCP_NODELAY set
* Connected to tls.example.com (192.168.64.6) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/cert.pem
  CApath: none
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
* TLSv1.2 (IN), TLS handshake, Server finished (14):
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (OUT), TLS handshake, Finished (20):
* TLSv1.2 (IN), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (IN), TLS handshake, Finished (20):
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256
* ALPN, server accepted to use h2
* Server certificate:
*  subject: C=US; ST=ILLINOIS; L=CHICAGO; O=IT; OU=IT; CN=tls.example.com
*  start date: Aug 16 18:28:19 2021 GMT
*  expire date: Aug 16 18:28:19 2022 GMT
*  issuer: C=US; ST=ILLINOIS; L=CHICAGO; O=IT; OU=IT; CN=tls.example.com
*  SSL certificate verify result: self signed certificate (18), continuing anyway.
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* Using Stream ID: 1 (easy handle 0x7faca180de00)
> GET / HTTP/2
> Host: tls.example.com
> User-Agent: curl/7.64.1
> Accept: */*
> 
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
< HTTP/2 200 
< date: Mon, 16 Aug 2021 18:32:41 GMT
< content-type: text/plain; charset=utf-8
< content-length: 83
< 
Hello, world!
Version: 1.0.0
Hostname: hello-world-service-single-6c58c555f8-k2whh
* Connection #0 to host tls.example.com left intact
* Closing connection 0
```

### Cleanup

```bash
cat <<EOF | tee ./cleanup.sh
#Clean up from our demo
kubectl delete ingresses ingress-path
kubectl delete ingresses ingress-tls
kubectl delete ingresses ingress-namebased
kubectl delete deployment hello-world-service-single
kubectl delete deployment hello-world-service-red
kubectl delete deployment hello-world-service-blue
kubectl delete service hello-world-service-single
kubectl delete service hello-world-service-red
kubectl delete service hello-world-service-blue
kubectl delete secret tls-secret
rm tls.crt
rm tls.key
EOF
```

```bash
chmod +x cleanup.sh
```

```bash
./cleanup.sh
```
