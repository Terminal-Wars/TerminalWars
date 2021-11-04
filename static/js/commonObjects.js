import { objects, objects_dice, debugBox2 } from './main.js';
import { ping } from './ping.js';
import {width, height, obWidth, obHeight} from './canvas.js';
import {keyboardBuffer} from './keyboard.js';
import {delay} from './commonFunctions.js';
import {terminal} from './programs.js';
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
	//await terminal();
}
export async function dropdown(x,y,sid,list,command="",arg1="",arg2="") {
	// TODO: make it so a dropdown disappears when the mouse moves away from it.
	// this for loop mostly uses the index anyways so just use for
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
	list.forEach(function(l) {
		let name = (l["prettyname"] || l["name"]);
		if(name.length*8 >= width) {width = name.length*8}
	});
	// Then we initialize the dropdown object with default values.
	let dropdown = {"id":objects.length,"sid":sid,"type":"dropdown","x":x+width/2+2,"y":y+height,"width":width/2+2,"height":height,"z":9999,"event_num":list.length, "events":[], "z":objects.length};
	// then we loop that list again and add the entries to that dropdown.
	list.forEach(function(l) {
		let name = (l["prettyname"] || l["name"]);
		// this would normally be put in a function but it would be weird and slower
		// to do that because of {index}, which means we would need to remake it every loop.
		let arg1_ = arg1.replace("{index}",list.indexOf(l),1).replace("{name}",name,1);
		let arg2_ = arg2.replace("{index}",list.indexOf(l),1).replace("{name}",name,1);
		dropdown.events.push({"type":"flat","anchor":"negative","x":3,"y":y_,"width":width,"height":15,"active":0,"hover":0,"text":name,"command":{"p_command":command,"arg1":arg1_,"arg2":arg2_}})
		y_ += 17;
	});
	objects.push(dropdown);
}
export async function dice(max, foe=false) {

	/*if(ping >= 400) {*/
		let rand_pos = Math.round(Math.random() * 200) - 100;
		// impromptu function so that we can use it asynchronously
		let finalDie = 0;
		async function dicePush() { 
			let id = objects_dice.length;
			objects_dice.push({"id":id,"type":"dice","x":rand_pos,"y":0,"animStep":1,"value":0,"opacity":1,"max":max,"foe":foe});
			return objects_dice[id];
		};
		return await dicePush().then(r => delay(2500, r));
	/*} else {
		let img = document.createElement('img');
		img.style.position = 'absolute'; img.style.zIndex = document.body.length*22;
		img.src = "./static/gfx/diceroll.gif";
		img.border = "5px solid red";
		img.style.left = obWidth+(Math.random()*(width/2))+"px"; img.style.top = onHeight+(Math.random()*(height/2))+"px";
		document.body.appendChild(img);
		setTimeout(function() {
			img.style.filter = "brightness(50%)";
		}, 5500)
	}*/
}
export async function diceUpdate() {
	for(let n in objects_dice) {
		let o = objects_dice[n];
		// animation steps
		if(o["animStep"] > 0 && o["animStep"] <= 61) o["animStep"]++;
		// it bounces up
		if(o["animStep"] <= 20) {o["y"] -= Math.round(5/o["animStep"])+1; o["value"] = Math.floor(Math.random() * o["max"])}
		// then violently jumps back down
		if(o["animStep"] >= 20 && o["animStep"] <= 22) o["y"] += 5;
		// (a frame after this it gets bumped one pixel down)
		if(o["animStep"] == 23) o["y"] += 1;
		// after awhile, it fades away.
		if(o["animStep"] >= 40 && o["opacity"] >= 0.06) o["opacity"] -= 0.05;
		// eventually it is forced away.
		if(o["animStep"] >= 60) objects_dice.splice(n,n);
	}
}2