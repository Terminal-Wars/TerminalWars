import { objects } from './main.js';
import { ping } from './ping.js';
import {term_buttons, WIDTH, HEIGHT, OB_WIDTH, OB_HEIGHT} from './canvas.js';
import {keyboardBuffer} from './keyboard.js';

export async function loadDefaultObjects() {
	// The desktop background
	objects.push({"id":0,"type":"desktop","x":0,"y":0,"width":800,"height":600,"color1":"#3a53ab","color2":"#18244d","z":0});
	// The dice
	objects.push({"id":1,"type":"dice","x":0,"y":0,"animStep":0,"value":0,"opacity":1});
	// The desktop objects
	//objects.push({"id":"0","type":"shortcut","name":"a","x":48,"y":48,"width":32,"height":32,"fillStyle":"red"});
	//objects.push({"id":"0","type":"shortcut","x":48,"y":48,"width":32,"height":32,"fillStyle":"red"});
	objects.push({"id":2,"type":"window","title":"Terminal","win_type":"text","x":400,"y":225,"width":200,"height":200,"z":1,
				  "texts":{0: "", 1: ""}, "event_num":3,
				  "events": [{"type":"button","anchor": "positive","x":-58,"y":-25,"width":16,"height":16,"active":0,"hover":0,"image":term_buttons,"ox":0,"oy":0,
							"command":{"command": "attackDropdown"}},
							 {"type":"button","anchor": "positive","x":-39,"y":-25,"width":16,"height":16,"active":0,"hover":0,"image":term_buttons,"ox":0,"oy":16,
							"command":{"command": "bag"}},
							 {"type":"button","anchor": "positive","x":-20,"y":-25,"width":16,"height":16,"active":0,"hover":0,"image":term_buttons,"ox":0,"oy":32,
							"command":{"command": "user"}}]
							});
}
export async function dropdown(x,y,sid,list) {
	for(let n in objects) {
		if(objects[n]["sid"] == sid) {
			objects.splice(n,n);
		}
	}
	let width = 0; let height = list.length*9;
	let y_ = 3;
	// For each item in the list we were given...
	// first we want to get the longest one
	// (todo: oh come on there has to be a better way)
	for(let n in list) {
		if(list[n]["prettyname"].length*8 >= width) {width = list[n]["prettyname"].length*8}
	}
	// Then we initialize the dropdown object with default values.
	let dropdown = {"id":objects.length,"sid":sid,"type":"dropdown","x":x+width/2+2,"y":y+height,"width":width/2+2,"height":height,"z":9999,"event_num":list.length, "events":[]};
	// then we loop that list again and add the entries to that dropdown.
	for(let n in list) {
		dropdown.events.push({"type":"flat","anchor":"negative","x":3,"y":y_,"width":width,"height":15,"active":0,"hover":0,"text":list[n]["prettyname"],"command":{"command": "attack","arg1":n}})
		y_ += 17;
	}
	objects.push(dropdown);
}
export async function dice() {

	/*if(ping >= 400) {*/
		objects[1]["animStep"] = 1;
		objects[1]["opacity"] = 1;
		objects[1]["x"] = Math.round(Math.random() * 200) - 100;objects[1]["y"] = 0;
	/*} else {
		let img = document.createElement('img');
		img.style.position = 'absolute'; img.style.zIndex = document.body.length*22;
		img.src = "./static/gfx/diceroll.gif";
		img.border = "5px solid red";
		img.style.left = OB_WIDTH+(Math.random()*(WIDTH/2))+"px"; img.style.top = OB_HEIGHT+(Math.random()*(HEIGHT/2))+"px";
		document.body.appendChild(img);
		setTimeout(function() {
			img.style.filter = "brightness(50%)";
		}, 5500)
	}*/
}
export async function diceUpdate() {
	let o = objects[1];
	// animation steps
	if(o["animStep"] > 0 && o["animStep"] <= 61) o["animStep"]++;
	// it bounces up
	if(o["animStep"] <= 20) {o["y"] -= Math.round(5/o["animStep"])+1; o["value"] = Math.floor(Math.random() * 99)}
	// then violently jumps back down
	if(o["animStep"] >= 20 && o["animStep"] <= 22) o["y"] += 5;
	// (a frame after this it gets bumped one pixel down)
	if(o["animStep"] == 23) o["y"] += 1;
	// after awhile, it fades away.
	if(o["animStep"] >= 40 && o["opacity"] >= 0.06) o["opacity"] -= 0.05;
	// eventually it is forced away.
	if(o["animStep"] >= 60) o["opacity"] = 0;
}