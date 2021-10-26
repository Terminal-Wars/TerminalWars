function error() {
	document.body.innerHTML = `<span style='color: white!important;'><h1>Your browser does not support either async or ES6,</h1><small>(or has a weird unfinished ES6 implementation, in the case of MyPal)</small><p>and as much as I tried, I cannot seem to do ES5 support without breaking ES6 support. If I'm full of shit, or you want more information, <a href="https://github.com/IoIxD/TerminalWars/issues/6" style="color: white">see or comment on this issue.</a>.</p>
		<p>If using another browser is not an option for you, then chances are you are probably on an older operating system, in which case you have some options.</p>
		<ul>
			<li>If you're on Windows 2000 or XP, you can a version of Chromium that supports this <a style='color: white!important;' href='https://www.youtube.com/watch?v=nAbXFiCUFII'>from the pack in this YouTube video.</a></li>
			<li>Users of older PowerPC Macs do not have many native options; TenFourFox was based on a version of Firefox that was barely old enough to not support these features, and Classilla isn't even close. However, depending your machine's specs, you may be able to set up an extremely lightweight Linux VM using either <a style='color: white!important;' href='http://antixlinux.com'>AntiX (Debian based)</a> or <a style='color: white!important;' href='http://artixlinux.org'>ArtiX (Arch based).</a></li>
			<li>If you are on Windows 98, or a 68k Mac, you are quite frankly shit out of luck. For Windows 98 in particular, I could not get a Linux VM to run very fast in the latest version of qemu that will run with KernelEx. It would be nice to eventually have a newer browser that will run on 98 (the latest one is Firefox 48, hilariously enough) but that is future tense. If you're seeing this on a 68k Mac then I don't even know how you're reading this, but I will be very interested to eventually see a modern browser ported to 68k Macs that can do ES6/async.</li>
		</ul>
		<p>With all of that said, I plan to eventually make a Python 2.3 program that will run on Windows 98 and PowerPC Macs. A unix version could be done, but I'll let somebody else do that since I don't want to maintain more then two versions. I do not currently have plans for a 68k Mac version for the same reason.</p></span>`;
}
// Testing for ES6 and async support
try{
	async function test() {
		var k = new Map();
	}
	test();
	// If this succeeds, nothing happens. Continue as normal. 
	// (...or the browser is MyPal, which is blacklisted below) 
} catch(ex) {
	// If this fails, display the error message.
	error();
}
// MyPal is actually blacklisted because it has a really weird error that we can't actually detect.
if(window.navigator.userAgent.includes("Mypal")) {error();}