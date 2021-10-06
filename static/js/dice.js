import {objects} from './main.js';
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