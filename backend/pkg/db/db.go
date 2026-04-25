package db

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func Connect(databaseURL string) (*sqlx.DB, error) {
	db, err := sqlx.Connect("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	log.Println("Connected to PostgreSQL")
	return db, nil
}

func Migrate(db *sqlx.DB) error {
	schema := `
	CREATE EXTENSION IF NOT EXISTS "pgcrypto";

	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS user_data (
		user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
		dashboard_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
		widget_data JSONB NOT NULL DEFAULT '{}'::jsonb,
		updated_at TIMESTAMP DEFAULT NOW()
	);
	`
	_, err := db.Exec(schema)
	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}
	log.Println("Database migration completed")
	return nil
}
