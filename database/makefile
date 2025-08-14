.PHONY: all

all:
	docker build -t contact-db .
	docker run --name contact-db-container -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d contact-db
