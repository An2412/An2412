package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/An2412/super-private-dashboard/backend/internal/middleware"
	"github.com/An2412/super-private-dashboard/backend/internal/model"
	"github.com/An2412/super-private-dashboard/backend/internal/repository"
	"github.com/An2412/super-private-dashboard/backend/internal/service"
)

type SyncHandler struct {
	dataRepo *repository.DataRepo
	hub      *service.Hub
}

func NewSyncHandler(dataRepo *repository.DataRepo, hub *service.Hub) *SyncHandler {
	return &SyncHandler{dataRepo: dataRepo, hub: hub}
}

func (h *SyncHandler) GetSync(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	data, err := h.dataRepo.GetSync(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) || data == nil {
			writeJSON(w, http.StatusOK, model.SyncResponse{
				Layout:     json.RawMessage("[]"),
				WidgetData: json.RawMessage("{}"),
			})
			return
		}
		log.Printf("get sync error: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusOK, model.SyncResponse{
		Layout:     data.DashboardLayout,
		WidgetData: data.WidgetData,
	})
}

func (h *SyncHandler) PostSync(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 10*1024*1024) // 10MB limit

	var req model.SyncRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body or exceeds 10MB"})
		return
	}

	if req.Layout == nil {
		req.Layout = json.RawMessage("[]")
	}
	if req.WidgetData == nil {
		req.WidgetData = json.RawMessage("{}")
	}

	if err := h.dataRepo.SaveSync(userID, req.Layout, req.WidgetData); err != nil {
		log.Printf("save sync error: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	// Broadcast to other connected clients of this user
	h.hub.BroadcastToUser(userID, model.SyncResponse{
		Layout:     req.Layout,
		WidgetData: req.WidgetData,
	})

	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
