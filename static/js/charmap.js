import {ctx} from './canvas.js';
import {socket} from './socket.js'; // ??? ????????? ?????????????? this can't be removed by the way????????
export const characters = ["`","1","2","3","4","5","6","7","8","9","0","-","=","~","!","@","#","$","%","^","&","*","(",")","_","+","[","]","\\","{","}","|",";","\'",":","\"",",",".","/","<",">","?","q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m","Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M","à","è","ì","ò","ù","À","È","Ì","Ò","Ù","á","é","í","ó","ú","ý","Á","É","Í","Ó","Ú","Ý","â","ê","î","ô","û","Â","Ê","Î","Ô","Û","ã","ñ","õ","Ã","Ñ","Õ","ä","ë","ï","ö","ü","ÿ","Ä","Ë","Ï","Ö","Ü","Ÿ","å","Å","æ","Æ","œ","Œ","ç","Ç","ð","Ð","ø","Ø","¿","¡","ß",""];
const charmap = new Image(1288,64);
charmap.src = 'static/gfx/charmap.webp';
const tempUserImage = new Image(32,32);
tempUserImage.src = 'static/gfx/temporary_user_icon.webp';
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

async function drawChar(char, x, y, mode=0,opacity) {
	ctx.globalAlpha = opacity;
	for(let i = 0; i <= char.length; i++) {
		ctx.drawImage(charmap,8*characters.indexOf(char[i]),0+(16*mode),8,16,x+(i*8),y,8,16);
	}
	ctx.globalAlpha = 1;
}
export async function drawChars(string,x,y,mode=1,maxX=Infinity,minY=-1*Infinity,maxY=Infinity, opacity=1) {
	let offset = x;
	let omode = mode;
	for(let i in string) {
		let k = string.charAt(i);
		switch(k) {
			// Newline
			case "\n":
				mode = omode;
				y += 16;
				x = offset;
				break;
			// Bold characters
			case "\b":
				mode = 1;
				break;
			// Images (currently one is avaliable)
			case "\0":
				ctx.drawImage(tempUserImage,0,0,32,32,x,y,32,32);
				x += 35;
				break;
			// Indent for images
			case "\xFF":
				x += 35;
				break;
			// Reset all formatting.
			case "\x01":
				mode = 0;
				break;
			default:
				if(y <= minY+16 || y >= maxY-24)  {continue;}
				await drawChar(k,x,y,mode,opacity);
				x += 8;
				break;
		}
		if(x >= offset+maxX) {x = offset; y += 16;}
	}
}