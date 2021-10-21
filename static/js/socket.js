import {notices} from './main.js';
import {cO} from './canvas.js';
import {userID, roomID} from './commands.js';
import {ping} from './ping.js';
import {delay} from './commonFunctions.js';
import {keyboardBuffer} from './keyboard.js';
import {setOurTurn, advanceTurn} from './player.js';

let wsproto = window.location.protocol == "https:" ? "wss" : "ws";
const wsurl = wsproto + "://" + window.location.host + "/socket";
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
  // TODO: REWRITE THE NEXT THREE FUNCTIONS
  async GetUserInfo(user, room) {
      socket.send(`{"type":"get","data":{"roomID":"${room}","blockID":"${room}_users"}}`);
      let buffer = this.BufferReturn();
  }
  async Attack(foe, user, room, damage) {
      //let userinfo = await this.GetUserInfo(foe, room);
      //newHealth = userinfo["data"]["health"]-damage;
      //socket.send(`{"type":"put","data":{"roomID":"${room}","blockID":"user_${user}","data":{"health":"${newHealth}"}}}`);
      //socket.send(`{"type":"broadcast","data":{"userID":"", "roomID":"${room}", "text":"${user} dealt ${damage} damage to ${foe}!\\n"}}`);
      return 0;
  }
  async GetHealth(user, room) {
      let userinfo = await this.GetUserInfo(user, room);
      await delay(ping).then(function() {
        return userinfo["data"]["health"];
      })
  }
  async GetBattle(room) {
      socket.send(`{"type": "get","data":{"roomID":"${room}","blockID":"battle"}}`);
      return this.BufferReturn();
  }
  async MemoryDump(room) {
      socket.send(`{"type":"get","data":{"roomID":"${room}"}}`);
      return this.BufferReturn();
  }
}
export const Actions = new ActionsClass;

socket.addEventListener('open', async function (event) {
    console.log("Server open");
});

socket.addEventListener('message', async function (event) {
    let data = JSON.parse(event.data);
      if(data["type"] == "broadcast") {
        // for readability.
        let speaker = data["data"]["data"]["userID"];
        let text = data["data"]["data"]["text"];
        // ℡ is the character that signifies that this shouldn't be broadcast
        if(!text.startsWith("℡")) {
          if(data["data"]["data"]["blank"]) {
            keyboardBuffer.push(speaker+" "+text);
          } else {
            if(speaker == lastSpeaker) {
              keyboardBuffer.push("\xFF"+text);
            } else {
              keyboardBuffer.push("\0\b"+speaker+"\n\xFF"+text);
              lastSpeaker = speaker;
            }
          }
        } else {
          // if the message does start with it, it signifies that a select function should be run.
          switch(text.replace("℡","",1)) {
            case "advanceTurn":
              advanceTurn();
              break;
            case "setOurTurn":
              setOurTurn();
              break;
          }
        }
      }
      if(data["type"] == "get") {
        sockerBuffer.push(data);
      }
});

socket.addEventListener('close', async function (event) {
    cO.remove();
    notices.innerHTML = "The server was closed. Please wait a moment and then reload the page.";
});
