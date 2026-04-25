package model

import (
	"encoding/json"
	"time"
)

type UserData struct {
	UserID          string          `db:"user_id" json:"userId"`
	DashboardLayout json.RawMessage `db:"dashboard_layout" json:"layout"`
	WidgetData      json.RawMessage `db:"widget_data" json:"widgetData"`
	UpdatedAt       time.Time       `db:"updated_at" json:"updatedAt"`
}

type SyncRequest struct {
	Layout     json.RawMessage `json:"layout"`
	WidgetData json.RawMessage `json:"widgetData"`
}

type SyncResponse struct {
	Layout     json.RawMessage `json:"layout"`
	WidgetData json.RawMessage `json:"widgetData"`
}
