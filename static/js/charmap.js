import {ctx} from './canvas.js';
import {WIDTH, HEIGHT} from './canvas.js';
export const characters = ["`","1","2","3","4","5","6","7","8","9","0","-","=","~","!","@","#","$","%","^","&","*","(",")","_","+","[","]","\\","{","}","|",";","\'",":","\"",",",".","/","<",">","?","q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m","Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M","à","è","ì","ò","ù","À","È","Ì","Ò","Ù","á","é","í","ó","ú","ý","Á","É","Í","Ó","Ú","Ý","â","ê","î","ô","û","Â","Ê","Î","Ô","Û","ã","ñ","õ","Ã","Ñ","Õ","ä","ë","ï","ö","ü","ÿ","Ä","Ë","Ï","Ö","Ü","Ÿ","å","Å","æ","Æ","œ","Œ","ç","Ç","ð","Ð","ø","Ø","¿","¡","ß",""];
const charmap = new Image(1288,48);
charmap.src = 'static/gfx/charmap.webp';
function drawChar(char, x, y, white=false, bold=false) {
	let mod = white+bold;
	for(let i = 0; i <= char.length; i++) {
		ctx.drawImage(charmap,8*characters.indexOf(char[i]),0+(16*mod),8,16,x+(i*8),y,8,16);
	}
}
export function drawChars(string,x,y,white=false,bold=false,maxX=Infinity,minY=-1*Infinity,maxY=Infinity) {
	let offset = x;
	for(let i in string) {
		let k = string.charAt(i);
		switch(k) {
			case "\n":
				y += 12;
				x = -8+offset;
			default:
				if(y <= minY+12 || y >= maxY-24)  {continue;}
				drawChar(k,x,y,white,bold);
				x += 8;
			if(x >= maxX) {x = 0; y += 12;}
		}
	}
}