const wsModule = require('ws');

const c = require('../user/createuser.js');
const d = require('../battle/dice.js');
const b = require('./broadcast.js');

let clients = new Map();
let memory = new Map();

console.log("Websocket server started");
const ws_s = new wsModule.Server({port: 2192});

ws_s.on('connection', (ws) => {
	clients.set(ws, Date.now());
	ws.on('message', (raw_message) => {
		let message;
		try {
			message = JSON.parse(raw_message);
		} catch(ex) {
			console.error("Invalid JSON sent: ",ex.message)
		} finally {
			const md = message.data;
			switch(message.type) {
				case "get": 			ws.send(getAsString(md.roomID, md.blockID)); 	break;
				case "debug": 			console.log(memory.get(md.roomID)); 			break;
				case "createuser": 		c.createUser(md); 								break;
				case "dicetest": 		d.sendDice();									break;
				case "broadcast": 		b.broadcast(md);								break;

				case "setturn":
				case "initplayer":
					ws.send(JSON.parse(`{"type": "${message.type}""}`));
					break;
				default:
					console.log("Unimplemented: ",message.type);
					break;
			}
		}
	})
});

const push = async (roomID, blockID, data) => {
	if(memory.get(roomID) == undefined) {
		memory.set(roomID, new Map());
	}
	if(memory.get(roomID).get(blockID) == undefined) {
		memory.get(roomID).set(blockID, new Set());
	}
	memory.get(roomID).get(blockID).add(data);
};

const get = (roomID, blockID) => {
	return memory.get(roomID).get(blockID);
}
const getAsString = (roomID, blockID) => {
	let data = "";
	if(memory.get(roomID).get(blockID) != undefined) {
		map = Array.from(memory.get(roomID).get(blockID));
		map.forEach((value, key) => {
			// Try converting it to an object as if it were a map.
			try {
				data += JSON.stringify(Object.fromEntries(value));
			} catch (ex) {
				switch(ex.name) {
					case "TypeError": // "This object isn't iterable" ok so it's an actual object.
						data += JSON.stringify(value);
						break;
					default:
						console.error(ex);
				}
			}
			if(key < map.length-1) data += ", ";
		})
	}
	return `{"type":"get","data":[${data}]}`;
}

const sendAll = (val) => {
	[...clients.keys()].forEach((client) => {
		client.send(val);
	});
}

exports.push = push;
exports.get = get;
exports.clients = clients;
exports.ws_s = ws_s;
exports.sendAll = sendAll;