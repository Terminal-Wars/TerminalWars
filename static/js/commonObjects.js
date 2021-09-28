import { objects } from './main.js';
import * as c from './canvas.js';
export function loadDefaultObjects() {
	objects.push({"id":"0","type":"box","x":0,"y":0,"width":800,"height":600,"fillStyle":"#3a53ab","z":0});
	objects.push({"id":"1","type":"window","title":"Terminal","win_type":"text","x":400,"y":225,"width":200,"height":200,"z":1,
				  "texts":{0: "", 1: ""}, "event_num":3,
				  "events": {0: {"anchor": "positive","x":-58,"y":-25,"width":16,"height":16,"active":0,"image":c.term_buttons,"ox":0,"oy":0,
							"command":{"command": "attack"}},
							 1: {"anchor": "positive","x":-39,"y":-25,"width":16,"height":16,"active":0,"image":c.term_buttons,"ox":0,"oy":16,
							"command":{"command": "bag"}},
							 2: {"anchor": "positive","x":-20,"y":-25,"width":16,"height":16,"active":0,"image":c.term_buttons,"ox":0,"oy":32,
							"command":{"command": "user"}}}
							});
}