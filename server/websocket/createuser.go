package websocket

import "fmt"

type CreateUserRequestData struct {
	RoomID  string      			`json:"roomID"`
	Data    []interface{} 	`json:"data"`
}

func CreateUserFunc(class CreateUserRequestData, c *Client) {
	fmt.Println(class.Data);
	c.hub.putData(blockKey{class.RoomID, class.RoomID+"_users"}, class.Data)
	InitPlayerFunc(c)
}

