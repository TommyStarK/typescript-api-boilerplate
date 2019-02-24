#!/bin/bash
docker-compose -f compose-test.yml up --detach --build --force-recreate
docker build . -t ava:latest
docker run -ti --rm --network=rest-api-node-boilerplate_boilerplate -e REDIS_URL=cache -e MONGO_URI=mongodb -e MYSQL_URL=mysql \
-p 3001:3001 -p 8443:8443 ava:latest bash -c "./wait_for_it.sh mysql:3306 -- yarn startAva; exit"
docker stop mongodb mysql cache
docker rm mongodb mysql cache
docker rmi ava:latest