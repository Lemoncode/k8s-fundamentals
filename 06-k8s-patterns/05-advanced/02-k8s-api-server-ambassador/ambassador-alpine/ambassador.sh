#!/bin/sh
CERT="/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
K8S_API="https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT"
TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
/usr/local/bin/kubectl proxy --server="$K8S_API" --certificate-authority="$CERT" --token="$TOKEN" --accept-paths='^.*'
