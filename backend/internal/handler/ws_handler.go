package handler

import (
	"net/http"

	"github.com/An2412/super-private-dashboard/backend/internal/auth"
	"github.com/An2412/super-private-dashboard/backend/internal/service"
)

type WSHandler struct {
	hub        *service.Hub
	jwtManager *auth.JWTManager
}

func NewWSHandler(hub *service.Hub, jwtManager *auth.JWTManager) *WSHandler {
	return &WSHandler{hub: hub, jwtManager: jwtManager}
}

func (h *WSHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	h.hub.HandleWebSocket(h.jwtManager)(w, r)
}
