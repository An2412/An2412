package middleware

import (
	"net/http"
	"sync"
	"time"
)

type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

type visitor struct {
	count    int
	resetAt  time.Time
}

func RateLimit(requestsPerMinute int) func(http.Handler) http.Handler {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    requestsPerMinute,
		window:   time.Minute,
	}

	go func() {
		for {
			time.Sleep(time.Minute)
			rl.mu.Lock()
			now := time.Now()
			for ip, v := range rl.visitors {
				if now.After(v.resetAt) {
					delete(rl.visitors, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
				ip = xff
			}

			rl.mu.Lock()
			v, exists := rl.visitors[ip]
			now := time.Now()
			if !exists || now.After(v.resetAt) {
				rl.visitors[ip] = &visitor{count: 1, resetAt: now.Add(rl.window)}
				rl.mu.Unlock()
				next.ServeHTTP(w, r)
				return
			}
			v.count++
			if v.count > rl.limit {
				rl.mu.Unlock()
				http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
				return
			}
			rl.mu.Unlock()
			next.ServeHTTP(w, r)
		})
	}
}
