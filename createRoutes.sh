#!/bin/sh

# Author : Utkarsh Mehta

curl -i -X POST --url http://localhost:8001/services/ --data 'name=create' --data 'url=http://create:3000/create'
curl -i -X POST --url http://localhost:8001/services/create/routes --data 'hosts[]=create.com'
#curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: create.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=read' --data 'url=http://read:3001/read'
curl -i -X POST --url http://localhost:8001/services/read/routes --data 'hosts[]=read.com'
# curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: read.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=multiply' --data 'url=http://multiply:3002/multiply'
curl -i -X POST --url http://localhost:8001/services/multiply/routes --data 'hosts[]=multiply.com'
curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: multiply.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=divide' --data 'url=http://divide:3003/divide'
curl -i -X POST --url http://localhost:8001/services/divide/routes --data 'hosts[]=divide.com'
curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: divide.com'
