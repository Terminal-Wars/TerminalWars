package websocket

import (
	"encoding/json"
	"log"
)

type GetRequestData struct {
	RoomID  string `json:"roomID"`
	BlockID string `json:"blockID"`
}

type GetDataResponse struct {
	OK      bool        `json:"ok"`
	RoomID  string      `json:"roomID"`
	BlockID string      `json:"blockID"`
	Data    map[string]interface{} `json:"data,omitempty"`
	Created int64       `json:"created,omitempty"`
}

func GetRequestFunc(roomID string, blockID string, c *Client) {
	var resp 		Response
	var errMessage	string

	if blockID != "" {
		bd, ok := c.hub.getBlock(roomID, blockID)
		resp = Response{Type: GetResponse, Data: GetDataResponse{
			OK:      ok,
			RoomID:  roomID,
			BlockID: blockID,
			Data:    bd.Data,
			Created: bd.Created,
		}}
	} else {
		d := c.hub.getRoom(roomID)
		resp = Response{Type: GetResponse, Data: GetDataResponse{
			OK:     true,
			RoomID: roomID,
			Data:   d,
		}}
	}
	p, err := json.Marshal(resp)
	if err != nil {
		log.Println("unable to marshal json: ", err)
	}
	if errMessage != "" {
		p, err = json.Marshal(GenericResponse{Type: ErrorResponse, Data: errMessage})
		if err != nil {
			log.Println("unable to marshal json: ", err)
		}
	}
	go func() {
	    c.send <- p
	}()
}