FROM mysql:8.0.43-debian

ENV MYSQL_DATABASE=contact

COPY ./init-scripts/ /docker-entrypoint-initdb.d/
