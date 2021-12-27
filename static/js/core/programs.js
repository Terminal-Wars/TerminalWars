import {objects, startTime, shell} from '../main.js';
import {testingBG, term_buttons} from '../../gfx/images.js';
import {keyboardBuffer} from '../input/keyboard.js';
import {appendTermHeight} from '../gfx/canvas.js';

export let notecardCanvas = document.createElement('canvas');

export async function terminal() {
	objects.push({"id":objects.length,"type":"window","title":"Terminal","win_type":"terminal","x":400,"y":400,"width":200,"height":200,"z":objects.length+1,
		"color1": "#990000", "color2": "#220000",
		"texts":{0: "", 1: ""}, "event_num":5,
		"events": [{"type":"button","anchor": "positive","x":-58,"y":-25,"width":16,"height":16,"active":0,"hover":0,"enabled":"{ourTurn}","image":term_buttons,"ox":0,"oy":0,
			"command":{"p_command": "activeDropdown"}},
			{"type":"button","anchor": "positive","x":-39,"y":-25,"width":16,"height":16,"active":0,"hover":0,"enabled":"{loggedIn}","image":term_buttons,"ox":0,"oy":16,
			"command":{"p_command": "bag"}},
			{"type":"button","anchor": "positive","x":-20,"y":-25,"width":16,"height":16,"active":0,"hover":0,"enabled":"{loggedIn}","image":term_buttons,"ox":0,"oy":32,
			"command":{"p_command": "switch"}},
			{"type":"button","anchor":"posneg","x":-21,"y":26,"width":16,"height":16,"active":0,"hover":0,"enabled":1,"image":term_buttons,"ox":0,"oy":48,"command":{"p_command":"shiftYBy","arg1":1}},
			{"type":"button","anchor":"positive","x":-21,"y":-50,"width":16,"height":16,"active":0,"hover":0,"enabled":1,"image":term_buttons,"ox":0,"oy":64,"command":{"p_command":"shiftYBy","arg1":-1}}
			]
	});
	await fetch("/static/motd.txt").then(r => r.text()).then(r => {
		if(r.match(/\n/gm) != undefined) {
			appendTermHeight(r.match(/\n/gm).length);
			keyboardBuffer.push(r);
		}
	});
}

export async function notecard() {
	objects.push({"id":objects.length,"type":"window","win_type":"notecard","textbox":true,"title":"Notecard","x":100,"y":225,"width":100,"height":50,"z":objects.length+1})
}

export async function about() {
	objects.push({"id":objects.length,"win_type":"text","x":150,"y":300,"width":150,"height":250,"z":objects.length+1,"type":"window","title":"About","text":"TerminalWars is an attempt to create a multiplayer D&D-like experience that can be used for basic, more story driven campaigns. While the game can certainly be played seriously, thanks to it's extensive character creation system, campaigns can also be stupid simple, because when creating a character there are three values that are actually required. Furthermore, while the experience of a text adventure is retained, players can also have images next to their name. They're also able to create minigames using PICO-8, and make people play them aspart of their attack. While you haveto use your imagination, you can also express your character visually too.\n\nThe game is currently in \bearly \balpha.\x01 Please report any bugs you find to the below url: www.github.com/IoIxD/TerminalWars/issues"})
}

export async function neofetch() {
	let s = 6000+(new Date()-startTime)/1000;
    let d = Math.round((s / 60 / 60 / 24)*100)/100;
    let h = Math.round((s / 60 / 60 % 24)*100)/100;
    let m = Math.round((s / 60 % 60)*100)/100;
    let t = "";
    if(m >= 1) t += m+" mins";
    if(h >= 1) t += ", "+h+" hours";
    if(d >= 1) t += ", "+d+" days";

	return 
	`${userID}@terminalwars\n
	\bUptime: \x01${t}\n
	\bShell: \x01${shell}\n`;
}

// Function for launching programs from arrays in other files (which is most of the time)
export async function launch(name) {
	switch(name) {
		case "terminal":
			await terminal();
			break;
		case "about":
			await about();
			break;
		default:
			break;
	}
}