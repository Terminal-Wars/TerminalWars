import {objects} from './main.js';

// relevant images
export const term_buttons = new Image();
term_buttons.src = 'static/gfx/term_buttons.webp';

export async function terminal() {
	objects.push({"id":objects.length,"type":"window","title":"Terminal","win_type":"terminal","x":400,"y":225,"width":200,"height":200,"z":objects.length+1,
		"texts":{0: "", 1: ""}, "event_num":3,
		"events": [{"type":"button","anchor": "positive","x":-58,"y":-25,"width":16,"height":16,"active":0,"hover":0,"enabled":"{ourTurn}","image":term_buttons,"ox":0,"oy":0,
			"command":{"command": "activeDropdown"}},
			{"type":"button","anchor": "positive","x":-39,"y":-25,"width":16,"height":16,"active":0,"hover":0,"enabled":"{loggedIn}","image":term_buttons,"ox":0,"oy":16,
			"command":{"command": "bag"}},
			{"type":"button","anchor": "positive","x":-20,"y":-25,"width":16,"height":16,"active":0,"hover":0,"enabled":"{loggedIn}","image":term_buttons,"ox":0,"oy":32,
			"command":{"command": "switch"}}]
	});
}

export async function about() {
	objects.push({"id":objects.length,"type":"window","title":"About","text":"TerminalWars is an attempt to\ncreate a multiplayer D&D-like\nexperience that is less serious,\nand focused more on comedy. While\nthe game can certainly be played\nseriously, thanks to it's extensive character creation system, campaignscan also be stupid simple, because\nwhen creating a character there are three values that are actually\nrequired. Furthermore, while the\nexperience of a text adventure is\nretained, players can also have\nimages next to their name. They're\nalso able to create minigames using PICO-8, and make people play them aspart of their attack. While you haveto use your imagination, you can\nalso express your character visuallytoo.\n\nThe game is currently in \bearly\n\balpha.\x01 Please report any bugs you \nfind to the below url:\n\nwww.github.com/IoIxD/TerminalWars/issues","win_type":"text","x":150,"y":300,"width":150,"height":250,"z":objects.length+1})
}

// Function for launching programs from arrays in other files (which is most of the time)
export async function launch(name) {
	switch(name) {
		case "terminal":
			await terminal();
			break;
		case "about":
			await about();
			break;
		default:
			break;
	}
}