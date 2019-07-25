#!/bin/sh

# Author : Utkarsh Mehta

curl -i -X POST --url http://localhost:8001/services/ --data 'name=create' --data 'url=http://create:3000'
curl -i -X POST --url http://localhost:8001/services/create/routes --data 'hosts[]=create.com'
#curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: create.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=read' --data 'url=http://read:3001'
curl -i -X POST --url http://localhost:8001/services/read/routes --data 'hosts[]=read.com'
# curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: read.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=update' --data 'url=http://update:3002'
curl -i -X POST --url http://localhost:8001/services/update/routes --data 'hosts[]=update.com'
#curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: update.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=delete' --data 'url=http://delete:3003'
curl -i -X POST --url http://localhost:8001/services/delete/routes --data 'hosts[]=delete.com'
#curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: delete.com'
