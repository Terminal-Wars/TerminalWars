import {ctx, ctxFinal, width, height, renderType} from './canvas.js';
import {fatalError} from '../main.js';
import {average} from '../commonFunctions.js';
export async function degradeChunk(x,y,width,height,depth) {
	if(renderType == "2d") {
		let colorBuffer = [];
		let pixels = ctx.getImageData(x, y, width, height); 
		let pixeldata = pixels.data;
		let pixelSkipAhead = 4;
		for(let i = 0; i < pixeldata.length; i += 4) {
			colorBuffer.push(pixeldata[i]+pixeldata[i+1]+pixeldata[i+2]); if(colorBuffer.length > 2) {colorBuffer.shift();}
			//debugBox4.innerHTML = (colorBuffer[0]+colorBuffer[1]+colorBuffer[2]+colorBuffer[3])/4;
			if(colorBuffer[0] != colorBuffer[1]) {
				pixelSkipAhead = 0;
				pixeldata[i] = Math.floor(pixeldata[i] / (255 / depth)) * (255 / depth);
				pixeldata[i+1] = Math.floor(pixeldata[i+1] / (255 / depth)) * (255 / depth);
				pixeldata[i+2] = Math.floor(pixeldata[i+2] / (255 / depth)) * (255 / depth);
			} else {
				// Skip ahead one pixel, and gradually increase the number of pixels we skip by.
				if(pixeldata[i] == pixeldata[i+pixelSkipAhead]) pixelSkipAhead += 4;
				else pixelSkipAhead = 0;
				i += pixelSkipAhead;
			}
		}
		ctx.putImageData(pixels, x, y);
	} else {
		
	}
}

export async function degrade(depth) {
	const DIVIDE = 4;
	for(let y = -1; y <= DIVIDE; y++) {
		for(let x = 0; x <= DIVIDE; x++) {
			degradeChunk(width/DIVIDE*x,height/DIVIDE*y,width/DIVIDE,height/DIVIDE,depth);
		}
	}
}