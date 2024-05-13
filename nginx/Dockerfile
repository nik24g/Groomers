FROM nginx:alpine
COPY ./default.conf /etc/nginx/conf.d

FROM node:18-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN ls -la
COPY ../frontend ./frontend
RUN npm i
RUN ls -la
RUN npm run build