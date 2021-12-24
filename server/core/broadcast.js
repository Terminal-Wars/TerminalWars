let ws = require('../core/ws.js');

const broadcast = async (data) => {
	broadcastString = `{"type": "broadcast", 
		"data": {
			"userID": "${data["userID"]}", 
			"roomID": "${data["roomID"]}", 
			"text": "${data["text"]}\\n",
			"blank": ${data["blank"]}
		}
	}`;
	ws.sendAll(broadcastString);
}

module.exports.broadcast = broadcast;