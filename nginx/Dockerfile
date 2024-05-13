# FROM node:18-alpine


FROM nginx:alpine
COPY ./default.conf /etc/nginx/conf.d

RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN ls -la
COPY ./frontend/build /opt/app/build