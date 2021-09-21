import {Objects, objects} from './main.js';
import {WIDTH, HEIGHT, SWIDTH, SHEIGHT} from './canvas.js';
// mouse variables
let mouseDown = 0; let moldx, moldy, mcurx, mcury = 0;
// modifier based on the width and height of the window.
let wmod = (WIDTH/SWIDTH); let hmod = (HEIGHT/SHEIGHT);
// the currently selected object
let curObject;

document.addEventListener("mousemove", function(e) {if(mouseDown) {
	mcurx = e.clientX; mcury = e.clientY;
	let xd = Math.round((mcurx*wmod)-(moldx*wmod)); let yd = Math.round((mcury*hmod)-(moldy*hmod));
	moldx = mcurx; moldy = mcury;
	if(curObject["id"] > 0) {curObject["x"] += xd; curObject["y"] += yd};
	}
})
document.addEventListener("mousedown", function(e) {
	mouseDown = 1;
	moldx = e.clientX; moldy = e.clientY;
	let mx = Math.round(moldx*wmod); let my = Math.round(moldy*hmod);
	let z = Objects.highestZ()["z"];
	
	for(let i = z; i >= 0; i--) {
		let s = objects[i];
		if((mx >= s["x"]-(s["width"]) && mx <= s["x"]+(s["width"])) && (my >= s["y"]-(s["height"]) && my <= s["y"]+(s["height"]))) {
			curObject = objects[i];
			console.log(curObject);
			i=0;
			break;
		}
	}
});
document.addEventListener("mouseup", function(e) {mouseDown = 0;});