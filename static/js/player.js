import {dice} from './commonObjects.js';

export async function onActivate(active) {
	for(let n in active["on_activate"][0]) {
		let cmd = active["on_activate"][0][n];
		console.log(cmd[0]);
		switch(cmd[0]) {
			case "roll":
				dice();
				break;
		}
	}
}