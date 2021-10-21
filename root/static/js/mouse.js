import {Objects, objects, curObject, mousePos} from './main.js';
import {width, height, sWidth, sHeight, obWidth, obHeight} from './canvas.js';
import { command, userID, roomID} from './commands.js';

// The mouse position for other files to use.
let mousePosHeld = [{"x":0,"y":0}];

// mouse variables
let mouseDown = 0; let winMoveMode = 0;
// modifier based on the width and height of the window.
let wmod = (width/sWidth); let hmod = (height/sHeight);
// x and y anchor (for event positioning)
let xa, ya = 0;

// Click/hover events for events.
async function windowUpdate(val) {
	// Get the z of the object with the highest z.
	let z = Objects.highestZ()["z"];
	// Starting on the highest z...
	for(let n = z; n > -10; n--) {
		// ...for every object...
		// (to-do: there might be a faster way of doing this)
		for(let i = 0; i <= objects.length-1; i++) {
			let s = objects[i];
			let tmpArray;
			// If the mouse cursor clicked within an object on the z level that we are on, and it's at the z level we're at...
			if(s["z"] == n && (mousePosHeld["x"] >= s["x"]-(s["width"]) && mousePosHeld["x"] <= s["x"]+(s["width"])) && (mousePosHeld["y"] >= s["y"]-(s["height"]) && mousePosHeld["y"] <= s["y"]+(s["height"]))) {
				Objects.setCurrent(s);
				// detection for window objects
				if(s["type"] == "window" && mousePosHeld["y"] >= s["y"]-s["height"] && mousePosHeld["y"] <= s["y"]-s["height"]+22) {winMoveMode = 1} else {winMoveMode = 0}
				// Get some more information about the window.
				async function eventUpdate() {for(let i in s["events"]) {
					let e = s["events"][i];
					// Bit of a bizarre way of doing things, but it's less messy.
					if(e["anchor"] == "positive") {xa = s["x"]+s["width"]; ya = s["y"]+s["height"];}
					if(e["anchor"] == "negative") {xa = s["x"]-s["width"]; ya = s["y"]-s["height"]};
					if(val == "active") {tmpArray = mousePosHeld} else {tmpArray = mousePos};
					if((userID != "" && roomID != "") && tmpArray["x"] >= xa+e["x"] && tmpArray["y"] >= ya+e["y"] && tmpArray["x"] <= xa+e["x"]+e["width"] && tmpArray["y"] <= ya+e["y"]+e["height"]) {
						e[val] = 1;
						if(val == "active") command(e["command"]["command"], (e["command"]["arg1"]||null), (e["command"]["arg2"]||null));
					} else {
						e[val] = 0;
					}
				}}; eventUpdate();
				n=0;
			}
		}
	}
}
// On every mouse movement
document.addEventListener("mousemove", async function(e) {
	// The current mouse position
	mousePos["x"] = Math.round(e.clientX-obWidth); mousePos["y"] = Math.round(e.clientY-obHeight);
	await windowUpdate("hover");
	if(mouseDown) {
	// The distance that we've moved between the last mouse position we have and the current one.
	let xd = Math.round(mousePos["x"]-mousePosHeld["x"]); let yd = Math.round(mousePos["y"]-mousePosHeld["y"]);
	// Are we dragging the topmost part of the window?
	if(winMoveMode) {
		// If so, move the window.
		if(curObject["id"] > 0) {curObject["x"] += xd; curObject["y"] += yd};
	} // Otherwise do nothing. 
	// Change the last mouse position to the current one.
	mousePosHeld["x"] = mousePos["x"]; mousePosHeld["y"] = mousePos["y"];
	}
})
// When a mouse button is clicked.
document.addEventListener("mousedown", async function(e) {
	mouseDown = 1;
	// The "old" mouse position variables get set.
	mousePosHeld["x"] = Math.round(e.clientX-obWidth); mousePosHeld["y"] = Math.round(e.clientY-obHeight);
	await windowUpdate("active");
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