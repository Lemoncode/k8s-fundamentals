EXTERNAL_IP=$1

for ((i=1;i<=100;i++))
do
    curl -s "http://$EXTERNAL_IP" | grep "<title>.*</title>"
    sleep 2s
done

# -s for silent mode
