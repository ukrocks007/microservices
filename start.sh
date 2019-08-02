#!/bin/sh

# Author : Utkarsh Mehta

docker stop kong
docker stop kong-database

docker-compose down

docker system prune
docker-compose up -d $1

sleep 5

./bootstrapKong.sh

sleep 5

./createRoutes.sh