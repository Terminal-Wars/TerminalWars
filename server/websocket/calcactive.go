package websocket

import (
	//"fmt"
	//"encoding/json"
	//"time"
)

type CalcActiveRequestData struct {
	RoomID  string	`json:"roomID"`
	Name	string	`json:"name"`
	From	string	`json:"from"`
	To		string	`json:"to"`
	c 		*Client

}

type CalcActiveResponse struct {
	RoomID  	string	`json:"roomID"`
	Name 		string	`json:"name"`
	PrettyName	string	`json:"prettyName"`
	Damage		string	`json:"damage"`
	From		string	`json:"from"`
	To 			string	`json:"to"`
}

func CalcActiveFunc(roomID string, name string, from string, to string, c *Client) {
	// get all the users in the room
	//bd, _ := c.hub.getBlock(roomID, roomID+"_users")
	//var player, active map[string]interface{}
}

	/*
	for(let n in active) {
		let cmd = [];
		let cmd_o = active[n];
		for(let val in cmd_o) {
			// ...replace any placeholder values.
			if(typeof cmd_o[val] == "string") {
				cmd[val] = replacePlaceholders(cmd_o[val], target);
			} else {
				cmd[val] = cmd_o[val];
			}
		}
		switch(cmd[0]) {
			case "roll":
				diceSum = 0;
				foeDiceSum = 0;
				let diceAmount = solve(cmd[1]);
				// amount, max, modifier
				keyboardBuffer.push("rolling "+cmd[1]+"d"+cmd[2]+"+"+solve(cmd[3])+"("+cmd[3]+")\n")
				for(let i = 0; i < diceAmount; i++) {
					await dice(cmd[2],false).then(r => {
						keyboardBuffer.push("dice roll -> "+r["value"]+"\n");
						diceSum += r["value"];
					});
				}
				let mod = solve(cmd[3])+solve(ourPlayer["info"]["diceModAttack"] || 0);
				keyboardBuffer.push("modifer -> "+mod+"\n");
				diceSum += solve(mod);
				// todo: know the opponent so that we can factor in their roll type, amount, etc.
				await dice(20,true).then(r => {foeDiceSum += r["value"]});
				if(diceSum > foeDiceSum) {
					keyboardBuffer.push("success, your dice sum: "+diceSum+", foe's dice sum: "+foeDiceSum+"\n");
					onActivate(cmd[4][0], target, false);
				} else {
					keyboardBuffer.push("failure, your dice sum: "+diceSum+", foe's dice sum: "+foeDiceSum+"\n");
					onActivate(cmd[5][0], target, false);
				}
				break;
			case "attack":
				command("attack",cmd[1],Math.floor(solve(cmd[2])+1),userID);
				break;
			case "bot":
				addUser(userID+"楩"+activePlayers.length, cmd[1]);
				initActivePlayers();
				break;
			case "add":
			case "sub":
				if(cmd[2] != "skip") { // WE'LL DO TEAMS LATER OK
					if(cmd[0] == "sub") cmd[3] *= 1; // if i can reuse code i will, fuck you
					if(cmd[1] == userID) {
						ourPlayer["info"][cmd[2]] += cmd[3];
						await updateOurUser();
					} else {
						// todo: handle modifying other player's values.
					}
				}
				break;
			case undefined:
				console.error(cmd);
				break;
			default:
				console.error("Uncaught or unknown command: "+cmd[0]);
				break;
		}
	}
	// Advance the turn.
	// todo: when passives are added, make this only apply to actives.
	if(advance) {
		broadcast("℡advanceTurn");
		broadcast("℡setOurTurn");
	}
	*/

