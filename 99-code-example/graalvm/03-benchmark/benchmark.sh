#!/bin/bash
API_URL="http://localhost:8080"
N=200
ENDPOINT="/api/salary"

read -e -p "Enter URL: [$API_URL]"
if [[ ${#REPLY} -gt 0 ]]
then
    API_URL=$REPLY
fi
API_URL=${API_URL}${ENDPOINT}
echo $API_URL

read -e -p "Enter number of iterations: [$N]"
if [[ ${#REPLY} -gt 0 ]]
then
    N=$REPLY
fi
echo $N

start=$(date +%s%N | cut -b1-13)
for (( i=1; i<=$N; i++ ))
do
    #echo -e "Request number $i"
    curl --silent --output /dev/null http://example.com
done
end=$(date +%s%N | cut -b1-13)

let TIME_MS=$end-$start
TIME_SECONDS=$(bc <<< "scale=3; $TIME_MS/1000")
AVERAGE_TIME=$(bc <<< "scale=3; $TIME_SECONDS/$N")

echo "Time spent: $TIME_SECONDS seconds"
echo "Average time: $AVERAGE_TIME seconds"