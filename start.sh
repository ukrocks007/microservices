#!/bin/sh

# Author : Utkarsh Mehta

docker stop kong
docker stop kong-database

docker system prune

docker-compose down
docker-compose up -d --build

sleep 5

./bootstrapKong.sh

sleep 5

./createRoutes.sh