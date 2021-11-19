import {AudioPlayer} from './AudioPlayer.js';
export let player = new AudioPlayer();
console.warn("%c The above errors do not matter at the moment because I have not even finished implementing the sound.","font-weight:bold")
export function play() {
	player.play();
}
export function stop() {
	player.stop();
}
export function setModule( moduleData ) {
	stop();
	let module = new Module( moduleData );
	let micromod = new Micromod( module, player.getSamplingRate() );
	player.setAudioSource( micromod );
}