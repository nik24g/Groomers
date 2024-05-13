FROM nginx:alpine
COPY ./default.conf /etc/nginx/conf.d

FROM node:18-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN ls -la
COPY frontend/public ./public
COPY frontend/src ./src
COPY frontend/package.json ./
RUN npm i
RUN ls -la
RUN npm run build