FROM node:16-alpine
COPY . /home
WORKDIR /home
RUN apk add bash && \
    yarn install && \
    yarn build && \
    chmod +x /home/hack/wait_for_it.sh
EXPOSE 3001
EXPOSE 8443
