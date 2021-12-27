import {debugBox2} from '../main.js';
import {ctx} from './canvas.js';
import {socket} from '../core/socket.js'; // ??? ????????? ?????????????? this can't be removed by the way????????
export let characters = ["`","1","2","3","4","5","6","7","8","9","0","-","=","~","!","@","#","$","%","^","&","*","(",")","_","+","[","]","\\","{","}","|",";","\'",":","\"",",",".","/","<",">","?","q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m","Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M","à","è","ì","ò","ù","À","È","Ì","Ò","Ù","á","é","í","ó","ú","ý","Á","É","Í","Ó","Ú","Ý","â","ê","î","ô","û","Â","Ê","Î","Ô","Û","ã","ñ","õ","Ã","Ñ","Õ","ä","ë","ï","ö","ü","ÿ","Ä","Ë","Ï","Ö","Ü","Ÿ","å","Å","ç","Ç","ð","Ð","ø","Ø","¿","¡","ß"," ",""];
export let charlength = [ 3,  4,  6,  6,  7,  6,  6,  6,  6,  6,  6,  4,  8,  7,  7,  6,  8,  6,  8,  5,  8,  4,  7,  6,  8,  6,  5,  5,  2,   2,  2,  4,  4,  2,   1,  6,   6,  2,  6,  6,  8,  6,  4,  8,  5,  4,  4,  6,  6,  4,  6,  6,  6,  5,  6,  6,  6,  6,  3,  6,  4,  6,  7,  6,  6,  6,  7,  8,  8,  8,  8,  8,  7,  8,  8,  2,  7,  8,  8,  7,  7,  7,  7,  7,  7,  7,  8,  8,  5,  6,  4,  6,  8,  8,  6,  4,  8,  7,  5,  6,  6,  8,  8,  5,  6,  4,  6,  6,  7,  7,  6,  4,  8,  7,  7,  5,  7,  8,  8,  8,  8,  8,  5,  7,  7,  8,  6,  8,  6,  2,  7,  8,  8,  5,  6,  4,  6,  6,  6,  8,  7,  4,  8,  7,  7,  5,  8,  5,  7,  6,  8,  6,  8,  5,  2,  8,  8,0];
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

async function drawChar(char, x, y, mode=0,opacity,ctxNew) {
	if(opacity != 1) ctxNew.globalAlpha = opacity;
	ctxNew.drawImage(charmap,8*characters.indexOf(char),0+(16*mode),8,16,x,y,8,16);
	if(opacity != 1) ctxNew.globalAlpha = 1;
}
export async function drawChars(arr) {
	let string = (arr["string"] || "");
	let x = (arr["x"]||0);
	let y = (arr["y"]||0);
	let mode = (arr["mode"]||0);
	let maxX = (arr["maxX"]||Infinity);
	let minY = (arr["minY"]||-1*Infinity);
	let maxY = (arr["maxY"]||Infinity);
	let opacity = (arr["opacity"]||1);
	let ctxNew = (arr["ctx"]||ctx);
	let offset = x;
	let omode = mode;
	for(let i in string) {
		let k = string.charAt(i);
		let k_last = string.charAt(i-1);
		let k_next = string.charAt(i+1);
		switch(k) {
			// Newline
			case "\n":
			case "\r":
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
				ctxNew.drawImage(tempUserImage,0,0,32,32,x,y,32,32);
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
			case " ":
				if(x != offset) x += 8;
				break;
			default:
				if(y <= minY || y >= maxY)  {continue;}
				if(x >= offset+maxX-8 && k_last != " ") {
					drawChar("-",x,y,mode,opacity,ctxNew);
					x = offset;
					y += 16;
					drawChar(k,x,y,mode,opacity,ctxNew)
				}
				else if(x >= offset+maxX-8 && k_last == " ") {
					x = offset;
					y += 16;
					drawChar(k,x,y,mode,opacity,ctxNew)
				}
				else {
					drawChar(k,x,y,mode,opacity,ctxNew)
				}
				x += charlength[characters.indexOf(k)]+1;
				break;
		}
		if(x >= offset+maxX) {x = offset; y += 16;}
	}
}