# --------------------------------------------------------------
# STAGE 1: BUILDER
# Generates the compiled static assets.
# --------------------------------------------------------------
FROM node:22.14.0-alpine AS builder

# Setting the working directory
WORKDIR /usr/src/alfresco

# 1. Preparation and Dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json

# 2. Adding SSL Interception Certificate
COPY cert/MFS-SSL-Interception.cer /usr/local/share/ca-certificates/MFS-SSL-Interception.crt
RUN mkdir -p /etc/ssl \
    && cat /usr/local/share/ca-certificates/MFS-SSL-Interception.crt > /etc/ssl/cert.pem \
    && apk add --no-cache ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/cache/apk/*

# 3. Install packages
RUN mkdir -p app/.tmp \
    && export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/MFS-SSL-Interception.crt \
    && npm install

# 4. Copy source code
COPY app app
COPY projects projects
COPY .browserslistrc .prettierrc .prettierignore .lintstagedrc.json .eslintrc.json .stylelintrc.json .eslintignore alfresco.png cspell.json extension.schema.json karma.conf.js project.json nx.json tsconfig*.json /usr/src/alfresco/

# 5. Building the project. The assets land in /usr/src/alfresco/dist/$PROJECT_NAME
ARG PROJECT_NAME=content-ce
RUN npm run build.release

# --------------------------------------------------------------
# STAGE 2: Create Docker Image
# Creates the executable image with Nginx.
# --------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.21-alpine

# Arguments and environment variables for configuring the Alfresco App (used by Nginx)
ARG PROJECT_NAME=content-ce

# 1. APK Update
USER root
COPY cert/MFS-SSL-Interception.cer /usr/local/share/ca-certificates/MFS-SSL-Interception.crt
RUN mkdir -p /etc/ssl \
    && cat /usr/local/share/ca-certificates/MFS-SSL-Interception.crt > /etc/ssl/cert.pem \
    && apk add --no-cache ca-certificates \
    && update-ca-certificates \
    && apk update \
    && apk upgrade \
    && rm -rf /var/cache/apk/*
USER 101

# 2. Copy Nginx configuration templates
COPY docker/default.conf.template /etc/nginx/templates/
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

# 3. Copy compiled assets from the BUILDER stage
COPY --from=builder /usr/src/alfresco/dist/$PROJECT_NAME /usr/share/nginx/html/
COPY --from=builder /usr/src/alfresco/dist/$PROJECT_NAME/app.config.json /etc/nginx/templates/app.config.json.template
COPY --from=builder /usr/src/alfresco/dist/$PROJECT_NAME/assets/app.extensions.json /etc/nginx/templates/app.extensions.json.template

# 4. Ensure the Nginx user has write permissions
USER root
RUN chmod a+w -R /etc/nginx/conf.d
USER 101

# 5. Set Environment variables
ENV BASE_URL="{protocol}//{hostname}{:port}"
ENV BASE_PATH=/
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
