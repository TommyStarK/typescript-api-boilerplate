#!/bin/bash

BUILD_NUMBER="${BUILD_NUMBER:-0}"
PROJECT_NAME=typescript_api_boilerplate_test_${BUILD_NUMBER}

cleanEnvironment() {
    docker rm -f ${PROJECT_NAME}
    docker-compose -f hack/ci.yml --project-name ${PROJECT_NAME} down --volumes
    docker rmi -f ${PROJECT_NAME}
}

docker build . -t ${PROJECT_NAME}
[ $? -ne 0 ] && exit 1

docker-compose -f hack/ci.yml --project-name ${PROJECT_NAME} up --detach

docker run -ti --name ${PROJECT_NAME} --network=${PROJECT_NAME}_default \
    -e MONGO_URI=mongodb \
    -e MYSQL_URL=mysql \
    ${PROJECT_NAME} \
    bash -c './hack/wait_for_it.sh --timeout=30 --host=mysql --port=3306 --strict -- ./hack/wait_for_it.sh --timeout=30 --host=mongodb --port=27017 --strict -- yarn test'

rc=$?

docker cp -a ${PROJECT_NAME}:/home/coverage .
[ $? -ne 0 ] && cleanEnvironment && exit 1

cleanEnvironment
exit $rc
