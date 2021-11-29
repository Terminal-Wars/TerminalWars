package websocket

import (
	"encoding/json"
	"log"
)

func BroadcastRequestFunc(c *Client, req Request, message []byte) []byte {
	resp := Response{Type: BroadcastResponse, Data: json.RawMessage(message)}
	p, err := json.Marshal(resp)
	if err != nil {
		log.Println("error marshaling json:", err)
	}
	return p
}
