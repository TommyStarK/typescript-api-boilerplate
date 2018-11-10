FROM node:latest
RUN curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
COPY . /home
WORKDIR /home
RUN yarn install && \
    yarn build && \
    chmod +x /home/wait_for_it.sh
EXPOSE 3001 
