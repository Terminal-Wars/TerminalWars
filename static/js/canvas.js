import { objects } from './main.js';
import { keyboardBuffer } from './keyboard.js';
import { drawChars } from './charmap.js';
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

// Some terminal specific variables which need to be global.
export let shiftY = 0; export let termHeight = 1;

// And since variables are imported to other files as consts no matter what,
// we need a function to increase and decrease it from this file.
// todo: clamp function
export function shiftYBy(num) {shiftY += num;}

canvas.width = WIDTH; canvas.height = HEIGHT;
canvas.style.width, canvas.style.maxWidth = WIDTH*MUL+"px"; canvas.style.height, canvas.style.maxHeight = HEIGHT*MUL+"px";
//canvas.style.maxWidth = window.innerWidth+"px"; canvas.style.maxHeight = SHEIGHT+"px";
// The draw function.
export async function drawGFX() {
	// For each object in the objects array...
	for(let i = 0; i < objects.length; i++) {
		let o = objects[i];
		// Get the type of it, and draw something different based on said type.
		switch(o["type"]) {
			case "window":
				// (x, y, width, height)
				// gray base
				ctx.fillStyle = "black";
				ctx.fillRect(o["x"]-o["width"]+1, o["y"]-o["height"]+1, (o["width"]*2+1), (o["height"]*2)+2-1);
				ctx.fillStyle = "darkgray";
				ctx.fillRect(o["x"]-o["width"]+1, o["y"]-o["height"]+1, (o["width"]*2), (o["height"]*2));
				ctx.fillStyle = "white";
				ctx.fillRect(o["x"]-o["width"]+1, o["y"]-o["height"]+1, (o["width"]*2)-1, (o["height"]*2)-1);
				ctx.fillStyle = "lightgray";
				ctx.fillRect(o["x"]-o["width"]+2, o["y"]-o["height"]+2, (o["width"]*2)-2, (o["height"]*2)-2);
				// red gradient
				var gradient = ctx.createLinearGradient(o["x"]-o["width"]+2, o["y"]-o["height"]+3, o["x"]+o["width"]+2, o["y"]+o["height"]+3);
				gradient.addColorStop(0, "#dd0000");
				gradient.addColorStop(1, "#000000");
				ctx.fillStyle = gradient;
				ctx.fillRect(o["x"]-o["width"]+4, o["y"]-o["height"]+4, o["width"]*2-6, 19);
				// title (todo: write a custom function for writing fonts)
				ctx.fillStyle = "white";
				ctx.font = "bold 12px sans-serif";
				drawChars(o["title"], o["x"]-(o["title"].length*3), o["y"]-o["height"]+6, 1, 1);
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
						draw_textbox(o["x"]-o["width"]+6, o["y"]-o["height"]+25, o["width"]*2-10, o["height"]*2-58);
						ctx.fillStyle = "black";
						for(let i = 0; i <= o["texts"][0].length; i++) {
							let k = o["texts"][0].charAt(i);
							switch(k) {
								case "\n":
									cursorPosY += 12;
									cursorPosX = -8;
								default:
									let tmpCPY = o["y"]-o["height"]+35+cursorPosY+(shiftY*12);
									if(tmpCPY <= o["y"]-o["height"]+12 || tmpCPY >= o["height"]*2-24)  {continue;}
									drawChars(k,o["x"]-o["width"]+8+cursorPosX,tmpCPY);
									//ctx.fillText(k, o["x"]-o["width"]+8+cursorPosX, o["y"]-o["height"]+35+cursorPosY);
									cursorPosX += 8;
									if(cursorPosX >= 384) {cursorPosX = 0; cursorPosY += 12;}
							}
						}
						// scrollbar 
						ctx.fillStyle = 'lightgray';
						if(termHeight > 27) ctx.fillRect(o["x"]+o["width"]-22,o["y"]-o["height"]+35-(o["height"]*2/(termHeight/shiftY)),16,(o["height"]*1.69/termHeight)*-1);
						// small box
						draw_textbox(o["x"]-o["width"]+6, o["y"]+o["height"]-26, o["width"]*2-10, 18);
						ctx.fillStyle = "black";
						drawChars(o["texts"][1], o["x"]-o["width"]+8, o["y"]+o["height"]-24);
				}
				break;
			default:
				ctx.fillStyle = o.fillStyle;
				ctx.fillRect(o["x"]-o["width"], o["y"]-o["height"], o["width"]*2, o["height"]*2);
				break;
		}
	}
}

// Draw a textbox with the border.
export function draw_textbox(x,y,width,height) {
	ctx.fillStyle = "gray";
	ctx.fillRect(x-1, y-1, width+2, height+2);
	ctx.fillStyle = "black";
	ctx.fillRect(x, y, width+1, height+1);
	ctx.fillStyle = "white";
	ctx.fillRect(x, y, width, height);
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
