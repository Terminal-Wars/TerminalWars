import {notices, fatalError, error} from '../main.js';
import {drawFinal} from '../gfx/canvas.js';
import {userID, roomID} from './commands.js';
import {ping} from './ping.js';
import {dice} from '../battle/dice.js';
import {delay} from '../commonFunctions.js';
import {keyboardBuffer} from '../input/keyboard.js';
import {setOurTurn, initActivePlayers} from '../player/player.js';

let wsproto = window.location.protocol == "https:" ? "wss" : "ws";
const wsurl = wsproto + "://" + window.location.host.replace(":2191","",1) + ":2192";
export let socket = new WebSocket(wsurl);
export let sockerBuffer = []; let buffer, newHealth;
export let lastSpeaker = "";
export let connected = 0; // are we connected to the server?

export async function reload() {console.error("reload() exists to remind you that a websocket server cannot actually be reloaded")};

export class ActionsClass {
  async BufferReturn() {
      return delay(ping).then(function() {
        buffer = sockerBuffer[0];
        sockerBuffer.shift();
        return buffer;
      });
  }
  async GetUsersOnline(room) {
      socket.send(`{"type":"get","data":{"roomID":"${room}","blockID":"${room}_users"}}`);
      return this.BufferReturn();
  }
  async GetUserInfo(room, user) {
      socket.send(`{"type":"get","data":{"roomID":"${room}","blockID":"${room}_users_${user}"}}`);
      return this.BufferReturn();
  }
  async GetBattle(room) {
      socket.send(`{"type": "get","data":{"roomID":"${room}","blockID":"battle"}}`);
      return this.BufferReturn();
  }
  async MemoryDump(room) {
      socket.send(`{"type":"debug","data":{"roomID":"${room}","blockID":"debug"}}`);
      return this.BufferReturn();
  }
}
export const Actions = new ActionsClass;

socket.addEventListener('open', async function (event) {
    console.log("Server open");
});

socket.addEventListener('message', async function (event) {
    let data = JSON.parse(event.data);
    switch(data["type"]) {
      case "broadcast":
        // for readability.
        let speaker = data["data"]["userID"];
        let text = data["data"]["text"];
        if(data["data"]["blank"]) {
          keyboardBuffer.push(speaker+" "+text);
        } else {
          if(speaker == lastSpeaker) {
            keyboardBuffer.push("\xFF"+text);
          } else {
            keyboardBuffer.push("\0\b"+speaker+"\n\xFF"+text);
            lastSpeaker = speaker;
          }
        }
        break;
      case "get":
        sockerBuffer.push(data);
        break;
      case "setturn":
        setOurTurn();
        break;
      case "initplayer":
        initActivePlayers();
        break;
      case "dice":
        dice(20, data["data"]["value"], data["data"]["foe"]);
        break;
      default:
        console.error("Unimplemented function: ",data["type"]);
        break;
    }
});

socket.addEventListener('close', function (event) {
    error("The server was closed. Please wait a moment and then reload the page.");
});

