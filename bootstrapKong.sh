#!/bin/sh

# Author : Utkarsh Mehta

docker run -d --name kong-database --network=microservices_kong-net -p 5433:5432 -e "POSTGRES_USER=kong" -e "POSTGRES_DB=kong" postgres:9.6

sleep 10

docker run --rm --network=microservices_kong-net -e "KONG_DATABASE=postgres" -e "KONG_PG_HOST=kong-database" -e "KONG_CASSANDRA_CONTACT_POINTS=kong-database" kong:latest kong migrations bootstrap

sleep 5

docker run -d --name kong --network=microservices_kong-net -e "KONG_DATABASE=postgres" -e "KONG_PG_HOST=kong-database" -e "KONG_CASSANDRA_CONTACT_POINTS=kong-database" -e "KONG_PROXY_ACCESS_LOG=/dev/stdout" -e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" -e "KONG_PROXY_ERROR_LOG=/dev/stderr" -e "KONG_ADMIN_ERROR_LOG=/dev/stderr" -e "KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl" -p 8000:8000 -p 8443:8443 -p 8001:8001 -p 8444:8444 kong:latest

sleep 10