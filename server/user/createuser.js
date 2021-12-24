const server = require('../core/ws.js');

const createUser = (data) => {
	let user = data.data.name;
	let time = Date.now();
	let roomID = data.roomID;
	let jsonContents = new Map();
	jsonContents.set(user, time);
	server.push(roomID, roomID+"_users", jsonContents);
	//todo: verification that this is a real user.
	server.push(roomID, roomID+"_users_"+user, data);
	initPlayerString = `{"type": "initplayer"}`;
	server.sendAll(initPlayerString);
}

exports.createUser = createUser;