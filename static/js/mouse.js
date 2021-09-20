import {Objects, objects} from './main.js';
import {WIDTH, HEIGHT} from './canvas.js';


document.addEventListener("mousedown", function(e) {
	let wmod = (WIDTH/window.innerWidth); let hmod = (HEIGHT/window.innerHeight);
	let mx = Math.round(e.clientX*wmod); let my = Math.round(e.clientY*hmod);
	let z = Objects.highestZ()["z"];
	for(let i = z; i >= 0; i--) {
		let s = objects[1];
		console.log("========");
		console.log(mx.toString()+" >= "+(s["x"]-s["width"]/2).toString());
		console.log(mx.toString()+" <= "+(s["x"]+s["width"]/2).toString());
		console.log(my.toString()+" >= "+(s["y"]-s["height"]/2).toString());
		console.log(my.toString()+" <= "+(s["y"]+s["height"]/2).toString());
		if((mx >= s["x"]-(s["width"]/2) && mx <= s["x"]+(s["width"]/2)) && (my >= s["y"]-(s["height"]/2) && my <= s["y"]+(s["height"]/2))) {
			console.log(s);
			i=0;
			break;
		}
	}
})