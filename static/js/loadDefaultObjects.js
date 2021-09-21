import { objects } from './main.js';

export function loadDefaultObjects() {
	objects.push({"id":"0","type":"box","x":0,"y":0,"width":800,"height":600,"fillStyle":"#3a53ab","z":0});
	objects.push({"id":"1","type":"window","title":"Terminal","win_type":"text","x":400,"y":225,"width":200,"height":200,"z":1,
				  "texts":{0: "g\nt", 1: ""}});
}