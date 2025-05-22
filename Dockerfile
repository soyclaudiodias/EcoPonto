FROM nginx:latest

COPY templates/Inicio.html /usr/share/nginx/html/index.html

CMD ["nginx", "-g", "daemon off;"]
