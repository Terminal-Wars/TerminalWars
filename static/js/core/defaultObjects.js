import { objects, objects_dice, debugBox2 } from '../main.js';
import {width, height, obWidth, obHeight} from '../gfx/canvas.js';
import {terminal, notecard} from '../core/programs.js';

export async function loadDefaultObjects() {
	// The desktop background
	objects.push({"id":0,"type":"desktop","x":0,"y":0,"width":800,"height":600,"color1":"#3a53ab","color2":"#18244d","z":0});
	// Th-the fucking mouse has to be an object.
	objects.push({"id":0,"type":"mouse","x":0,"y":0,"width":8,"height":12,"z":0,"fill":"red"})
	// The desktop icons
	let icon = new Image(128,128);
	icon.src = "static/gfx/icons/editor.png";
	objects.push({"id":1,"type":"shortcut","text":"About","x":17,"y":16,"width":32,"height":32,"z":1,"icon":icon,"event_num":1,
		"events": [{"type":"extraflat","anchor": "none","x":0,"y":0,"width":32,"height":32,"active":0,"hover":0,"enabled":1,"command":{"launch": "about"}}]});
	//objects.push({"id":"0","type":"shortcut","x":48,"y":48,"width":32,"height":32,"fillStyle":"red"});

	// The dice layer; more on this in canvas.js.
	objects.push({"id":2,"type":"dice_layer","x":0,"y":0,"width":0,"height":0,"z":0});
	
	// The terminal (which was moved to programs.js)
	terminal();
}

