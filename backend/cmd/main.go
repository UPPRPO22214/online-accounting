package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "microservices/accounter/docs"
	"microservices/accounter/internal/api"
	"microservices/accounter/internal/config"
	"microservices/accounter/internal/database"
	"microservices/accounter/internal/repository"
	"microservices/accounter/internal/tokens"
	"microservices/accounter/internal/usecases"
	"microservices/accounter/pkg/logger"
)

// @title Accounter API
// @version 1.0
// @description API для управления личными финансами

// @host localhost:8080
// @BasePath /
func main() {
	logger.Info().Msg("Initialize app dependencies...")

	cfg, err := config.Load()
	if err != nil {
		logger.Fatal().Err(err).Send()
	}

	logger.Set(cfg.Logger)

	// Context для graceful shutdown
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	// Database
	db, err := database.New(cfg.Database)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed database initialization")
	}
	defer db.Close()

	if err = db.HealthCheck(ctx); err != nil {
		logger.Fatal().Err(err).Msg("failed to open connection to database")
	}

	// Dependencies
	repo := repository.New(db.DB())
	jwtManager := tokens.NewJWTManager(cfg.JWT)
	services := usecases.New(repo, jwtManager)

	// HTTP Server
	router := api.SetupRouter(services, jwtManager)

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Запуск сервера в горутине
	go func() {
		logger.Info().Msg("Starting HTTP server...")
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Fatal().Err(err).Msg("failed to start server")
		}
	}()

	logger.Info().Msg("Server started successfully. Press Ctrl+C to stop...")

	// Ожидание сигнала завершения
	<-ctx.Done()

	logger.Info().Msg("Received signal. Starting graceful shutdown...")

	// Graceful shutdown с таймаутом
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	// Останавливаем HTTP сервер
	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error().Err(err).Msg("server forced to shutdown")
	} else {
		logger.Info().Msg("HTTP server stopped gracefully")
	}

	// База данных закроется через defer db.Close()
	logger.Info().Msg("Server stopped gracefully")
}