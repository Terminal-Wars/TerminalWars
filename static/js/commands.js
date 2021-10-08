import {socket, Actions, delay} from './socket.js';
import {keyboardBuffer} from './keyboard.js';
import {WIDTH, HEIGHT} from './canvas.js';
import {ping, pingSite} from './ping.js';
import {dropdown, dice} from './commonObjects.js';
import {mousePos, Objects} from './main.js';
export let userID = "ioi"; export let roomID = "room"; 
export let shakeNum = 0; export let usersInRoom;

let exampleUser = [{
	"ownerID": "ioi",
	"userID": "8-BIT",
	"aggressive": "true", // this actually specifies whether they can fight in battles or not, not how violently they fight. 
	"hp": 20,
	// every value after this is an optional value, and will have a default.
	"diceType": 20,
	"diceAmount": 1,
	"diceModAttack": 0,
	"diceModDefense": -5, // There will still be a passive block, but this will be necessary for any dice related passives.
	"bio": "8-BIT is a loaded arcade machine, both in the lethal sense, and the literal sense. He's heavy, and moves slow. Because of this, 8-BIT rolls with a -5 for his defense rolls.",
	"passives": [
		{
			"name": "arcademachine", // The internal version of the name.
			"prettyname": "Arcade Machine", // The prettier version of the name that appears to the player
			"bio": "Roll with a -5 for his defense rolls."
		}
	],
	"actives": [
		{
			"name": "blaster",
			"prettyname": "Blaster Beams",
			"bio": "Shoots a burst of laser beams",
			"instruction": "Rolling a non-damage dealing d20+2. If the d20 connects, roll a 5d10; the difference between your d20 roll and the opponent's defense roll against it is used as a negative modifier to the 5d10's total, with the addition of a 5. The opponent rolls normally to defend the 5d10.",
			"cooldown": 2,
			"on_activate": [
				// For the roll action, we specify the amount, the type, and the modifier.
				{
					0: ["roll",1,20,2,
					// on a successful roll 
					{"success": {
						0: ["roll", 5,10,"(myRoll-enemyRoll)+5",{"success": {
							// For the attack action, we'll specify who to attack (it can be the player themselves) and by how much.
							0: ["attack","{opponent}","myRoll"]
							}}
							]
					}},
					// on a failed roll
					{"failure": {
						0: ["attack","{sender}","myRoll"]
					}}
					]
				}
			]
		},
		{
			"name": "damageboost",
			// {tense:___} is word replacement based on tense. {tense:you} would read as "you" to the player and "them" to the opponent.
			// This would not be useful for attacks sense the opponent can't see them, but it's here as an example.
			"bio": "After dealing 5 damage, drop a trackball booster on the floor, that gives {tense:you} andcallies' attacks 1 additional damage. The booster has 3HP and has a base defense roll of 5.",
			"cooldown": 5,
			"on_activate": [
			{
				0: ["attack","opponent",5],
				// the bot command is basically a user, but they attack automatically.
				// it's not demonstrated here, but a bot can have multiple attacks, and simply attack automatically.
				1: ["bot", {
					"ownerID": "8-BIT",
					"userID": "TrackballBooster", // users can't have duplicate names. if a second trackball booster is created, it will have the number of boosters appended to the end of its name.
					"aggressive": "true",
					"hp": 3,
					"diceType": -1,
					"diceValue": 5, // if a dice type is -1, then a dice value is required.
					"passives": [
						{
							"name": "damageboost",
							"prettyname": "Damage Boost",
							"on_activate": {
								// Edit the values of everyone on the same team.
								0: ["add","{team}","attack",1]
							},
							"on_deactivate": { // On death
								0: ["sub","{team}","attack",1]
							}
						}
					],
					// "optional passives" are something specific to a bot. You can activate one of these before summoning the bot.
					"optional_passives": [
						{
							"name": "pluggedin",
							"pretty_name": "Plugged In",
							"bio": "As long as Damage Booster is still alive, 8-BIT loses the Arcade Machine passive.",
							"on_activate": {
								0: ["disable_passive","{owner}","arcademachine"]
							},
							"on_deactivate": {
								0: ["enable_passive", "{owner}","arcademachine"]
							}
						},
						{
							"pretty_name": "booster",
							"name": "Boosted Booster",
							"bio": "The attack boost is increased by 1 extra additional damage for {tense:you} & {tense:your} allies.",
							"repeat": "damageboost" // you can just have a passive that repeats another one, thereby amplifying it.
						}
					]
				}]
			}
			]
		},
		{
			"group": "cheatcart", // Here we have a group of attacks. It works almost exactly like a regular attack, but it can branch off into two different attacks.
			"prettyname": "Cheat Cartridge",
			"cooldown": 4,
			"limit": 3,
			"bio": "If Damage Booster is still active, you can use this on the opponent's turn to dodge their attack and make the booster take the damage or take the damage for the booster (with the booster's base defense). The booster will not receive double damage from tanking for 8-BIT. This can only be used three times.",
			"attacks": [
				{
					"name":"dodge",
					"on_activate": {
						// change the target of any attack from one person to another. 
						// If there are two trackball boosters on the field, the player can choose which one to defend through a dropdown.
						0: ["move_attack","{sender}","TrackballBooster"]
					}
				},
				{
					"name":"defend",
					"on_activate": {
						// change the target of any attack from one person to another. 
						// If there are two trackball boosters on the field, the player can choose which one to defend through a dropdown.
						1: ["move_attack","TrackballBooster","{sender}"]
					}
				},
			]
		}
	]
}]

// some example attacks
let exampleAttacks = [{"name":"Punch","damage":5},
	{"name":"Kick","damage":3},
	{"name":"Kablammo Zammo","damage":10,"magic":10},
	{"name":"Alakafuckyou","damage":20,"magic":20,"roll":8}];
let exampleActives = [{"name":"Munchies",
					    "description": {
					    	0: "Roll a d20, and if you roll over 10,",
					    	1: "your next attack does double damage,",
					    	2: "and you get double accuracy. Otherwise,",
					    	3: "you get half damage and half accuracy"
					    },
						"roll":20,
						"learn_at_level": 3,
						"on_activate": {
							"at_sender": {
								"multiply": {
									"next_attack": 2,
									"accuracy": 3
								}
							},
							"if roll <= 10": {
								"at_sender": {
									"multiply": {
										"attack": 0.5,
										"accuracy": 0.5
									}
								}
							}
						}},
					  {"name":"Shadow Wall",
						"description": {
							0: "Send a shadow wall at the enemy,",
							1: "lowering their accuracy by 3."},
						"cooldown":5,
						"learn_at_level":5,
						"on_activate": {
							"at_sender": {
								"subtract": {
									"accuracy": 3
								}
							}
						}
					},
					  {"name":"Rainy Day",
						"description": {
							0: "Summon rain for 5 turns,",
							1: "doing 1 damage for each turn",
							2: "to enemies"
						},
						"cooldown":15,
						"learn_at_level":15,
						"while_active": {
							"at_all": {
								"subtract": {
									"hp": 1
								}
							}
						}}]
/*
Shadow Wall
Neon Blitz
Neon Blitz II
Fatherboard
Bloody Hack
Mega Brawl
Haunting
Fourth Wall
Munchies
Bite II
Rainy Day
Scary Laser
Scary Scare
Pouring Mourning

"additional damage
(adds x damage to the total)
roll modifiers
(makes the roll total change positively or negatively according to the modifier)
two dice rolls
(makes the opponent have to win both rolls to avoid getting hit)"
*/
export async function command(cmd, arg1="", arg2="") {
	switch(cmd) {
		/*
		case "put":
			socket.send(`{"type":"put","data":{"roomID":"test","blockID":"test","data":{"${arg1}": "${arg2}"}}}`);
			break;
		case "get":
			socket.send(`{"type":"get","data":{"roomID":"test","blockID":"test"}}`);
			break;
		*/
		case "help":
keyboardBuffer.push(`General commands:
/nick (name) - Set your name. If it's an established nickname in the room you try and join, you will be prompted for a password.
/join (room) - Join a room.
Room-specific commands:
/move (subRoom) - Move to a subroom within a room if you're near it.`);
			break;
		case "nick":
			if (roomID == "") {keyboardBuffer.push("You need to join a room first first.\n")} else {
				userID = arg1;
				socket.send(`{"type":"put","data":{"roomID":"${roomID}","blockID":"user_${userID}","data":{"health": "200", "inroom":"${roomID}"}}}`);
				socket.send(`{"type":"put","data":{"roomID":"${roomID}","blockID":"${roomID}_users","data":{"${userID}":""}}}`);
			}

			break;
		case "join":
			roomID = arg1;
			break;
		case "attackDropdown":
			await dropdown(mousePos["x"],mousePos["y"],"attacks",exampleAttacks);
			break;
		case "attack":
			Objects.destroyAll("dropdown");
			usersInRoom = await Actions.GetUsersOnline(roomID);
			for (const user in usersInRoom["data"]["data"]) {
				if(user != userID) {await Actions.Attack(user, userID, roomID, arg1);}
			}
			break;
		case "ping":
			await pingSite().then(function() {
				keyboardBuffer.push("Pong! "+ping+"\n");
			});
			break;
		case "bag":
			break;
		case "user":
			break;
		case "list":
			usersInRoom = await Actions.GetUsersOnline(roomID);
			async function temp() {for (const user in usersInRoom["data"]["data"]) {
				keyboardBuffer.push(user+"\n");
			}};
			await temp();
			break;
		case "dice":
			await dice();
			break;
		case "shake":
			shakeNum = 10;
			break;
		case "testt":
			for(let i = 0; i <= 150; i++) {keyboardBuffer.push(i+"\n");}
			break;
		default: 
			keyboardBuffer.push("Invalid or unimplemented command.\n");
			break;
	}
}