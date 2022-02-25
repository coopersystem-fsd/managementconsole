FROM node:12.18-alpine as node
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --silent
COPY . .
RUN npm run build


FROM nginx
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf
COPY --from=node /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
