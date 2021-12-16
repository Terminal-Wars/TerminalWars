package websocket

import (
	"encoding/json"
	"fmt"
)

type GetDataResponse struct {
	OK      bool        `json:"ok"`
	RoomID  string      `json:"roomID"`
	BlockID string      `json:"blockID"`
	Data    interface{} `json:"data,omitempty"`
	Created int64       `json:"created,omitempty"`
}

func GetRequestFunc(class GetRequestData, c *Client) {
	var resp 		Response
	var errMessage	string
	fmt.Println(class);
	if class.BlockID != "debug" {
		bd, ok := c.hub.getBlock(class.RoomID, class.BlockID)
		resp = Response{Type: GetResponse, Data: GetDataResponse{
			OK:      ok,
			RoomID:  class.RoomID,
			BlockID: class.BlockID,
			Data:    bd.Data,
			Created: bd.Created,
		}}
	} else {
		d := c.hub.getRoom(class.RoomID)
		fmt.Println(d);
	}
	p, err := json.Marshal(resp)
	if err != nil {
		fmt.Println("unable to marshal json: ", err)
	}
	if errMessage != "" {
		p, err = json.Marshal(GenericResponse{Type: ErrorResponse, Data: errMessage})
		if err != nil {
			fmt.Println("unable to marshal json: ", err)
		}
	}
	go func() {
	    c.send <- p
	}()
}