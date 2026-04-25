package repository

import (
	"encoding/json"
	"fmt"

	"github.com/An2412/super-private-dashboard/backend/internal/model"
	"github.com/jmoiron/sqlx"
)

type DataRepo struct {
	db *sqlx.DB
}

func NewDataRepo(db *sqlx.DB) *DataRepo {
	return &DataRepo{db: db}
}

func (r *DataRepo) GetSync(userID string) (*model.UserData, error) {
	data := &model.UserData{}
	err := r.db.Get(data,
		`SELECT user_id, dashboard_layout, widget_data, updated_at
		 FROM user_data WHERE user_id = $1`, userID)
	if err != nil {
		return nil, fmt.Errorf("get sync: %w", err)
	}
	return data, nil
}

func (r *DataRepo) SaveSync(userID string, layout, widgetData json.RawMessage) error {
	_, err := r.db.Exec(
		`INSERT INTO user_data (user_id, dashboard_layout, widget_data, updated_at)
		 VALUES ($1, $2, $3, NOW())
		 ON CONFLICT (user_id)
		 DO UPDATE SET dashboard_layout = $2, widget_data = $3, updated_at = NOW()`,
		userID, layout, widgetData)
	if err != nil {
		return fmt.Errorf("save sync: %w", err)
	}
	return nil
}

func (r *DataRepo) DeleteSync(userID string) error {
	_, err := r.db.Exec(`DELETE FROM user_data WHERE user_id = $1`, userID)
	if err != nil {
		return fmt.Errorf("delete sync: %w", err)
	}
	return nil
}
