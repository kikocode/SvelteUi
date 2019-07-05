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


/**
 *
 * @param {string} hex - hex color
 * @param {number} amt - ammount 100 = lighten / -100 = darken
 */
export function lightenDarkenColor(hex, percent) {

    var num = parseInt(hex,16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = (num >> 8 & 0x00FF) + amt,
        G = (num & 0x0000FF) + amt;

        return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);

}



/**
 *
 * @param {string} color - HEX
 * @param {number} amount - percentage
 */
export const lighten = (color, amount)=> {
    color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
    amount = parseInt((255*amount)/100);
    return color = `#${addLight(color.substring(0,2), amount)}${addLight(color.substring(2,4), amount)}${addLight(color.substring(4,6), amount)}`;
}
/**
 *
 * @param {string} color - HEX
 * @param {number} amount - percentage
 */
export const darken = (color, amount) =>{
    color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
    amount = parseInt((255*amount)/100);
    return color = `#${subtractLight(color.substring(0,2), amount)}${subtractLight(color.substring(2,4), amount)}${subtractLight(color.substring(4,6), amount)}`;
}


/**
 *
 * @param {string} color - RGB
 * @param {number} amount - percentage
 */
const subtractLight = function(color, amount){
    let cc = parseInt(color,16) - amount;
    let c = (cc < 0) ? 0 : (cc);
    c = (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;
    return c;
}
/**
 *
 * @param {string} color - RGB
 * @param {number} amount - percentage
 */
const addLight = function(color, amount){
    let cc = parseInt(color,16) + amount;
    let c = (cc > 255) ? 255 : (cc);
    c = (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;
    return c;
}