import { objects } from './main.js';
export let canvas = document.querySelector('.draw');
export let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled= false;
ctx.mozImageSmoothingEnabled = false;

// The monitor width
export const SWIDTH = screen.width; export const SHEIGHT = screen.height;
// The default, set width
export const WIDTH = 800;
// A temporary variable for the height calculations.
let height = 0;

// The emulated screen width and height, adjusted based on the monitor ratio.
// TODO: There is definitely a mathmatical function to have it automatically be calculated
// and adjusted, but in the interest of having a simple engine demo out it'll just
// adjust to the common ones.
export function gcd(a,b) {if(b==0) {return a;}return gcd(b, a%b);};
console.log(SWIDTH/gcd(SWIDTH, SHEIGHT)+":"+SHEIGHT/gcd(SWIDTH, SHEIGHT));
switch(SWIDTH/gcd(SWIDTH, SHEIGHT)+":"+SHEIGHT/gcd(SWIDTH, SHEIGHT)) {
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

export function draw(array) {
	for(let i = 0; i < objects.length; i++) {
		let o = objects[i];
		switch(o["type"]) {
			case "window":
				// x, y, width, height
				ctx.fillStyle = "black";
				ctx.fillRect(o["x"]-o["width"]+1, o["y"]-o["height"]+1, (o["width"]*2+1), (o["height"]*2)+2-1);
				ctx.fillStyle = "darkgray";
				ctx.fillRect(o["x"]-o["width"]+1, o["y"]-o["height"]+1, (o["width"]*2), (o["height"]*2));
				ctx.fillStyle = "white";
				ctx.fillRect(o["x"]-o["width"]+1, o["y"]-o["height"]+1, (o["width"]*2)-1, (o["height"]*2)-1);
				ctx.fillStyle = "lightgray";
				ctx.fillRect(o["x"]-o["width"]+2, o["y"]-o["height"]+2, (o["width"]*2)-2, (o["height"]*2)-2);
				var gradient = ctx.createLinearGradient(o["x"]-o["width"]+2, o["y"]-o["height"]+3, o["x"]+o["width"]+2, o["y"]+o["height"]+3);
				gradient.addColorStop(0, "#dd0000");
				gradient.addColorStop(1, "#000000");
				ctx.fillStyle = gradient;
				ctx.fillRect(o["x"]-o["width"]+3, o["y"]-o["height"]+3, o["width"]*2-4, 19);
				ctx.fillStyle = "white";
				ctx.font = "bold 12px sans-serif";
				ctx.fillText(o["title"], o["x"]-(o["title"].length*3), o["y"]-o["height"]+16);
				switch(o["win_type"]) {
					case "text":
						ctx.fillStyle = "black";
						ctx.fillRect(o["x"]-o["width"]+3, o["y"]-o["height"]+24, o["width"]*2-4, o["height"]*2-46);
						ctx.fillStyle = "gray";
						ctx.fillRect(o["x"]-o["width"]+4, o["y"]-o["height"]+25, o["width"]*2-5, o["height"]*2-47);
						ctx.fillStyle = "white";
						ctx.fillRect(o["x"]-o["width"]+4, o["y"]-o["height"]+25, o["width"]*2-6, o["height"]*2-48);
				}
				break;
			default:
				ctx.fillStyle = o.fillStyle;
				ctx.fillRect(o["x"]-o["width"], o["y"]-o["height"], o["width"]*2, o["height"]*2);
				break;
		}
	}
}

export function degrade(depth) {
	// Indexing
	let pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT); 
	let pixeldata = pixels.data;
	for(let i = 0; i < pixeldata.length; i += depth/2) {
		for(let n = 0; n < depth/2; n++) {
			pixeldata[i+n] = Math.floor(pixeldata[i+n] / (255 / depth)) * (255 / depth);
		}
	}
	ctx.putImageData(pixels, 0, 0);
}
