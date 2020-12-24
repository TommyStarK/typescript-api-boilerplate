#!/bin/bash
BUILD_NUMBER="${BUILD_NUMBER:-0}"

docker-compose -f tests/compose-test.yml --project-name boilerplate_${BUILD_NUMBER} up --detach --build --force-recreate;

docker build . -t typescript_api_boilerplate_test_job_${BUILD_NUMBER};

docker run -ti --rm --network=boilerplate_${BUILD_NUMBER}_default -v `pwd`:/home -e MONGO_URI=mongodb -e MYSQL_URL=mysql \
typescript_api_boilerplate_test_job_${BUILD_NUMBER} bash -c './scripts/wait_for_it.sh mysql:3306 -- yarn test; exit $?;';

rc=$?;

docker-compose -f tests/compose-test.yml --project-name boilerplate_${BUILD_NUMBER} down;
docker rmi typescript_api_boilerplate_test_job_${BUILD_NUMBER};
docker volume prune -f;

exit $rc;
