import {Objects, objects, curObject, mousePos, debugBox2, debugBox3} from './main.js';
import {width, height, sWidth, sHeight, obWidth, obHeight} from './canvas.js';
import { command, userID, roomID, privateCommand} from './commands.js';
import {launch} from './programs.js';
import {globalEvents} from './commonObjects.js';
// The mouse position for other files to use.
let mousePosHeld = [{"x":0,"y":0}];
// mouse variables
let mouseDown = 0; let winMoveMode = 0; let mouseDownFor = 0;
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
			let mouse = objects[1];
			// If the mouse cursor is within an object on the z level that we are on, and it's at the z level we're at...
			// (No!! you can't move the tmpArray thing out of the if statement and replace mousePosHeld with it! because um...fuck you! that's why!)
			if(s["z"] == n && (mousePosHeld["x"] >= s["x"]-(s["width"]) && mousePosHeld["x"] <= s["x"]+(s["width"])) && (mousePosHeld["y"] >= s["y"]-(s["height"]) && mousePosHeld["y"] <= s["y"]+(s["height"]))) {
				Objects.setCurrent(s);
				// Handle movement of windows via their title bar.
				if(s["type"] == "window" && mousePosHeld["y"] >= s["y"]-s["height"] && mousePosHeld["y"] <= s["y"]-s["height"]+22) {winMoveMode = 1}
				// Now we handle any events in the window.
				async function eventUpdate() {for(let i in (s["events"] && globalEvents)) {
					if(val == "active") {tmpArray = mousePosHeld} else {tmpArray = mousePos};
					let e = s["events"][i];
					// Bit of a bizarre way of doing things, but it's less messy.
					if(e["anchor"] == "positive") {xa = s["x"]+s["width"]; ya = s["y"]+s["height"];}
					if(e["anchor"] == "negative") {xa = s["x"]-s["width"]; ya = s["y"]-s["height"]};
					if(e["anchor"] == "posneg") {xa = s["x"]+s["width"]; ya = s["y"]-s["height"];}
					if(e["anchor"] == "negpos") {xa = s["x"]-s["width"]; ya = s["y"]+s["height"]};
					if(e["anchor"] == "none") {xa = s["x"]; ya = s["y"]}
					// If we're actually hovering over an object...
					if(tmpArray["x"] >= xa+e["x"] && tmpArray["y"] >= ya+e["y"] && tmpArray["x"] <= xa+e["x"]+e["width"] && tmpArray["y"] <= ya+e["y"]+e["height"]) {
						e[val] = 1;
						if(val == "active") {
							let ec = e["command"];
							if(ec["command"] != undefined) command(ec["command"], (ec["arg1"]||null), (ec["arg2"]||null));
							if(ec["p_command"] != undefined) privateCommand(ec["p_command"], (ec["arg1"]||null), (ec["arg2"]||null));
							if(ec["launch"] != undefined) launch(ec["launch"]);
						}
					} else {
						e[val] = 0;
					}
					if(mouse["x"] >= xa+e["x"] && mouse["y"] >= ya+e["y"] && mouse["x"] <= xa+e["x"]+e["width"] && mouse["y"] <= ya+e["y"]+e["height"]) {
						mouse["fill"] = "blue";
					}
				}}; 
				eventUpdate();
				n=0;
			}
		}
	}
}

// On every mouse movement
document.addEventListener("mousemove", async function(e) {
	// The current mouse position
	mousePos["x"] = Math.round(e.clientX-obWidth); mousePos["y"] = Math.round(e.clientY-obHeight);
	windowUpdate("hover");
	if(mouseDown) {
	// The distance that we've moved between the last mouse position we have and the current one.
	let xd = Math.round(mousePos["x"]-mousePosHeld["x"]); let yd = Math.round(mousePos["y"]-mousePosHeld["y"]);
	// Are we dragging the topmost part of the window?
	if(winMoveMode) {
		// If so, move the window.
		if(curObject["id"] > 0) {curObject["x"] += Math.round(xd); curObject["y"] += Math.round(yd)};
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
	// todo: make it so we can hold down the mouse (using an event listener)
	windowUpdate("active");
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
	winMoveMode = 0;
});
document.addEventListener("wheel", function(e) {
	// todo: let programs choose what to do with the scroll wheel, rather then make it specific to the terminal.
	privateCommand("shiftYBy",Math.round(e.deltaY*0.05)*-1);
});