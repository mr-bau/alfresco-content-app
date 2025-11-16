# 1. Generate licenses

FROM node:22.14.0-alpine AS builder
WORKDIR /usr/src/alfresco
COPY package.json package.json

# 2. Build project
COPY package-lock.json package-lock.json
RUN mkdir -p app/.tmp \
  && npm install

COPY app app
COPY projects projects
COPY .prettierrc .prettierignore .eslintrc.json alfresco.png cspell.json extension.schema.json karma.conf.js tsconfig*.json /usr/src/alfresco/
RUN npm run build:mrbau-extension \
  && npm run build.release

# 2. Generate image

FROM nginxinc/nginx-unprivileged:1.21-alpine

USER root
RUN apk update && apk upgrade
USER 101

COPY docker/default.conf.template /etc/nginx/templates/
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

COPY --from=builder dist/content-ce /usr/share/nginx/html/
COPY --from=builder dist/content-ce/app.config.json /etc/nginx/templates/app.config.json.template
COPY --from=builder dist/content-ce/assets/app.extensions.json /etc/nginx/templates/app.extensions.json.template

USER root
RUN chmod a+w -R /etc/nginx/conf.d
USER 101

ENV BASE_PATH=/
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
