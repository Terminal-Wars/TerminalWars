// Get the main objects array
import { objects } from './main.js';
// The canvas
export let canvas = document.querySelector('.draw');
export let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled= false;
ctx.mozImageSmoothingEnabled = false;

// The monitor width
export const SWIDTH = screen.width; export const SHEIGHT = window.innerHeight;
// The default, set width
export const WIDTH = 800;
// A temporary variable for the height calculations.
let height = 0;

// The emulated screen width and height, adjusted based on the monitor ratio.
// TODO: There is definitely a mathmatical function to have it automatically be calculated
// and adjusted, but in the interest of having a simple engine demo out it'll just
// adjust to the common ones.
export function gcd(a,b) {if(b==0) {return a;}return gcd(b, a%b);};
export const RATIO = gcd(SWIDTH, SHEIGHT);
switch(SWIDTH/RATIO+":"+SHEIGHT/RATIO) {
	case "4:3":
		height = 600;
		break;
	case "21:9":
		height = 342.86;
		break;
	// 16:10; not standard but my laptop uses it i might as well 
	case "8:5":
		height = 500;
		break;
	default:
	case "16:9":
		height = 450;
		break;
}
console.log(height);
// (because i guess we can't just have it be exported from within the switch case)
export const HEIGHT = height;

// The draw function.
export async function draw(array) {
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
				ctx.fillText(o["title"], o["x"]-(o["title"].length*3), o["y"]-o["height"]+17);
				switch(o["win_type"]) {
					// terminal window
					case "text":
						let cursorPosX = 0; let cursorPosY = 0;
						ctx.font = "10px sans-serif";
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
									ctx.fillText(k, o["x"]-o["width"]+8+cursorPosX, o["y"]-o["height"]+35+cursorPosY);
									cursorPosX += 8;
							}
						}
						// small box
						draw_textbox(o["x"]-o["width"]+6, o["y"]+o["height"]-26, o["width"]*2-10, 18);
						ctx.fillStyle = "black";
						ctx.fillText(o["texts"][1], o["x"]-o["width"]+8, o["y"]+o["height"]-15);
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
