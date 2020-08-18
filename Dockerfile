FROM node:12.18.3-alpine3.12

ADD . /app
WORKDIR /app

RUN yarn install \
    && yarn build

RUN rm -rf node_modules \
    && rm -rf lib modules \
    && rm .babelrc tsconfig.json \
    && yarn install --production=true

CMD ["yarn", "serve"]
