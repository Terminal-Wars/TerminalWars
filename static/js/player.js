import {dice} from './commonObjects.js';
import {keyboardBuffer} from './keyboard.js';
export let diceSum = 0; export let foeDiceSum = 0;

export function replacePlaceholders(value) { // short for "common placeholders"
	if(typeof(value) != "String") {return value;} else {
		str.replace("myRoll",diceSum,99);
		str.replace("enemyRoll",foeDiceSum,99);
		str.replace(/(\{,\})/,"",99);
		return str;
	}
}

export async function onActivate(active) {
	for(let n in active) {
		let cmd = active[n];
		// For all values in the command except the command itself...
		for(let i = 0; i < cmd.length; i++) {
			// ...replace any placeholder values.
			cmd[i] = replacePlaceholders(cmd[i]);
		}
		switch(cmd[0]) {
			case "roll":
				// amount, max, modifier
				for(let i = 0; i < cmd[1]; i++) {
					await dice(cmd[2],false).then(r => {
						diceSum += r["value"];
					});
				}
				diceSum += cmd[3];
				// todo: know the opponent so that we can factor in their roll type, amount, etc.
				await dice(20,true).then(r => {foeDiceSum += r["value"]});
				if(diceSum > foeDiceSum) {
					console.log(cmd[4][0]);
					onActivate(cmd[4][0]);
				} else {
					console.log(cmd[5][0]);
					onActivate(cmd[5][0]);
				}
				break;
			default:
				console.error("Uncaught or unknown command: "+cmd[0]);
				break;
		}
	}
}