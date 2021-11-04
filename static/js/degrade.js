import {ctx, width, height, fatalError} from './canvas.js';
import {debugBox} from './main.js';
export async function degradeChunk(x,y,width,height,depth) {
	let colorBuffer = [];
	let pixels = ctx.getImageData(x, y, width, height); 
	let pixeldata = pixels.data;
	for(let i = 0; i < pixeldata.length; i += 4) {
		colorBuffer.push(pixeldata[i]+pixeldata[i+1]+pixeldata[i+2]); if(colorBuffer.length > 2) {colorBuffer.shift();}
		if(colorBuffer[0] != colorBuffer[1]) {
			pixeldata[i] = Math.floor(pixeldata[i] / (255 / depth)) * (255 / depth);
			pixeldata[i+1] = Math.floor(pixeldata[i+1] / (255 / depth)) * (255 / depth);
			pixeldata[i+2] = Math.floor(pixeldata[i+2] / (255 / depth)) * (255 / depth);
		} else {
			// Skip ahead one pixel.
			// !!! You would think that gradually increasing the number of pixels it skips ahead by,
			// and checking the pixels in between that number, would be faster. For reasons I'm not
			// sure of, this simply isn't the case. It makes no difference. todo: figure out why the fuck
			i += 4;
		}
	}
	ctx.putImageData(pixels, x, y);
}

export async function degrade(depth) {
	if(!fatalError) {
		const DIVIDE = 4;
		for(let y = 0; y <= DIVIDE; y++) {
			for(let x = 0; x <= DIVIDE; x++) {
				await degradeChunk(width/DIVIDE*x,height/DIVIDE*y,width/DIVIDE,height/DIVIDE,depth);
			}
		}
	}
}