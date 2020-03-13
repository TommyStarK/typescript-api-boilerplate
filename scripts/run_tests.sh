#!/bin/bash
if [[ -z "${BUILD_NUMBER}" ]]; then
    BUILD_NUMBER=0
fi

docker-compose -f test/compose-test.yml --project-name boilerplate_${BUILD_NUMBER} up --detach --build --force-recreate;

docker build . -t rest_api_boilerplate_test_with_ava_job_${BUILD_NUMBER};

docker run -ti --rm --network=boilerplate_${BUILD_NUMBER}_default -v `pwd`:/home -e MONGO_URI=mongodb -e MYSQL_URL=mysql \
rest_api_boilerplate_test_with_ava_job_${BUILD_NUMBER} bash -c './scripts/wait_for_it.sh mysql:3306 -- yarn startAva; exit $?;';

rc=$?;

docker-compose -f test/compose-test.yml --project-name boilerplate_${BUILD_NUMBER} down;
docker rmi rest_api_boilerplate_test_with_ava_job_${BUILD_NUMBER};
docker volume prune -f;

exit $rc;
