package websocket

import (
	"encoding/json"
	"log"
)

func BroadcastRequestFunc(message []byte, c *Client) {
	resp := Response{Type: BroadcastResponse, Data: json.RawMessage(message)}
	p, err := json.Marshal(resp)
	if err != nil {
		log.Println("error marshaling json:", err)
	}
	c.hub.broadcast <- p
}
