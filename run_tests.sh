#!/bin/bash
docker-compose -f compose-test.yml up --detach --build --force-recreate
docker exec -ti ava bash -c "yarn startAva; exit"
docker stop ava mongodb mysql cache
docker rm ava mongodb mysql cache
docker rmi rest-api-node-boilerplate_ava