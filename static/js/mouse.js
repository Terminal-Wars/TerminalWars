import {Objects, objects, curObject} from './main.js';
import {WIDTH, HEIGHT, SWIDTH, SHEIGHT} from './canvas.js';
// mouse variables
let mouseDown = 0; let moldx, moldy, mcurx, mcury = 0;
// modifier based on the width and height of the window.
let wmod = (WIDTH/SWIDTH); let hmod = (HEIGHT/SHEIGHT);

// On every mouse movement
document.addEventListener("mousemove", function(e) {if(mouseDown) {
	// The current mouse position
	mcurx = e.clientX; mcury = e.clientY;
	// The distance that we've moved between the last mouse position we have and the current one.
	let xd = Math.round((mcurx*wmod)-(moldx*wmod)); let yd = Math.round((mcury*hmod)-(moldy*hmod));
	if(curObject["id"] > 0) {curObject["x"] += xd; curObject["y"] += yd};
	// Change the last mouse position to the current one.
	moldx = mcurx; moldy = mcury;
	}
})
// When a mouse button is clicked.
document.addEventListener("mousedown", function(e) {
	mouseDown = 1;
	// The "old" mouse position variables get set.
	moldx = e.clientX; moldy = e.clientY;
	// We then need the mouse position variables but adjusted based on the screen width/height.
	let mx = Math.round(moldx*wmod); let my = Math.round(moldy*hmod);

	// Get the z of the object with the highest z.
	let z = Objects.highestZ()["z"];
	// Starting on the highest z...
	for(let n = z; n >= 0; n--) {
		// ...for every object...
		// (to-do: there might be a faster way of doing this)
		for(let i = 0; i <= objects.length; i++) {
			let s = objects[i];
			// If the mouse cursor clicked within an object on the z level that we are on, and it's at the z level we're at...
			if(s["z"] == z && (mx >= s["x"]-(s["width"]) && mx <= s["x"]+(s["width"])) && (my >= s["y"]-(s["height"]) && my <= s["y"]+(s["height"]))) {
				Objects.setCurrent(objects[i]);
				z=0;
				break;
			}
		}
		// Decrease the z axis we search on.
		z--;
	}
});
// When the mouse button is released.
document.addEventListener("mouseup", function(e) {mouseDown = 0;});