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

	BroadcastRequest 	RequestType = "broadcast"
	PutRequest       	RequestType = "put" 		// deprecated. prints error to console.
	GetRequest       	RequestType = "get"
	SetTurnRequest	 	RequestType = "setturn"
	InitPlayerRequest	RequestType = "initplayer"
	CalcActiveRequest	RequestType = "calcactive"
	BattleStartRequest	RequestType = "startbattle"
	DiceRequest			RequestType = "dice"
	CreateUserRequest	RequestType = "createuser"
)

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte
}

type RequestType 	string
type ResponseType 	string
type NakedMessage 	string

type Request struct {
	Type RequestType     `json:"type"`
	Data json.RawMessage `json:"data"`
}

type PutRequestData struct {
	RoomID  string      `json:"roomID"`
	BlockID string      `json:"blockID"`
	Data    interface{} `json:"data"`
}

const (
	BroadcastResponse 	ResponseType = "broadcast"
	GetResponse       	ResponseType = "get"
	ErrorResponse	  	ResponseType = "error"
	InitPlayerResponse  ResponseType = "initplayer"
)

type Response struct {
	Type ResponseType `json:"type"`
	Data interface{}  `json:"data"`
}

type NakedResponse struct {
	Type ResponseType `json:"type"`
}

type GenericResponse struct {
	Type ResponseType `json:"type"`
	Data string		  `json:"message"`
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
			// we don't try to unmarshel this one to test it.
			BroadcastRequestFunc(message, c)
		case PutRequest:
			var data PutRequestData
			log.Println("put request attempted! refusing!\n\nthe data in question:\n", data)
		case GetRequest:
			var data GetRequestData
			err := json.Unmarshal(req.Data, &data)
			if err != nil {
				log.Println("malformed json from client:", err)
				continue
			}
			GetRequestFunc(data.RoomID, data.BlockID, c)
			//initActivePlayers
		case CreateUserRequest:
			var data CreateUserRequestData
			err := json.Unmarshal(req.Data, &data)
			if err != nil {
				log.Println("malformed json from client:", err)
				continue
			}
			CreateUserFunc(data.RoomID, data.Data, c)
		case InitPlayerRequest:
			InitPlayerFunc(c)
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
