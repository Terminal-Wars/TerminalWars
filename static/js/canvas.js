import { objects, objects_dice, debugBox, debugBox2, notices, mousePos } from './main.js';
import { keyboardBuffer } from './keyboard.js';
import { drawChars } from './charmap.js';
import { userID, roomID } from './commands.js';
import { replacePlaceholders } from './commonFunctions.js';
// The canvas
export let cO = document.querySelector('.draw');
export let ctx = cO.getContext('2d');
ctx.imageSmoothingEnabled = false;

//ctx.mozImageSmoothingEnabled = false;

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
export let mul = 0;
export let fWidth = 0;
export let fHeight = 0;

function init() {
	// The monitor width
	sWidth = window.innerWidth; sHeight = window.innerHeight;
	// The remaining width/height
	obWidth = ((sWidth-width)/2); obHeight = ((sHeight-height)/2);
	// The scale multiplier.
	mul = Math.floor(sHeight/height);
	// Final width and height after all this.
	fWidth = (width*mul); fHeight = (height*mul);
}
init();
window.addEventListener('resize',init);

// From here, we'll scale the canvas based on the user's actual screen size.
cO.width = width; cO.height = height;
cO.style.width = fWidth+"px"; cO.style.maxWidth = fWidth+"px"; 
cO.style.height = fHeight+"px"; cO.style.maxHeight = fHeight+"px";
//canvas.style.maxWidth = window.innerWidth+"px"; canvas.style.maxHeight = Sheight+"px";

// Any images we need
// todo: make a seperate .json file with all of these in it and just use arrays instead.
export const diceblock = new Image();
diceblock.src = 'static/gfx/diceblock.webp';
export const dice_font = new Image();
dice_font.src = 'static/gfx/dice_font.webp';

// X and Y anchors, seperate from the ones from within the switch case in the drawGFX function.
let xa, ya = 0;

// Some terminal specific variables which need to be global.
export let shiftY = 0; export let termHeight = 1;


// The frame counter. This is an array so that we can modify it from other files.
export let frameCount = [0];

// The ID of the terminal window, for dice rolls.
export let terminalWinID = 0;

// And since variables are imported to other files as consts no matter what,
// we need a function to increase and decrease it from this file.
// todo: clamp function
export function shiftYBy(num) {shiftY += num;}

// Common UI elements
class DrawClass {
	async textbox(x, y, width, height) {
		await this.box(x-1, y-1, width+2, height+2,"#808080");
		await this.box(x, y, width+1, height+1,"black");
		await this.box(x, y, width, height,"white");
	}
	async button(x, y, width, height, content, ox, oy,active,hover,type,enabled) {
		let mode = 0;
		if(typeof enabled == "string") enabled = parseInt(replacePlaceholders(enabled));
		if(enabled == 0) ox += 16;
		if(type == "button") {
			await this.box(x-1, y-1, width+2, height+2,"black");
			if(active == 0) {
				await this.box(x-1, y-1, width+1, height+1,"white");
				await this.box(x, y, width, height,"#dfdfdf");
				await this.box(x+1, y+1, width-1, height-1,"#808080");
			} else {
				await this.box(x, y, width, height,"#808080");
			}
			await this.box(x+1, y+1, width-2, height-2,"#b5b5b5");
		}
		if(type == "flat" || type == "extraflat") { // flat
			mode = 0;
			if(type == "flat" && hover == 1) {
				await this.box(x,y,width,height,"#15539e");
				mode = 2;
			}
		}
		//debugBox2.innerHTML = "";
		// Draw either an image or some text
		switch(typeof(content)) {
			case "object": // probably an image. if it's ever otherwise, this will be changed.
				await this.image(content,ox,oy,width,height,x,y,width,height);
				break;
			case "string":
				await drawChars(content,x,y,mode);
				break;
			default:
				//debugBox2.innerHTML = typeof(content);
				break;
		}
	}
	async base(x, y, w, h) {
		await this.box(x+1, y+1, (w+1), (h)+1, "black");
		await this.box(x+1, y+1, (w), (h), "#808080");
		await this.box(x+1, y+1, (w)-1, (h)-1, "white");
		await this.box(x+2, y+2, (w)-2, (h)-2, "#b5b5b5");
	}
	// These functions may seem redundant, but having these here allows us
	// to execute them asynchronously, as well as have cleaner code.
	async box(x,y,width,height,fillStyle) {
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
	async image(image=null,sx=null,sy=null,sWidth=null,sHeight=null,dx=null,dy=null,dWidth=null,dHeight=null,opacity=1) {
		ctx.globalAlpha = opacity;
		ctx.drawImage(image,sx,sy,sWidth,sHeight,dx,dy,dWidth,dHeight);
		ctx.globalAlpha = 1;
	}
}
const Draw = new DrawClass();

// The function for drawing objects.
async function draw(o) {
		frameCount[0]++; 
		if(o === undefined) {return;}
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
				await drawChars(o["title"], o["x"]-(o["title"].length*3), ya_n+6,3);
				switch(o["win_type"]) {
					// terminal window
					case "terminal":
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
						await drawChars(o["texts"][0],xa_n+8,ya_n+35+(shiftY*12),0,rw-40,ya_n+24,ya_n+rh-52);
						// scrollbar 
						if(termHeight > 27) await Draw.box(xa_p-22,ya_n+35-(rh/(termHeight/shiftY)),16,(o["height"]*1.69/termHeight)*-1,'#b5b5b5');
						// small box
						await Draw.textbox(xa_n+6, ya_p-26, rw-68, 18);
						await drawChars(o["texts"][1], xa_n+8,ya_p-24);
						terminalWinID = o["id"];
						break;
					case "text":
						await Draw.textbox(xa_n+6, ya_n+25, rw-10, rh-29);
						await drawChars(o["text"], xa_n+8,ya_n+27,0,rw-16);
						break;
				}
			break;
			case "desktop":
				await Draw.box(0,0,width,height,o["color1"]);
				//await Draw.gradient(0,0,0,height,width,height,o["color1"],o["color2"])
			break;
			case "dropdown":
				await Draw.base(xa_n, ya_n, rw, rh);
			break;
			case "dice_layer":
				// This is a slow, but working way, of making sure that the dice objects (which are in a different array)
				// are drawn behind the terminal window. They could just be in the objects array too, but they're in a different
				// one as a sacrifice to make diceUpdate faster.
				for(let i = 0; i <= objects_dice.length; i++) {
	    			await draw(objects_dice[i]);
				}
			break;
			case "dice":
				let terminal = objects[terminalWinID];
				async function tmp() {
					let ymod = 0;
					if(o["foe"]) ymod = 48;
					Draw.image(diceblock,0,0+ymod,16,16,o["x"]+terminal["x"],o["y"]+(terminal["y"]-terminal["height"]),16,16,o["opacity"]);
					ctx.globalCompositeOperation = "soft-light";
					async function drawDice() {drawChars(`${o["value"]}`,o["x"]+terminal["x"],o["y"]+(terminal["y"]-terminal["height"]),1,Infinity,-1*Infinity,Infinity,o["opacity"])}; 
					// we do drawDice twice as a hack to make the text more visible.
					drawDice().then(drawDice()).then(function() {
						ctx.globalCompositeOperation = "source-over";
					});
				}
				await tmp();
			break;
			case "shortcut":
				await Draw.image(o["icon"],0,0,32,32,o["x"],o["y"],o["width"],o["height"]);
				await Draw.box(o["x"]-o["text"].length-1,o["y"]+36,2+o["text"].length*8,16,"#feffb3");
				await drawChars(o["text"],(o["x"]-o["text"].length),o["y"]+36,0);
			break;
			case "mouse":
			break; // it's handled below.
			default:
				await Draw.box(xa_n, ya_n, rw, rh,o["fillStyle"]);
				if(o.text != undefined) {
					await drawChars(o.text,xa_n+3,ya_n+3,Infinity,-1*Infinity,Infinity,o["opacity"]);
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
			await Draw.button(xa+e["x"],ya+e["y"],e["width"],e["height"],(e["image"]||e["text"]||""),(e["ox"]||0),(e["oy"]||0),e["active"],e["hover"],e["type"],e["enabled"]);
		}
}

export async function mouse() {
	let mouse = objects[1];
	mouse["x"] = mousePos["x"];
	mouse["y"] = mousePos["y"];
	await Draw.box(mouse["x"],mouse["y"],16,16,mouse["fill"]);
	frameCount[0]++;
}

export async function drawGFX() {
	dpi = document.querySelector('#dpi').offsetHeight * (window.devicePixelRatio || 1);
	if(dpi > 96) {notices.innerHTML = "Please zoom in or out to make the game look right."} else {notices.innerHTML = "";}
	for(let i = 0; i <= objects.length; i++) {
		await draw(objects[i]);
	}
	// The mouse is drawn seperately to ensure it's never below anything.
	//await mouse();
}

