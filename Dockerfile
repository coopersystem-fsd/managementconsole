FROM nginx

COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html

EXPOSE 80
