package websocket

type CreateUserRequestData struct {
	RoomID  string      			`json:"roomID"`
	Data    map[string]interface{} 	`json:"data"`
}

func CreateUserFunc(class CreateUserRequestData, c *Client) {
	c.hub.putData(blockKey{class.RoomID, class.RoomID+"_users_"+class.Data["name"].(string)}, class.Data)
	InitPlayerFunc(c)
}

