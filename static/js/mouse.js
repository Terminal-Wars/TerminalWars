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
// On every mouse movement
document.addEventListener("mousemove", function(e) {
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
document.addEventListener("mousedown", function(e) {
	mouseDown = 1;
	// The "old" mouse position variables get set.
	mousePosTemp["x"] = e.clientX-OB_WIDTH; mousePosTemp["y"] = e.clientY-OB_HEIGHT;
	// We then need the mouse position variables but adjusted based on the screen width/height.
	let mx = Math.round(mousePosTemp["x"]); let my = Math.round(mousePosTemp["y"]);

	// Get the z of the object with the highest z.
	let z = Objects.highestZ()["z"];
	// Starting on the highest z...
	for(let n = z; n > -10; n--) {
		// ...for every object...
		// (to-do: there might be a faster way of doing this)
		for(let i = 0; i <= objects.length-1; i++) {
			let s = objects[i];
			// If the mouse cursor clicked within an object on the z level that we are on, and it's at the z level we're at...
			if(s["z"] == n && (mx >= s["x"]-(s["width"]) && mx <= s["x"]+(s["width"])) && (my >= s["y"]-(s["height"]) && my <= s["y"]+(s["height"]))) {
				Objects.setCurrent(s);
				// detection for window objects
				if(s["type"] == "window" && my >= s["y"]-s["height"] && my <= s["y"]-s["height"]+22) {winMoveMode = 1} else {winMoveMode = 0}
				// Get some more information about the window.
				for(i in s["events"]) {
					let e = s["events"][i];
					// Bit of a bizarre way of doing things, but it's less messy.
					if(e["anchor"] == "positive") {xa = s["x"]+s["width"]; ya = s["y"]+s["height"];}
					if(e["anchor"] == "negative") {xa = s["x"]-s["width"]; ya = s["y"]-s["height"]};
					if((userID != "" && roomID != "") && mx >= xa+e["x"] && my >= ya+e["y"] && mx <= xa+e["x"]+e["width"] && my <= ya+e["y"]+e["height"]) {
						 e["active"] = 1;
						 command(e["command"]["command"]);
					}
				}
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