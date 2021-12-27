import { objects } from '../main.js';

export async function dropdown(x,y,sid,list,command="",arg1="",arg2="") {
	// TODO: make it so a dropdown disappears when the mouse moves away from it.
	// this for loop mostly uses the index anyways so just use for
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
	list.forEach(function(l) {
		let name = (l["prettyname"] || l["name"] || l.get("prettyname")|| l.get("name"));
		if(name.length*8 >= width) {width = name.length*8}
	});
	// Then we initialize the dropdown object with default values.
	let dropdown = {"id":objects.length,"sid":sid,"type":"dropdown","x":x+width/2+2,"y":y+height,"width":width/2+2,"height":height,"z":9999,"event_num":list.length, "events":[], "z":objects.length};
	// then we loop that list again and add the entries to that dropdown.
	list.forEach(function(l) {
		let name = (l["prettyname"] || l["name"] || l.get("prettyname")|| l.get("name"));
		// this would normally be put in a function but it would be weird and slower
		// to do that because of {index}, which means we would need to remake it every loop.
		let arg1_ = arg1.replace("{index}",list.indexOf(l),1).replace("{name}",name,1);
		let arg2_ = arg2.replace("{index}",list.indexOf(l),1).replace("{name}",name,1);
		dropdown.events.push({"type":"flat","anchor":"negative","x":3,"y":y_,"width":width,"height":15,"active":0,"hover":0,"text":name,"command":{"p_command":command,"arg1":arg1_,"arg2":arg2_}})
		y_ += 17;
	});
	objects.push(dropdown);
}