import { objects } from './main.js';

export function loadDefaultObjects() {
	objects.push({"id":"0","type":"box","name":"background","x":0,"y":0,"width":800,"height":600,"fillStyle":"#3a53ab","z":0});
	objects.push({"id":"1","type":"window","name":"terminal","x":400,"y":225,"width":100,"height":100,"fillStyle":"lightgray","z":1});
}