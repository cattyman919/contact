.DEFAULT_GOAL := help

COMPOSE_FILE = docker-compose.yml
SERVICE_NAME = contact-db-service

.PHONY: help up down logs mysql clean_restart

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  up        Builds, creates, and starts the database container in the background."
	@echo "  down      Stops and removes the database container and network."
	@echo "  logs      Follows the logs of the database service."
	@echo "  mysql     Connects to the MySQL database using the mysql client."
	@echo "  stop      Stops the database container without removing it."
	@echo "  start     Starts the existing, stopped database container."

up:
	@echo "Starting up database container..."
	docker compose -f $(COMPOSE_FILE) up -d --force-recreate

down:
	@echo "Stopping and removing database container and volume..."
	docker compose -f $(COMPOSE_FILE) down -v

clean_restart:
	$(MAKE) down
	$(MAKE) up

logs:
	@echo "Following database logs..."
	docker compose -f $(COMPOSE_FILE) logs -f $(SERVICE_NAME)

mysql:
	@echo "Connecting to the database..."
	docker compose -f $(COMPOSE_FILE) exec $(SERVICE_NAME) mysql -uuser -ppassword -D contactpdb

stop:
	@echo "Stopping database container..."
	docker compose -f $(COMPOSE_FILE) stop

start:
	@echo "Starting database container..."
	docker compose -f $(COMPOSE_FILE) start
