import {AudioPlayer} from './AudioPlayer.js';
export let player = new AudioPlayer();
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