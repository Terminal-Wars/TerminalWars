import {cO} from './canvas.js';
import {userID, roomID} from './commands.js';
import {ping} from './ping.js';
import {delay} from './commonFunctions.js';
import {keyboardBuffer} from './keyboard.js';
let wsproto = window.location.protocol == "https:" ? "wss" : "ws";
const wsurl = wsproto + "://" + window.location.host + "/socket";
export let socket = new WebSocket(wsurl);
export let sockerBuffer = []; let buffer, newHealth;
export let lastSpeaker = "";

export class ActionsClass {
  async BufferReturn() {
      return delay(ping).then(function() {
        buffer = sockerBuffer[0];
        sockerBuffer.shift();
        console.log(sockerBuffer);
        return buffer;
      });
  }
  async GetUsersOnline(room) {
      socket.send(`{"type":"get","data":{"roomID":"${room}","blockID":"${room}_users"}}`);
      return this.BufferReturn();
  }
  async GetUserInfo(user, room) {
      socket.send(`{"type":"get","data":{"roomID":"${room}","blockID":"${room}_users"}}`);
      let buffer = this.BufferReturn();
  }
  async Attack(foe, user, room, damage) {
      let userinfo = await this.GetUserInfo(foe, room);
      newHealth = userinfo["data"]["health"]-damage;
      socket.send(`{"type":"put","data":{"roomID":"${room}","blockID":"user_${user}","data":{"health":"${newHealth}"}}}`);
      socket.send(`{"type":"broadcast","data":{"userID":"", "roomID":"${room}", "text":"${user} dealt ${damage} damage to ${foe}!\\n"}}`);
      return 0;
  }
  async GetHealth(user, room) {
      let userinfo = await this.GetUserInfo(user, room);
      await delay(ping).then(function() {
        return userinfo["data"]["health"];
      })
  }
  async MemoryDump(room) {
      socket.send(`{"type":"get","data":{"roomID":"${room}"}}`);
      return this.BufferReturn();
  }
}
export const Actions = new ActionsClass;

socket.addEventListener('message', async function (event) {
    let data = JSON.parse(event.data);
      if(data["type"] == "broadcast") {
        // for readability.
        let speaker = data["data"]["data"]["userID"];
        let text = data["data"]["data"]["text"];
        // ℡ is the character that signifies that this shouldn't be broadcast
        if(!text.startsWith("℡")) {
          if(speaker == lastSpeaker) {
            keyboardBuffer.push("\xFF"+text);
          } else {
            keyboardBuffer.push("\0\b"+speaker+"\n\xFF"+text);
            lastSpeaker = speaker;
          }
        }
      }
      if(data["type"] == "get") {
        sockerBuffer.push(data);
      }
});
