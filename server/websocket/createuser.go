package websocket

type CreateUserRequestData struct {
	RoomID  string      `json:"roomID"`
	Data    interface{} `json:"data"`
}

func CreateUserFunc(roomID string, userData interface{}, c *Client) {
	c.hub.putData(blockKey{roomID, roomID+"_users"}, userData)
	InitPlayerFunc(c)
}

