FROM node:12.18-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --silent
COPY . .
RUN npm run build


FROM nginx
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
EXPOSE 80
