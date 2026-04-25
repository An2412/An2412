package handler

import (
	"log"
	"net/http"

	"github.com/An2412/super-private-dashboard/backend/internal/middleware"
	"github.com/An2412/super-private-dashboard/backend/internal/repository"
)

type UserHandler struct {
	userRepo *repository.UserRepo
}

func NewUserHandler(userRepo *repository.UserRepo) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	if err := h.userRepo.DeleteUser(userID); err != nil {
		log.Printf("delete user error: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
