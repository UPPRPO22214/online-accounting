package main

import (
	"log"

	"microservices/auth/internal/config"
	"microservices/auth/internal/database"
)

func main() {
	cfg := config.Load()

	db, err := database.New(cfg)
	if err != nil {
		log.Fatalf("database creation error: %v", err)
	}
	defer db.Close()

	if err = db.HealthCheck(); err != nil {
		log.Fatalf("couldn't open connection with the database: %v", err)
	}

	// TODO: Repo connect with MySQL

	// TODO: Service for auth users

	// TODO: Transport, proto files for gRPC

	// TODO: graceful shutdown
}
