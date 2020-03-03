#!/bin/bash
docker-compose -f test/compose-test.yml --project-name boilerplate up --detach --build --force-recreate;

docker build . -t ava:latest;

docker run -ti --rm --network=boilerplate_default -e MONGO_URI=mongodb -e MYSQL_URL=mysql \
-p 3001:3001 -p 8443:8443 ava:latest bash -c './scripts/wait_for_it.sh mysql:3306 -- yarn startAva; exit $?';

rc=$?;

docker stop mongodb mysql;

docker rm mongodb mysql;

docker rmi ava:latest;

exit $rc;
