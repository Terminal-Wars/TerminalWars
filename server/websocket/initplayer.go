package websocket

import (
	"encoding/json"
	"log"
)

func InitPlayerFunc(c *Client) {
	resp := NakedResponse{Type: InitPlayerResponse}
	p, err := json.Marshal(resp)
	if err != nil {
		log.Println("unable to marshal json: ", err)
	}
	go func() {
	    c.send <- p
	}()
}