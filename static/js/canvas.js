import { objects } from './main.js';
import { keyboardBuffer } from './keyboard.js';
import { drawChars } from './charmap.js';
import { userID, roomID } from './commands.js';
// The canvas
export let canvas = document.querySelector('.draw');
export let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled= false;
ctx.mozImageSmoothingEnabled = false;

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
// The draw function.
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
				ctx.fillStyle = "black";
				ctx.fillRect(xa_n+1, ya_n+1, (rw+1), (rh)+2-1);
				ctx.fillStyle = "#b5b5b5";
				ctx.fillRect(xa_n+1, ya_n+1, (rw), (rh));
				ctx.fillStyle = "white";
				ctx.fillRect(xa_n+1, ya_n+1, (rw)-1, (rh)-1);
				ctx.fillStyle = "#b5b5b5";
				ctx.fillRect(xa_n+2, ya_n+2, (rw)-2, (rh)-2);
				// red gradient
				var gradient = ctx.createLinearGradient(xa_n+2, ya_n+3, xa_p+2, ya_p+3);
				gradient.addColorStop(0, "#dd0000");
				gradient.addColorStop(1, "#000000");
				ctx.fillStyle = gradient;
				ctx.fillRect(xa_n+4, ya_n+4, rw-6, 19);
				// title (todo: write a custom function for writing fonts)
				ctx.fillStyle = "white";
				ctx.font = "bold 12px sans-serif";
				drawChars(o["title"], o["x"]-(o["title"].length*3), ya_n+6, 1, 1);
				switch(o["win_type"]) {
					// terminal window
					case "text":
						let cursorPosX = 0; let cursorPosY = 0;
						ctx.font = "10px sans-serif";
						// anything from the keyboard buffer gets added to the text box in this loop.
						// it actually wouldn't normally need to be an array, but you can't modify variables exported from other files in ES6,
						// only arrays.
						if(keyboardBuffer.length >= 1) {
							o["texts"][0] += keyboardBuffer[0];
							keyboardBuffer.shift(0);
							termHeight++;
							if(termHeight > 27) {shiftY--;}
						}
						// big box
						draw_textbox(xa_n+6, ya_n+25, rw-10, rh-58);
						ctx.fillStyle = "black";
						for(let i = 0; i <= o["texts"][0].length; i++) {
							let k = o["texts"][0].charAt(i);
							switch(k) {
								case "\n":
									cursorPosY += 12;
									cursorPosX = -8;
								default:
									let tmpCPY = ya_n+35+cursorPosY+(shiftY*12);
									if(tmpCPY <= ya_n+12 || tmpCPY >= rh-24)  {continue;}
									drawChars(k,xa_n+8+cursorPosX,tmpCPY);
									//ctx.fillText(k, xa_n+8+cursorPosX, ya_n+35+cursorPosY);
									cursorPosX += 8;
									if(cursorPosX >= 384) {cursorPosX = 0; cursorPosY += 12;}
							}
						}
						// scrollbar 
						ctx.fillStyle = '#b5b5b5';
						if(termHeight > 27) ctx.fillRect(xa_p-22,ya_n+35-(rh/(termHeight/shiftY)),16,(o["height"]*1.69/termHeight)*-1);
						// small box
						draw_textbox(xa_n+6, ya_p-26, rw-68, 18);
						
						draw_button(xa_p-58, ya_p-25, 16, 16, term_buttons, 0);
						draw_button(xa_p-39, ya_p-25, 16, 16, term_buttons, 16);
						draw_button(xa_p-20, ya_p-25, 16, 16, term_buttons, 32);
						ctx.fillStyle = "black";
						drawChars(o["texts"][1], xa_n+8,ya_p-24);
				}
				break;
			default:
				ctx.fillStyle = o.fillStyle;
				ctx.fillRect(xa_n, ya_n, rw, rh);
				break;
		}
		// Draw any button events here.
		for(let i = 0; i < o["event_num"]; i++) {
			let e = o["events"][i];
			// Bit of a bizarre way of doing things, but it's less messy.
			if(e["anchor"] == "positive") {xa = o["x"]+o["width"]; ya = o["y"]+o["height"];}
			if(e["anchor"] == "negative") {xa = o["x"]-o["width"]; ya = o["y"]-o["height"]};
			draw_button(xa+e["x"],ya+e["y"],e["width"],e["height"],e["image"],e["ox"],e["oy"],e["active"]);
		}
	}
}

// Draw a textbox with the border.
export function draw_textbox(x,y,width,height) {
	ctx.fillStyle = "#808080";
	ctx.fillRect(x-1, y-1, width+2, height+2);
	ctx.fillStyle = "black";
	ctx.fillRect(x, y, width+1, height+1);
	ctx.fillStyle = "white";
	ctx.fillRect(x, y, width, height);
}

export function draw_button(x,y,width,height,image,ox,oy,active) {
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
