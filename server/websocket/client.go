package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte
}

type RequestType string

const (
	BroadcastRequest RequestType = "broadcast"
	PutRequest       RequestType = "put"
	GetRequest       RequestType = "get"
)

type Request struct {
	Type RequestType     `json:"type"`
	Data json.RawMessage `json:"data"`
}

type PutRequestData struct {
	RoomID  string      `json:"roomID"`
	BlockID string      `json:"blockID"`
	Data    interface{} `json:"data"`
}
type GetRequestData struct {
	RoomID  string `json:"roomID"`
	BlockID string `json:"blockID"`
}

type ResponseType string

const (
	BroadcastResponse ResponseType = "broadcast"
	GetResponse       ResponseType = "get"
)

type Response struct {
	Type ResponseType `json:"type"`
	Data interface{}  `json:"data"`
}

type GetDataResponse struct {
	OK      bool        `json:"ok"`
	RoomID  string      `json:"roomID"`
	BlockID string      `json:"blockID"`
	Data    interface{} `json:"data,omitempty"`
	Created int64       `json:"created,omitempty"`
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("unexpected close error from client:", err)
			}
			break
		}
		var req Request
		err = json.Unmarshal(message, &req)
		if err != nil {
			log.Println("malformed json from client:", err)
		}
		switch req.Type {
		case BroadcastRequest:
			resp := Response{Type: BroadcastResponse, Data: json.RawMessage(message)}
			p, err := json.Marshal(resp)
			if err != nil {
				log.Println("error marshaling json:", err)
				continue
			}
			c.hub.broadcast <- p
		case PutRequest:
			var data PutRequestData
			err := json.Unmarshal(req.Data, &data)
			if err != nil {
				log.Println("malformed json from client:", err)
				continue
			}
			c.hub.putData(blockKey{data.RoomID, data.BlockID}, data.Data)
		case GetRequest:
			var data GetRequestData
			err := json.Unmarshal(req.Data, &data)
			if err != nil {
				log.Println("malformed json from client:", err)
				continue
			}
			var resp Response

			if data.BlockID != "" {
				bd, ok := c.hub.getBlock(data.RoomID, data.BlockID)
				resp = Response{Type: GetResponse, Data: GetDataResponse{
					OK:      ok,
					RoomID:  data.RoomID,
					BlockID: data.BlockID,
					Data:    bd.Data,
					Created: bd.Created,
				}}
			} else {
				d := c.hub.getRoom(data.RoomID)
				resp = Response{Type: GetResponse, Data: GetDataResponse{
					OK:     true,
					RoomID: data.RoomID,
					Data:   d,
				}}
			}
			p, err := json.Marshal(resp)
			if err != nil {
				log.Println("error marshaling json:", err)
				continue
			}
			go func() {
				c.send <- p
			}()
		default:
			log.Println("request with invalid type")
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			err := c.conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Println("error writing message to client:", err)
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Println("error pinging client:", err)
				return
			}
		}
	}
}
