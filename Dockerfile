FROM node:alpine
COPY . /home
WORKDIR /home
RUN apk add bash
RUN yarn install && \
    yarn build && \
    chmod +x /home/wait_for_it.sh
EXPOSE 3001
EXPOSE 8443
