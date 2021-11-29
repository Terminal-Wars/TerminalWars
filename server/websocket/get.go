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
	Data    interface{} `json:"data,omitempty"`
	Created int64       `json:"created,omitempty"`
}

func GetRequestFunc(c *Client, req Request) []byte {
	var data 		GetRequestData
	var resp 		Response
	var p 			[]byte
	var errMessage	string

	err := json.Unmarshal(req.Data, &data)
	if err != nil {
		errMessage = "malformed json from client: "+err.Error()
	}
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
	p, err = json.Marshal(resp)
	if err != nil {
		log.Println("unable to marshal json: ", err)
	}
	if errMessage != "" {
		p, err = json.Marshal(RawResponse{Type: ErrorResponse, Data: errMessage})
		if err != nil {
			log.Println("unable to marshal json: ", err)
		}
	}
	return p
}