import { objects } from './main.js';
import * as c from './canvas.js';

export function loadDefaultObjects() {
	objects.push({"id":"0","type":"desktop","x":0,"y":0,"width":800,"height":600,"color1":"#3a53ab","color2":"#3a53ab","z":0});
	objects.push({"id":"1","type":"window","title":"Terminal","win_type":"text","x":400,"y":225,"width":200,"height":200,"z":1,
				  "texts":{0: "", 1: ""}, "event_num":3,
				  "events": [{"type":"button","anchor": "positive","x":-58,"y":-25,"width":16,"height":16,"active":0,"image":c.term_buttons,"ox":0,"oy":0,
							"command":{"command": "attack"}},
							 {"type":"button","anchor": "positive","x":-39,"y":-25,"width":16,"height":16,"active":0,"image":c.term_buttons,"ox":0,"oy":16,
							"command":{"command": "bag"}},
							 {"type":"button","anchor": "positive","x":-20,"y":-25,"width":16,"height":16,"active":0,"image":c.term_buttons,"ox":0,"oy":32,
							"command":{"command": "user"}}]
							});
}
export function dropdown(x,y,sid,list) {
	for(let n in objects) {
		if(objects[n]["sid"] == sid) {
			objects.splice(n,n);
		}
	}
	let width = 0; let height = list.length*9;
	let y_ = 3;
	// For each item in the list we were given...
	// first we want to get the longest one
	// (todo: oh come on there has to be a better way)
	for(let n in list) {
		if(list[n]["name"].length*8 >= width) {width = list[n]["name"].length*8}
	}
	// Then we initialize the dropdown object with default values.
	let dropdown = {"id":objects.length,"sid":sid,"type":"dropdown","x":x+width/2+2,"y":y+height,"width":width/2+2,"height":height,"z":9999,"event_num":list.length, "events":[]};
	// then we loop that list again and add the entries to that dropdown.
	for(let n in list) {
		dropdown.events.push({"type":"flat","anchor":"negative","x":3,"y":y_,"width":width,"height":15,"active":0,"text":list[n]["name"],"command":{"command": "user"}})
		y_ += 17;
	}
	objects.push(dropdown);
}