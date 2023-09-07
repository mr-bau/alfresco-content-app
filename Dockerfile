# 1. Generate licenses

FROM node:16.13-alpine3.14 AS builder
WORKDIR /usr/src/alfresco
COPY package.json package.json

# 2. Build project
FROM acosix/baseimage:20220603 as appBuilder

# add mrbau ssl interception certificate
COPY ./mrbau-ssl-interception/MFS-SSL-Interception.cer /usr/local/share/ca-certificates/MFS-SSL-Interception.crt
RUN update-ca-certificates

# nodejs 12 is too old
ARG NODE_JS_VERSION=node_14.x

# fix node version (Ubuntu 18.04 default node is too old)
RUN curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
  && echo "deb https://deb.nodesource.com/${NODE_JS_VERSION} $(lsb_release -s -c) main" | tee /etc/apt/sources.list.d/nodejs.list \
  && echo "deb-src https://deb.nodesource.com/${NODE_JS_VERSION} $(lsb_release -s -c) main" | tee -a /etc/apt/sources.list.d/nodejs.list \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN install_clean nodejs \
  && mkdir -p /srv/alfresco-content-app

COPY package.json package-lock.json /srv/alfresco-content-app/
RUN cd /srv/alfresco-content-app \
  && mkdir -p app/.tmp \
  && npm install

COPY app /srv/alfresco-content-app/app
COPY projects /srv/alfresco-content-app/projects
COPY .prettierrc .prettierignore .eslintrc.json alfresco.png angular.json cspell.json extension.schema.json karma.conf.js protractor.conf.js tsconfig.json tsconfig.adf.json /srv/alfresco-content-app/
RUN cd /srv/alfresco-content-app \
  && export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/MFS-SSL-Interception.crt \
  && npm run build:mrbau-extension \
  && npm run build.release

# 3. Generate image

FROM nginxinc/nginx-unprivileged:1.21-alpine

USER root
RUN apk update && apk upgrade
USER 101

ARG PROJECT_NAME=content-ce
ARG PROVIDER="ECM"
ARG AUTH_TYPE="BASIC"

ENV APP_CONFIG_PROVIDER=$PROVIDER
ENV APP_CONFIG_AUTH_TYPE=$AUTH_TYPE

ENV APP_CONFIG_OAUTH2_HOST="{protocol}//{hostname}{:port}/auth/realms/alfresco"
ENV APP_CONFIG_BPM_HOST="{protocol}//{hostname}{:port}"
ENV APP_CONFIG_ECM_HOST="{protocol}//{hostname}{:port}"

ENV APP_CONFIG_OAUTH2_CLIENTID="alfresco"
ENV APP_CONFIG_OAUTH2_IMPLICIT_FLOW=true
ENV APP_CONFIG_OAUTH2_SILENT_LOGIN=true
ENV APP_CONFIG_OAUTH2_REDIRECT_SILENT_IFRAME_URI="{protocol}//{hostname}{:port}/assets/silent-refresh.html"
ENV APP_CONFIG_OAUTH2_REDIRECT_LOGIN="/"
ENV APP_CONFIG_OAUTH2_REDIRECT_LOGOUT="/"
ENV APP_CONFIG_PLUGIN_AOS=true
ENV APP_CONFIG_PLUGIN_FOLDER_RULES=true
ENV APP_CONFIG_PLUGIN_CONTENT_SERVICE=true

COPY docker/default.conf.template /etc/nginx/templates/
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

COPY --from=appBuilder /srv/alfresco-content-app/dist/$PROJECT_NAME /usr/share/nginx/html/
COPY --from=appBuilder /srv/alfresco-content-app/dist/$PROJECT_NAME/app.config.json /etc/nginx/templates/app.config.json.template
COPY --from=appBuilder /srv/alfresco-content-app/dist/$PROJECT_NAME/assets/app.extensions.json /etc/nginx/templates/app.extensions.json.template

USER root
RUN chmod a+w -R /etc/nginx/conf.d
USER 101

ENV BASE_PATH=/
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
