#!/bin/sh

# Author : Utkarsh Mehta

curl -i -X POST --url http://localhost:8001/services/ --data 'name=plus' --data 'url=http://plus:3000/plus'
curl -i -X POST --url http://localhost:8001/services/plus/routes --data 'hosts[]=plus.com'
curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: plus.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=minus' --data 'url=http://minus:3001/minus'
curl -i -X POST --url http://localhost:8001/services/minus/routes --data 'hosts[]=minus.com'
curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: minus.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=multiply' --data 'url=http://multiply:3002/multiply'
curl -i -X POST --url http://localhost:8001/services/multiply/routes --data 'hosts[]=multiply.com'
curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: multiply.com'

curl -i -X POST --url http://localhost:8001/services/ --data 'name=divide' --data 'url=http://divide:3003/divide'
curl -i -X POST --url http://localhost:8001/services/divide/routes --data 'hosts[]=divide.com'
curl -i -X GET --url 'http://localhost:8000?a=20&b=10' --header 'Host: divide.com'
