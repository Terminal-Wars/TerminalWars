let ws = require('../core/ws.js');

const sendDice = (roomID, max=20, num=1, mod=0, foe=false) => {
	diceRolls = [];
	for(let n = 0; n < num; n++) {
		diceNum = Math.round((Math.random()*max)-Math.random());
		diceString = `{"type": "dice", "data": {"value": ${diceNum}, "foe": ${foe}, "roomID": "${roomID}"}}`;
		ws.sendAll(diceString);
		diceNum += mod;
		diceRolls[n] = diceNum;
	}
	return diceRolls;
}

exports.sendDice = sendDice;