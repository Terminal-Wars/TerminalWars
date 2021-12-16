package websocket

import (
	"time"
	"strconv"
	"encoding/json"
	"log"
)

type CreateUserRequestData struct {
	RoomID  string      			`json:"roomID"`
	Data    map[string]interface{} 	`json:"data"`
}

type UserRequestResponseData struct {
	Data 	map[string]interface{} 	`json:"data"`
}

func CreateUserFunc(class CreateUserRequestData, c *Client) {
	var data UserRequestResponseData;
	// "{"playerName": dateCreated}"
	user := class.Data["name"].(string);
	time := strconv.FormatInt(time.Now().Unix(),10)
	jsonContents := map[string]string{user:time}
	convertedJson := make(map[string]interface{}, 1)
	// todo: make this a one liner, since we know there will only ever be one item.
	for k, v := range jsonContents {
		convertedJson[k] = v
	}
	j, _ := json.Marshal(convertedJson)
	_ = json.Unmarshal(j,&data)
	log.Println(convertedJson)
	c.hub.putData(blockKey{class.RoomID, class.RoomID+"_users"}, convertedJson)
	c.hub.putData(blockKey{class.RoomID, class.RoomID+"_users_"+user}, class.Data)
	InitPlayerFunc(c)
}

