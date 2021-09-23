package websocket

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	mu                sync.Mutex
	data              map[blockID]blockData
	expirationPending map[string]struct{} // room ID
}

type blockID struct {
	roomID, blockID string
}

type blockData struct {
	Data    json.RawMessage
	Created int64
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) putData(id blockID, data json.RawMessage) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.data[id] = blockData{data, time.Now().UnixMilli()}
	if _, ok := h.expirationPending[id.roomID]; !ok {
		h.expirationPending[id.roomID] = struct{}{}
		go func() {
			time.Sleep(2 * time.Hour)
			h.mu.Lock()
			defer h.mu.Unlock()
			for i := range h.data {
				if i.roomID == id.roomID {
					delete(h.data, i)
				}
			}
			delete(h.expirationPending, id.roomID)
		}()
	}
}

func (h *Hub) getData(id blockID) (blockData, bool) {
	h.mu.Lock()
	defer h.mu.Unlock()
	bd, ok := h.data[id]
	return bd, ok
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (hub *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
