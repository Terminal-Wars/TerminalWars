import { particles } from './main.js';
import { ctx, WIDTH, HEIGHT } from './canvas.js';
import { drawChars } from './charmap.js';

export function rand(num) {return Math.random() * num;}
let ymod = 5;

export async function drawParticles() {
	for(let i = 0; i < particles.length; i++) {
		particles[i]["x"] += 2*particles[i]["modx"];
		particles[i]["y"] += (1*particles[i]["mody"])*ymod;
		ctx.fillStyle = particles[i]["fill"];
		ctx.fillRect(particles[i]["x"]-5,particles[i]["y"]-5,10,10);
	}
}