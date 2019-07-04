export function hexToRGB(hex, alpha) {
	var r = parseInt(hex.slice(1, 3), 16),
		g = parseInt(hex.slice(3, 5), 16),
		b = parseInt(hex.slice(5, 7), 16);
	if (alpha) {
		return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
	} else {
		return "rgb(" + r + ", " + g + ", " + b + ")";
	}
};

export function randomHex() {
	return '#' + Math.floor(Math.random() * 16777215).toString(16);
}


export function getContrastColor(hex) {
	let threshold = 130; /* about half of 256. Lower threshold equals more dark text on dark background  */

	let hRed = hexToR(hex);
	let hGreen = hexToG(hex);
	let hBlue = hexToB(hex);

	function hexToR(h) {
		return parseInt((cutHex(h)).substring(0, 2), 16)
	}

	function hexToG(h) {
		return parseInt((cutHex(h)).substring(2, 4), 16)
	}

	function hexToB(h) {
		return parseInt((cutHex(h)).substring(4, 6), 16)
	}

	function cutHex(h) {
		return (h.charAt(0) == "#") ? h.substring(1, 7) : h
	}

	let cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
	if (cBrightness > threshold) {
		return "#000000";
	} else {
		return "#ffffff";
	}
}