import { objects } from './main.js';
export let canvas = document.querySelector('.draw');
export let ctx = canvas.getContext('2d');
export const WIDTH = 800; export const HEIGHT = 450;
export let mx = 0; export let my = 0;
export let r = 0;
export let mode = 0;

export function draw(array) {
	for(let i = 0; i < objects.length; i++) {
		let o = objects[i];
		ctx.fillStyle = o.fillStyle;
		ctx.fillRect(o["x"]-o["width"], o["y"]-o["height"], o["width"]*2, o["height"]*2);
	}
}
export function example() {
	var gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
	gradient.addColorStop(0, "rgb(255, "+parseInt(0+r)+", 0)");
	gradient.addColorStop(1, "rgb(127, "+parseInt(0+r)+", 255)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 800, 450);
	if(r > 255) {mode = 1};
	if(r < 0) {mode = 0};
	if(mode == 0) {r++} else {r--};
	ctx.fillStyle = "rgb(255,0,0)";
	ctx.fillRect(mx, my, mx+16, my+16);
}

document.addEventListener("mousemove", function(e) {
	mx = e.clientX; my = e.clientY;
})

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
