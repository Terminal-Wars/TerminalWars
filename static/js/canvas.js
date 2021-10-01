import { objects, debugBox } from './main.js';
import { keyboardBuffer } from './keyboard.js';
import { drawChars } from './charmap.js';
import { userID, roomID } from './commands.js';

// The canvas
export let canvasObject = document.querySelector('.draw');
export let ctx = canvasObject.getContext('2d');
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

// The frame counter. This is an array so that we can modify it from other files.
export let frameCount = [0];

canvasObject.width = WIDTH; canvasObject.height = HEIGHT;
canvasObject.style.width = WIDTH*MUL+"px"; canvasObject.style.maxWidth = WIDTH*MUL+"px"; 
canvasObject.style.height= HEIGHT*MUL+"px"; canvasObject.style.maxHeight = HEIGHT*MUL+"px";
//canvas.style.maxWidth = window.innerWidth+"px"; canvas.style.maxHeight = SHEIGHT+"px";


// Common UI elements
class DrawClass {
	async textbox(x, y, width, height) {
		ctx.fillStyle = "#808080";
		ctx.fillRect(x-1, y-1, width+2, height+2);
		ctx.fillStyle = "black";
		ctx.fillRect(x, y, width+1, height+1);
		ctx.fillStyle = "white";
		ctx.fillRect(x, y, width, height);
	}
	async button(x, y, width, height, content, ox, oy,active,type) {
		// Buttons cannot be pressed until the user is logged in.
		if(userID == "" || roomID == "") {ox += 16;}
		if(type == "button") {
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
		}
		// Draw either an image or some text
		switch(content.constructor.name) {
			case "HTMLImageElement":
				ctx.drawImage(content,ox,oy,width,height,x,y,width,height);
				break;
			case "String":
				drawChars(content,x,y);
				break;
		}
	}
	async base(x, y, w, h) {
		ctx.fillStyle = "black";
		ctx.fillRect(x+1, y+1, (w+1), (h)+1);
		ctx.fillStyle = "#808080";
		ctx.fillRect(x+1, y+1, (w), (h));
		ctx.fillStyle = "white";
		ctx.fillRect(x+1, y+1, (w)-1, (h)-1);
		ctx.fillStyle = "#b5b5b5";
		ctx.fillRect(x+2, y+2, (w)-2, (h)-2);
	}
	async box(x,y,width,height,fillStyle) {
		// This is actually a bit redundant, but having this here lets us execute this asynchronously.
		ctx.fillStyle = fillStyle;
		ctx.fillRect(x,y,width,height);
	}
	async gradient(x1,y1,x2,y2,width,height,color1,color2) {
		let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
		gradient.addColorStop(0, color1);
		gradient.addColorStop(1, color2);
		ctx.fillStyle = gradient;
		ctx.fillRect(x1, y1, width, height);
	}
}
const Draw = new DrawClass();

// The function for drawing objects.
export async function draw(o) {
		frameCount[0]++; 
		// Some common variables
		let xa_n = o["x"]-o["width"]; let ya_n = o["y"]-o["height"]; // "x anchor negative" and "y anchor negative"
		let xa_p = o["x"]+o["width"]; let ya_p = o["y"]+o["height"]; // "x anchor postive" and "y anchor positive"
		let rw = o["width"]*2; let rh = o["height"]*2; // "remaining width and height"
		// Get the type of it, and draw something different based on said type.
		switch(o["type"]) {
			case "window":
				// gray base
				await Draw.base(xa_n,ya_n,rw,rh);
				// red gradient
				await Draw.gradient(xa_n+2, ya_n+3, xa_p+2, ya_n+3,rw-6, 19,"#cc0000","#000000")
				// title
				await drawChars(o["title"], o["x"]-(o["title"].length*3), ya_n+6,true,true);
				switch(o["win_type"]) {
					// terminal window
					case "text":
						// anything from the keyboard buffer gets added to the text box in this loop.
						// it actually wouldn't normally need to be an array, but you can't modify variables exported from other files in ES6,
						// only arrays.
						// also this is an impromptu async function for performance reasons.
						async function temp() {if(keyboardBuffer.length >= 1) {
							o["texts"][0] += keyboardBuffer[0];
							keyboardBuffer.shift(0);
							// we assume that every line in the keyboard buffer ends in a newline, and they pretty much always do.
							termHeight++;
							if(termHeight > 27) {shiftY--;}
						}}
						await temp();
						// big box
						await Draw.textbox(xa_n+6, ya_n+25, rw-10, rh-58);
						await drawChars(o["texts"][0],xa_n+8,ya_n+35+(shiftY*12),false,false,384,ya_n+12,rh-24);
						// scrollbar 
						if(termHeight > 27) await Draw.box(xa_p-22,ya_n+35-(rh/(termHeight/shiftY)),16,(o["height"]*1.69/termHeight)*-1,'#b5b5b5');
						// small box
						await Draw.textbox(xa_n+6, ya_p-26, rw-68, 18);
						await drawChars(o["texts"][1], xa_n+8,ya_p-24);
				}
				break;
			case "desktop":
				await Draw.box(0,0,WIDTH,HEIGHT,o["color1"]);
				//await Draw.gradient(0,0,0,HEIGHT,WIDTH,HEIGHT,o["color1"],o["color2"])
				break;
			case "dropdown":
				await Draw.base(xa_n, ya_n, rw, rh);
				await drawChars(o.text,xa_n+3,ya_n);
				break;
			default:
				await Draw.box(xa_n, ya_n, rw, rh,o["fillStyle"]);
				if(o.text != undefined) {
					await drawChars(o.text,xa_n+3,ya_n+3);
				}
				break;
		}
		// Draw any button events here.
		for(let i = 0; i < o["event_num"]; i++) {
			let e = o["events"][i];
			// Bit of a bizarre way of doing things, but it's less messy.
			if(e["anchor"] == "positive") {xa = o["x"]+o["width"]; ya = o["y"]+o["height"];}
			if(e["anchor"] == "negative") {xa = o["x"]-o["width"]; ya = o["y"]-o["height"]};
			Draw.button(xa+e["x"],ya+e["y"],e["width"],e["height"],(e["image"]||e["text"]),e["ox"],e["oy"],e["active"],e["type"]);
		}
}

export async function drawGFX() {
	for(let i = 0; i < objects.length; i++) {
	    await draw(objects[i]);
	}
}

