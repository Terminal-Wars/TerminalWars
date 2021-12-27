import { objects_dice } from '../main.js';

export async function dice(max, finalval, foe=false) {

	/*if(ping >= 400) {*/
		let rand_pos = Math.round(Math.random() * 200) - 100;
		// impromptu function so that we can use it asynchronously
		let finalDie = 0;
		let id = objects_dice.length;
		objects_dice.push({"id":id,"type":"dice","x":rand_pos,"y":0,"animStep":1,"value":0,"opacity":1,"max":max,"finalval":finalval,"foe":foe});
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
		const time = 30;
		let initY = o["y"];
		// animation steps
		if((o["animStep"] > 0 && o["animStep"] <= time/2-1) || (o["animStep"] >= time/2+1 && o["animStep"] <= time)) o["animStep"]++;
		// it bounces up
		if(o["animStep"] <= time/2) {
			o["y"] -= Math.round(5/o["animStep"])+1;
			o["value"] = Math.floor(Math.random() * o["max"]);
		}
		// then violently jumps back down, and the value is finalized.
		if(o["animStep"] == time/2) {
			o["value"] = o["finalval"];
			if(o["y"] <= initY) o["y"] /= 2;
			else o["animStep"]++;
		}
		// (a frame after this it gets bumped one pixel down)
		if(o["animStep"] == (time/2)+2) o["y"] += 1;
		// after awhile, it fades away.
		if(o["animStep"] >= (time/2)+40 && o["opacity"] >= 0.06) o["opacity"] -= 0.05;
		// eventually it is forced away.
		if(o["animStep"] >= time) objects_dice.splice(n,n);
	}
}