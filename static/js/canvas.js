import { objects, objects_dice, debugBox, debugBox2, notices, mousePos } from './main.js';
import { keyboardBuffer } from './keyboard.js';
import { drawChars } from './charmap.js';
import { userID, roomID } from './commands.js';
import { replacePlaceholders } from './commonFunctions.js';
import { globalEvents } from './commonObjects.js';

import { diceblock, dice_font, cursor, testingBG, sad_poopotron } from '../gfx/images.js';

// The rendering method, which is WebGL by default.
export let renderType = "2d";
// The canvas
export let drawBuffer = document.querySelector('.drawBuffer');
export let ctx = drawBuffer.getContext(renderType);
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;

export let drawFinal = document.querySelector('.draw');
export let ctxFinal = drawFinal.getContext(renderType);

// If we can't do webgl, fall back to CPU rendering.
if(ctxFinal === null) {
	renderType = "2d";
	ctx = drawBuffer.getContext(renderType);
	ctxFinal = drawFinal.getContext(renderType);
}

// The default, set width and height.
export const width = 800;
export const height = 600;
// DPI (currently unused, todo: find a way to fix the dpi bug using this)
export let dpi = document.querySelector('#dpi').offsetHeight * (window.devicePixelRatio || 1);
export const DPI_MUL = Math.ceil(dpi/96);

export let sWidth = 0;
export let sHeight = 0;
export let obWidth = 0;
export let obHeight = 0;
export let mul = 1;
export let fWidth = 0;
export let fHeight = 0;
export let ratio = window.devicePixelRatio;
function init() {
	// The monitor width
	sWidth = window.innerWidth; sHeight = window.innerHeight;
	// The remaining width/height
	obWidth = ((sWidth-width)/2); obHeight = ((sHeight-height)/2);
	// The scale multiplier.
	mul = Math.round(sHeight/height);
	if(mul == 0) mul = 1;
	if(ratio >= 1) {ratio = 1}
	// Final width and height after all this.
	fWidth = (width*mul) / ratio; fHeight = (height*mul) / ratio;
}
init();
window.addEventListener('resize',init);

// From here, we'll scale the canvas based on the user's actual screen size.
drawBuffer.width = width; drawBuffer.height = height;
drawFinal.width = width; drawFinal.height = height;
drawFinal.style.width = fWidth+"px"; drawFinal.style.maxWidth = fWidth+"px"; 
drawFinal.style.height = fHeight+"px"; drawFinal.style.maxHeight = fHeight+"px";
//canvas.style.maxWidth = window.innerWidth+"px"; canvas.style.maxHeight = Sheight+"px";

// Any images we need
// todo: make a seperate .json file with all of these in it and just use arrays instead.

// X and Y anchors, seperate from the ones from within the switch case in the drawGFX function.
let xa, ya = 0;

// Some terminal specific variables which need to be global.
export let shiftY = 0; export let termHeight = 1;

// The frame counters
export let frameTime = 0;
export let frameCount = [];
// and we need a function to reset frame time from the other file grahh
export async function resetFrameTime() {frameTime = 0;}

// The ID of the terminal window, for dice rolls.
export let terminalWinID = 0;

// And since variables are imported to other files as consts no matter what,
// we need a function to increase and decrease it from this file.
// todo: clamp function
export function shiftYBy(num) {shiftY += num;}

// Variable that gets set if we run into a fatal error
export let fatalError = 0;

// Common UI elements
class DrawClass {
	async textbox(x, y, width, height,thisCtx=ctx) {
		this.box(x-1, y-1, width+2, height+2,"#808080",thisCtx);
		this.box(x, y, width+1, height+1,"black",thisCtx);
		this.box(x, y, width, height,"white",thisCtx);
	}
	async button(x, y, width, height, content, ox, oy,active,hover,type,enabled) {
		let mode = 0;
		if(typeof enabled == "string") enabled = parseInt(replacePlaceholders(enabled));
		if(enabled == 0) ox += 16;
		if(type == "button") {
			this.box(x-1, y-1, width+2, height+2,"black");
			if(active == 0) {
				this.box(x-1, y-1, width+1, height+1,"white");
				this.box(x, y, width, height,"#dfdfdf");
				this.box(x+1, y+1, width-1, height-1,"#808080");
			} else {
				this.box(x, y, width, height,"#808080");
			}
			this.box(x+1, y+1, width-2, height-2,"#b5b5b5");
		}
		if(type == "flat" || type == "extraflat") { // flat
			mode = 0;
			if(type == "flat" && hover == 1) {
				this.box(x,y,width,height,"#15539e");
				mode = 2;
			}
		}
		//debugBox2.innerHTML = "";
		// Draw either an image or some text
		switch(typeof(content)) {
			case "object": // probably an image. if it's ever otherwise, this will be changed.
				this.image({"image":content,"sx":ox,"sy":oy,"width":width,"height":height,"x":x,"y":y});
				break;
			case "string":
				drawChars({"string":content,"x":x,"y":y,"mode":mode});
				break;
			default:
				//debugBox2.innerHTML = typeof(content);
				break;
		}
	}
	async base(x, y, w, h) {
		this.box(x+1, y+1, (w+1), (h)+1, "black");
		this.box(x+1, y+1, (w), (h), "#808080");
		this.box(x+1, y+1, (w)-1, (h)-1, "white");
		this.box(x+2, y+2, (w)-2, (h)-2, "#b5b5b5");
	}
	// These functions may seem redundant, but having these here allows us
	// to execute them asynchronously, as well as have cleaner code.
	async box(x,y,width,height,fillStyle,thisCtx=ctx) {
		if(renderType == "webgl") {

		} else {
			thisCtx.fillStyle = fillStyle;
			thisCtx.fillRect(x,y,width,height);
		}

	}
	async gradient(x1,y1,x2,y2,width,height,color1,color2) {
		if(renderType == "webgl") {

		} else {
			let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
			gradient.addColorStop(0, color1);
			gradient.addColorStop(1, color2);
			ctx.fillStyle = gradient;
			ctx.fillRect(x1, y1, width, height);
		}
	}
	async image(arr) {
		//image=null,sx=null,sy=null,sWidth=null,sHeight=null,dx=null,dy=null,dWidth=null,dHeight=null,opacity=1
		let image = arr["image"] || null;
		let sx = arr["sx"] || 0;
		let sy = arr["sy"] || 0;
		let sWidth = arr["sWidth"] || arr["width"] || 0;
		let sHeight = arr["sHeight"] || arr["height"] || 0;
		let dx = arr["dx"] || arr["x"] || 0;
		let dy = arr["dy"] || arr["y"] || 0;
		let dWidth = arr["dWidth"] || arr["width"] || 0;
		let dHeight = arr["dHeight"] || arr["height"] || 0;
		let opacity = arr["opacity"] || 1;
		let ctxNew = arr["ctx"] || ctx;
		if(renderType == "webgl") {

		} else {
			if(opacity != 1) ctxNew.globalAlpha = opacity;
			ctxNew.drawImage(image,sx,sy,sWidth,sHeight,dx,dy,dWidth,dHeight);
			if(opacity != 1) ctxNew.globalAlpha = 1;
		}
	}
}
const Draw = new DrawClass();

// The function for drawing objects.
async function draw(o) {
		// If we haven't run into a fatal error
		if(!fatalError) {
			// Try to execute the function.
			try {
				if(o === undefined) {return;} // seemingly 
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
						Draw.gradient(xa_n+2, ya_n+3, xa_p+2, ya_n+3,rw-6, 19,"#cc0000","#000000")
						// title
						drawChars({"string":o["title"], "x":o["x"]-(o["title"].length*3), "y":ya_n+6,"mode":3});
						switch(o["win_type"]) {
							// terminal window
							case "terminal":
								let bigBoxText = document.createElement('canvas'); 
								let box_width = rw-8; let box_height = rh-56;
								bigBoxText.width = box_width; bigBoxText.height = box_height;
								let bigBoxTextCtx = bigBoxText.getContext('2d');
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
								temp();
								// big box
								await Draw.textbox(xa_n+6, ya_n+25, rw-10, rh-58);
								await drawChars({"string":o["texts"][0],"x":4,"y":10+(shiftY*12),"ctx":bigBoxTextCtx});
								// drawChars({"string":o["texts"][0],"x":xa_n+10,"y":ya_n+35+(shiftY*12),"maxX":rw-24,"minY":ya_n+12,"maxY":ya_n+rh-24});
								Draw.image({"image":bigBoxText,"sx":0,"sy":0,"width":box_width,
									"height":box_height,"x":xa_n+6,"y":ya_n+25});
								//canvas.js:185 Uncaught (in promise) TypeError: Failed to execute 'createImageBitmap' on 'Window': The provided value is not of type '(Blob or HTMLCanvasElement or HTMLImageElement or HTMLVideoElement or ImageBitmap or ImageData or OffscreenCanvas or SVGImageElement or VideoFrame)'.

								// scrollbar  (todo: make this work)
								// if(termHeight > 27) Draw.box(xa_p-22,ya_n+35-(rh/(termHeight/shiftY)),16,(o["height"]*1.69/termHeight)*-1,'#b5b5b5');
								// small box
								await Draw.textbox(xa_n+6, ya_p-26, rw-68, 18);
								await drawChars({"string":o["texts"][1],"x":xa_n+8,"y":ya_p-24});
								terminalWinID = o["id"];
								break;
							case "text":
								await Draw.textbox(xa_n+6, ya_n+25, rw-10, rh-29);
								await drawChars({"string":o["text"], "x":xa_n+8,"y":ya_n+27,"maxX":rw-16});
								break;
						}
					break;
					case "desktop":
						//Draw.image(testingBG,0,0,testingBG.width,testingBG.height,0,0,width,height);
						Draw.box(0,0,width,height,o["color1"]);
						//Draw.gradient(0,0,0,height,width,height,o["color1"],o["color2"])
					break;
					case "dropdown":
						Draw.base(xa_n, ya_n, rw, rh);
					break;
					case "dice_layer":
						// This is a slow, but working way, of making sure that the dice objects (which are in a different array)
						// are drawn behind the terminal window. They could just be in the objects array too, but they're in a different
						// one as a sacrifice to make diceUpdate faster.
						for(let i = 0; i <= objects_dice.length; i++) {
			    			draw(objects_dice[i]);
						}
					break;
					case "dice":
						let terminal = objects[terminalWinID];
						async function tmp() {
							let ymod = 0;
							if(o["foe"]) ymod = 48;
							Draw.image({"image":diceblock,"sy":ymod,"width":16,"height":16,"x":o["x"]+terminal["x"],"y":o["y"]+(terminal["y"]-terminal["height"]),"opacity":o["opacity"]});
							ctx.globalCompositeOperation = "soft-light";
							async function drawDice() {await drawChars({"string":`${o["value"]}`,"x":o["x"]+terminal["x"],"y":o["y"]+(terminal["y"]-terminal["height"]),"opacity":o["opacity"]})}; 
							// we do drawDice twice as a hack to make the text more visible.
							drawDice().then(drawDice()).then(function() {
								ctx.globalCompositeOperation = "source-over";
							});
						}
						tmp();
					break;
					case "shortcut":
						Draw.image({"image":o["icon"],"width":o["width"],"height":o["height"],"x":o["x"],"y":o["y"]});
						Draw.box(o["x"]-o["text"].length-1,o["y"]+36,2+o["text"].length*8,16,"#feffb3");
						await drawChars({"string":o["text"],"x":(o["x"]-o["text"].length),"y":o["y"]+36,"mode":0});
					break;
					case "mouse":
					break; // it's handled below.
					default:
						await Draw.box(xa_n, ya_n, rw, rh,o["fillStyle"]);
						if(o.text != undefined) {
							await drawChars({"string":o.text,"x":xa_n+3,"y":ya_n+3,"opacity":o["opacity"]});
						}
					break;
				}
				// Draw any button events here.
				for(let i = 0; i < o["event_num"]; i++) {
					let e = o["events"][i];
					// Bit of a bizarre way of doing things, but it's less messy.
					if(e["anchor"] == "positive") {xa = o["x"]+o["width"]; ya = o["y"]+o["height"];}
					if(e["anchor"] == "negative") {xa = o["x"]-o["width"]; ya = o["y"]-o["height"]};
					if(e["anchor"] == "posneg") {xa = o["x"]+o["width"]; ya = o["y"]-o["height"];}
					if(e["anchor"] == "negpos") {xa = o["x"]-o["width"]; ya = o["y"]+o["height"]};
					if(e["anchor"] == "none") {xa = o["x"]; ya = o["y"]}
					Draw.button(xa+e["x"],ya+e["y"],e["width"],e["height"],(e["image"]||e["text"]||""),(e["ox"]||0),(e["oy"]||0),e["active"],e["hover"],e["type"],e["enabled"]);
				}
			} catch(ex) {
				document.querySelector('.error').style.display = 'block';
				document.querySelector('.error span').innerHTML = ex.stack.replace(/\n/g,"<br>",4);
				fatalError = 1;
			}
		}
}

export async function mouse() {
	if(!fatalError) {
		let mouse = objects[1];
		mouse["x"] = mousePos["x"];
		mouse["y"] = mousePos["y"];
		Draw.image({"image":cursor,"width":8,"height":8,"x":mouse["x"],"y":mouse["y"]});
	}

}

export async function drawGFX() {
	// refresh the dpi
	dpi = document.querySelector('#dpi').offsetHeight * (window.devicePixelRatio || 1);
	// display an error message if it's above 96
	if(dpi > 96) {notices.innerHTML = "Please zoom in or out to make the game look right.<br><em>On higher DPI screens the game will never look right due to a bug.</em>"} else {notices.innerHTML = "";}
	// for each object...
	for(let i = 0; i <= objects.length; i++) {
		// draw it
		await draw(objects[i]);
	}
	// The mouse is drawn seperately to ensure it's never below anything.
	await mouse();
	// Finally, draw everything we've drawn to the actual frame.
	Draw.image({"image":drawBuffer,"width":drawBuffer.width,"height":drawBuffer.height,"ctx":ctxFinal});
	frameTime++;
}

