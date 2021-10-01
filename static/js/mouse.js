import {Objects, objects, curObject, mousePos} from './main.js';
import {WIDTH, HEIGHT, SWIDTH, SHEIGHT} from './canvas.js';
import { command, userID, roomID} from './commands.js';

// The mouse position for other files to use.
let mousePosTemp = [{"x":0,"y":0}];


const OB_WIDTH = ((SWIDTH-WIDTH)/2); const OB_HEIGHT = ((SHEIGHT-HEIGHT)/2);
// mouse variables
let mouseDown = 0; let winMoveMode = 0;
// modifier based on the width and height of the window.
let wmod = (WIDTH/SWIDTH); let hmod = (HEIGHT/SHEIGHT);
// x and y anchor (for event positioning)
let xa, ya = 0;
// Click/hover events for events.
async function eventUpdate(obj,val) {
	for(let i in obj["events"]) {
		let e = obj["events"][i];
		// Bit of a bizarre way of doing things, but it's less messy.
		if(e["anchor"] == "positive") {xa = obj["x"]+obj["width"]; ya = obj["y"]+obj["height"];}
		if(e["anchor"] == "negative") {xa = obj["x"]-obj["width"]; ya = obj["y"]-obj["height"]};
		if((userID != "" && roomID != "") && mousePosTemp["x"] >= xa+e["x"] && mousePosTemp["y"] >= ya+e["y"] && mousePosTemp["x"] <= xa+e["x"]+e["width"] && mousePosTemp["y"] <= ya+e["y"]+e["height"]) {
			e[val] = 1;
			command(e["command"]["command"]);
		}
	}
}
// On every mouse movement
document.addEventListener("mousemove", async function(e) {
	// The current mouse position
	mousePos["x"] = Math.round(e.clientX-OB_WIDTH); mousePos["y"] = Math.round(e.clientY-OB_HEIGHT);
	if(mouseDown) {
	// The distance that we've moved between the last mouse position we have and the current one.
	let xd = Math.round(mousePos["x"]-mousePosTemp["x"]); let yd = Math.round(mousePos["y"]-mousePosTemp["y"]);
	// Are we dragging the topmost part of the window?
	if(winMoveMode) {
		// If so, move the window.
		if(curObject["id"] > 0) {curObject["x"] += xd; curObject["y"] += yd};
	} // Otherwise do nothing. 
	// Change the last mouse position to the current one.
	mousePosTemp["x"] = mousePos["x"]; mousePosTemp["y"] = mousePos["y"];
	}
})
// When a mouse button is clicked.
document.addEventListener("mousedown", async function(e) {
	mouseDown = 1;
	// The "old" mouse position variables get set.
	mousePosTemp["x"] = Math.round(e.clientX-OB_WIDTH); mousePosTemp["y"] = Math.round(e.clientY-OB_HEIGHT);

	// Get the z of the object with the highest z.
	let z = Objects.highestZ()["z"];
	// Starting on the highest z...
	for(let n = z; n > -10; n--) {
		// ...for every object...
		// (to-do: there might be a faster way of doing this)
		for(let i = 0; i <= objects.length-1; i++) {
			let s = objects[i];
			// If the mouse cursor clicked within an object on the z level that we are on, and it's at the z level we're at...
			if(s["z"] == n && (mousePosTemp["x"] >= s["x"]-(s["width"]) && mousePosTemp["x"] <= s["x"]+(s["width"])) && (mousePosTemp["y"] >= s["y"]-(s["height"]) && mousePosTemp["y"] <= s["y"]+(s["height"]))) {
				Objects.setCurrent(s);
				// detection for window objects
				if(s["type"] == "window" && mousePosTemp["y"] >= s["y"]-s["height"] && mousePosTemp["y"] <= s["y"]-s["height"]+22) {winMoveMode = 1} else {winMoveMode = 0}
				// Get some more information about the window.
				await eventUpdate(s,"active");
				n=0;
			}
		}
	}
});
// When the mouse button is released.
document.addEventListener("mouseup", function(e) {
	// mouse up
	mouseDown = 0;
	// release the active state of any button event.
	for(let i = 0; i <= objects.length-1; i++) {
		for(let n = 0; n < objects[i]["event_num"]; n++) {
			objects[i]["events"][n]["active"] = 0;
		}
	}
});