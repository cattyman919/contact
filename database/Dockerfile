FROM mysql:8.0.43-debian

ENV MYSQL_DATABASE=contact
ENV MYSQL_USER=admin
ENV MYSQL_PASSWORD=admin

COPY ./init-scripts/ /docker-entrypoint-initdb.d/
