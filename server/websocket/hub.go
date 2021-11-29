package websocket

import (
	"log"
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

	mu     sync.Mutex
	data   map[blockKey]blockData
	expiry map[string]struct{} // room ID
}

type blockKey struct {
	roomID, blockID string
}

type blockData struct {
	Data    interface{}
	Created int64
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		data:       make(map[blockKey]blockData),
		expiry:     make(map[string]struct{}),
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

func (h *Hub) putData(id blockKey, newdata interface{}) {
	h.mu.Lock()
	defer h.mu.Unlock()
	_, ok := h.data[id]
	if ok {
		switch newdata := newdata.(type) {
		case map[string]interface{}:
			for k, v := range newdata {
				h.data[id].Data.(map[string]interface{})[k] = v
			}
		case []interface{}:
			d := h.data[id]
			data := d.Data.([]interface{})
		Outer:
			for _, entry := range newdata {
				ent := entry.(map[string]interface{})
				name := ent["name"].(string)
				for i, oldent := range data {
					if oldent.(map[string]interface{})["name"].(string) == name {
						data[i] = ent
						continue Outer
					}
				}
				data = append(data, ent)
			}
			d.Data = data
			h.data[id] = d
		default:
			log.Println("(something other then a map or an array was sent)")
			return
		}
	} else {
		h.data[id] = blockData{newdata, time.Now().UnixMilli()}
	}
	if _, ok := h.expiry[id.roomID]; !ok {
		h.expiry[id.roomID] = struct{}{}
		go func() {
			time.Sleep(2 * time.Hour)
			h.mu.Lock()
			defer h.mu.Unlock()
			for i := range h.data {
				if i.roomID == id.roomID {
					delete(h.data, i)
				}
			}
			delete(h.expiry, id.roomID)
		}()
	}
}

func (h *Hub) getRoom(roomID string) map[string]blockData {
	h.mu.Lock()
	defer h.mu.Unlock()
	n := 0
	data := make(map[string]blockData, n)
	for key, block := range h.data {
		if key.roomID == roomID {
			data[key.blockID] = block
		}
	}
	return data
}

func (h *Hub) getBlock(roomID, blockID string) (blockData, bool) {
	h.mu.Lock()
	defer h.mu.Unlock()
	bd, ok := h.data[blockKey{roomID, blockID}]
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
