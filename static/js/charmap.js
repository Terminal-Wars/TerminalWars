import {ctx} from './canvas.js';
import {WIDTH, HEIGHT} from './canvas.js';
export const characters = ["`","1","2","3","4","5","6","7","8","9","0","-","=","~","!","@","#","$","%","^","&","*","(",")","_","+","[","]","\\","{","}","|",";","\'",":","\"",",",".","/","<",">","?","q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m","Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M","à","è","ì","ò","ù","À","È","Ì","Ò","Ù","á","é","í","ó","ú","ý","Á","É","Í","Ó","Ú","Ý","â","ê","î","ô","û","Â","Ê","Î","Ô","Û","ã","ñ","õ","Ã","Ñ","Õ","ä","ë","ï","ö","ü","ÿ","Ä","Ë","Ï","Ö","Ü","Ÿ","å","Å","æ","Æ","œ","Œ","ç","Ç","ð","Ð","ø","Ø","¿","¡","ß",""];
const charmapNormal = new Image(1288,64);
const charmapSmall = new Image(1288,40);
charmapNormal.src = 'static/gfx/charmap_normal.webp';
charmapSmall.src = 'static/gfx/charmap_small.webp';
let charmap;
let lineHeight;

// Mode Table:
// 0: black 12px normal
// 1: black 12px bold
// 2: white 12px normal
// 3: white 12px bold
// 4: black 10px normal
// 5: black 10px bold
// 6: white 10px normal
// 7: white 10px bold

async function drawChar(char, x, y, mode=0) {
	if(mode >= 4) {lineHeight = 10; charmap = charmapSmall; mode -= 4;} else {lineHeight = 16; charmap = charmapNormal;}
	for(let i = 0; i <= char.length; i++) {
		ctx.drawImage(charmap,8*characters.indexOf(char[i]),0+(lineHeight*mode),8,lineHeight,x+(i*8),y,8,lineHeight);
	}
}
export async function drawChars(string,x,y,mode=1,maxX=Infinity,minY=-1*Infinity,maxY=Infinity) {
	let offset = x;
	for(let i in string) {
		let k = string.charAt(i);
		switch(k) {
			case "\n":
				y += 12;
				x = -8+offset;
			default:
				if(y <= minY+12 || y >= maxY-24)  {continue;}
				await drawChar(k,x,y,mode);
				x += 8;
			if(x >= offset+maxX) {x = offset; y += 12;}
		}
	}
}