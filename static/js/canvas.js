import { objects } from './main.js';
import { keyboardBuffer } from './keyboard.js';
import { drawChars } from './charmap.js';
import { userID, roomID } from './commands.js';

// The canvas
export let canvas = document.querySelector('.draw');
export let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
//ctx.mozImageSmoothingEnabled = false;

// The monitor width
export const SWIDTH = screen.width; export const SHEIGHT = window.innerHeight;
// The default, set width and height.
export const WIDTH = 800;
export const HEIGHT = 600;
// The scale multiplier.
export const MUL = Math.floor(SHEIGHT/HEIGHT);

// Any images we need
export const term_buttons = new Image(32,48);
term_buttons.src = 'static/gfx/term_buttons.webp';

// X and Y anchors, seperate from the ones from within the drawGFX function.
let xa, ya = 0;

// Some terminal specific variables which need to be global.
export let shiftY = 0; export let termHeight = 1;

// And since variables are imported to other files as consts no matter what,
// we need a function to increase and decrease it from this file.
// todo: clamp function
export function shiftYBy(num) {shiftY += num;}

canvas.width = WIDTH; canvas.height = HEIGHT;
canvas.style.width = WIDTH*MUL+"px"; canvas.style.maxWidth = WIDTH*MUL+"px"; 
canvas.style.height= HEIGHT*MUL+"px"; canvas.style.maxHeight = HEIGHT*MUL+"px";
//canvas.style.maxWidth = window.innerWidth+"px"; canvas.style.maxHeight = SHEIGHT+"px";


// Common UI elements
class DrawClass {
	textbox(x, y, width, height) {
		ctx.fillStyle = "#808080";
		ctx.fillRect(x-1, y-1, width+2, height+2);
		ctx.fillStyle = "black";
		ctx.fillRect(x, y, width+1, height+1);
		ctx.fillStyle = "white";
		ctx.fillRect(x, y, width, height);
	}
	button(x, y, width, height, image, ox, oy,active) {
		// Buttons cannot be pressed until the user is logged in.
		if(userID == "" || roomID == "") {ox += 16;}
		ctx.fillStyle = "black";
		ctx.fillRect(x-1, y-1, width+2, height+2);
		if(active == 0) {
			ctx.fillStyle = "white";
			ctx.fillRect(x-1, y-1, width+1, height+1);
			ctx.fillStyle = "#dfdfdf";
			ctx.fillRect(x, y, width, height);
			ctx.fillStyle = "#808080";
			ctx.fillRect(x+1, y+1, width-1, height-1);
		} else {
			ctx.fillStyle = "#808080";
			ctx.fillRect(x, y, width, height);
		}
		ctx.fillStyle = "#b5b5b5";
		ctx.fillRect(x+1, y+1, width-2, height-2);
		ctx.drawImage(image,ox,oy,width,height,x,y,width,height);
	}
	base(x, y, w, h) {
		ctx.fillStyle = "black";
		ctx.fillRect(x+1, y+1, (w+1), (h)+2-1);
		ctx.fillStyle = "#b5b5b5";
		ctx.fillRect(x+1, y+1, (w), (h));
		ctx.fillStyle = "white";
		ctx.fillRect(x+1, y+1, (w)-1, (h)-1);
		ctx.fillStyle = "#b5b5b5";
		ctx.fillRect(x+2, y+2, (w)-2, (h)-2);
	}
}
const Draw = new DrawClass();

// The main draw function.
export async function drawGFX() {
	// For each object in the objects array...
	for(let i = 0; i < objects.length; i++) {
		let o = objects[i];
		// Some common variables
		let xa_n = o["x"]-o["width"]; let ya_n = o["y"]-o["height"]; // "x anchor negative" and "y anchor negative"
		let xa_p = o["x"]+o["width"]; let ya_p = o["y"]+o["height"]; // "x anchor postive" and "y anchor positive"
		let rw = o["width"]*2; let rh = o["height"]*2; // "remaining width and height"
		// Get the type of it, and draw something different based on said type.
		switch(o["type"]) {
			case "window":
				// gray base
				Draw.base(xa_n,ya_n,rw,rh);
				// red gradient
				var gradient = ctx.createLinearGradient(xa_n+2, ya_n+3, xa_p+2, ya_n+3);
				gradient.addColorStop(0, "#cc0000");
				gradient.addColorStop(1, "#770000");
				ctx.fillStyle = gradient;
				ctx.fillRect(xa_n+4, ya_n+4, rw-6, 19);
				// title
				drawChars(o["title"], o["x"]-(o["title"].length*3), ya_n+6,true,true);
				switch(o["win_type"]) {
					// terminal window
					case "text":
						// anything from the keyboard buffer gets added to the text box in this loop.
						// it actually wouldn't normally need to be an array, but you can't modify variables exported from other files in ES6,
						// only arrays.
						if(keyboardBuffer.length >= 1) {
							o["texts"][0] += keyboardBuffer[0];
							keyboardBuffer.shift(0);
							// we assume that every line in the keyboard buffer ends in a newline, and they pretty much always do.
							termHeight++;
							if(termHeight > 27) {shiftY--;}
						}
						// big box
						Draw.textbox(xa_n+6, ya_n+25, rw-10, rh-58);
						ctx.fillStyle = "black";
						drawChars(o["texts"][0],xa_n+8,ya_n+35+(shiftY*12),false,false,384,ya_n+12,rh-24);
						// scrollbar 
						ctx.fillStyle = '#b5b5b5';
						if(termHeight > 27) ctx.fillRect(xa_p-22,ya_n+35-(rh/(termHeight/shiftY)),16,(o["height"]*1.69/termHeight)*-1);
						// small box
						Draw.textbox(xa_n+6, ya_p-26, rw-68, 18);
						drawChars(o["texts"][1], xa_n+8,ya_p-24);
				}
				break;
			case "desktop":
				var gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
				gradient.addColorStop(0, o["color1"]);
				gradient.addColorStop(1, o["color2"]);
				ctx.fillStyle = gradient;
				ctx.fillRect(0, 0, WIDTH, HEIGHT);
				break;
			case "dropdown":
				Draw.base(xa_n, ya_n, rw, rh);
				drawChars(o.text,xa_n+3,ya_n);
				break;
			default:
				ctx.fillStyle = o.fillStyle;
				ctx.fillRect(xa_n, ya_n, rw, rh);
				if(o.text != undefined) {
					drawChars(o.text,xa_n+3,ya_n+3);
				}
				break;
		}
		// Draw any button events here.
		for(let i = 0; i < o["event_num"]; i++) {
			let e = o["events"][i];
			// Bit of a bizarre way of doing things, but it's less messy.
			if(e["anchor"] == "positive") {xa = o["x"]+o["width"]; ya = o["y"]+o["height"];}
			if(e["anchor"] == "negative") {xa = o["x"]-o["width"]; ya = o["y"]-o["height"]};
			Draw.button(xa+e["x"],ya+e["y"],e["width"],e["height"],e["image"],e["ox"],e["oy"],e["active"]);
		}
	}
}

// Make sure every pixel on the screen adheres to a certain color depth.
export async function degrade(depth) {
	// Indexing
	let pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT); 
	let pixeldata = pixels.data;
	// The 4 here is arbritrary. By changing every fourth pixel, we (somehow) still achieve the effect,
	// and it's faster on older hardware.
	// to-do: why the fuck does this work
	for(let i = 0; i < pixeldata.length; i += 4) {
		pixeldata[i] = Math.floor(pixeldata[i] / (255 / depth)) * (255 / depth);
	}
	ctx.putImageData(pixels, 0, 0);
}
