package repository

import (
	"fmt"

	"github.com/An2412/super-private-dashboard/backend/internal/model"
	"github.com/jmoiron/sqlx"
)

type UserRepo struct {
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) CreateUser(email, passwordHash string) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRowx(
		`INSERT INTO users (email, password_hash) VALUES ($1, $2)
		 RETURNING id, email, password_hash, created_at`,
		email, passwordHash,
	).StructScan(user)
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	return user, nil
}

func (r *UserRepo) GetUserByEmail(email string) (*model.User, error) {
	user := &model.User{}
	err := r.db.Get(user, `SELECT id, email, password_hash, created_at FROM users WHERE email = $1`, email)
	if err != nil {
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return user, nil
}

func (r *UserRepo) DeleteUser(userID string) error {
	_, err := r.db.Exec(`DELETE FROM users WHERE id = $1`, userID)
	if err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	return nil
}
