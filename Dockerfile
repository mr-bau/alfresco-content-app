# 1. Generate licenses

FROM node:12-alpine3.14 AS licenseBuilder
WORKDIR /usr/src/alfresco
COPY package.json package.json

RUN mkdir -p ./licenses && \
  yarn licenses list > ./licenses/licenses.txt && \
  yarn licenses generate-disclaimer > ./licenses/disclaimer.txt

# 2. Build project
FROM acosix/baseimage:20220603 as appBuilder

RUN install_clean nodejs npm \
  && mkdir -p /srv/alfresco-content-app

COPY package.json package-lock.json /srv/alfresco-content-app
RUN cd /srv/alfresco-content-app \
  && npm install

COPY app /srv/alfresco-content-app/app
COPY projects /srv/alfresco-content-app/projects
COPY tools /srv/alfresco-content-app/tools
COPY .prettierrc .prettierignore .eslintrc.json alfresco.png angular.json cspell.json extension.schema.json karma.conf.js protractor.conf.js tsconfig.json tslint.json /srv/alfresco-content-app
RUN cd /srv/alfresco-content-app \
  && mkdir -p app/.tmp \
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

COPY docker/default.conf.template /etc/nginx/templates/
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

COPY --from=appBuilder /srv/alfresco-content-app/dist/$PROJECT_NAME /usr/share/nginx/html/
COPY --from=appBuilder /srv/alfresco-content-app/dist/$PROJECT_NAME/app.config.json /etc/nginx/templates/app.config.json.template
COPY --from=appBuilder /srv/alfresco-content-app/dist/$PROJECT_NAME/assets/app.extensions.json /etc/nginx/templates/app.extensions.json.template
COPY --from=licenseBuilder /usr/src/alfresco/licenses /usr/share/nginx/html/

USER root
RUN chmod a+w -R /etc/nginx/conf.d
USER 101

ENV BASE_PATH=/
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
