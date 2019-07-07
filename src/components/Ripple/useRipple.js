import {
	hexToRGB
} from "../../utils/color.js";

export default function useRipple(node, params) {

	let colorStyle = "";
	let color = "#ffffff";
	if (params && params.color) {
		color = params.color;
	}
	let primary = hexToRGB(color);
	let primaryLight = hexToRGB(color, 0.35);
	colorStyle = `
		--primary-color:  ${primary};
		--primary-color-light:  ${primaryLight};
	`;

	let handleMouseDown = e => {
		let x = e.offsetX;
		let y = e.offsetY;
		let w = e.currentTarget.offsetWidth;
		let h = e.currentTarget.offsetHeight;
		let centerOffsetX = Math.abs(x - w / 2);
		let centerOffsetY = Math.abs(y - h / 2);
		let sideX = w / 2 + centerOffsetX;
		let sideY = h / 2 + centerOffsetY;
		let safeSpace = 10;
		let diameter = Math.sqrt(Math.pow(sideX, 2) + Math.pow(sideY, 2)) * 2;
		let ripple = document.createElement("div");

		let rippleStyle = "";
		rippleStyle += `
			left: ${x - diameter / 2}px;
			top: ${y - diameter / 2}px;
			width: ${diameter}px;
			height: ${diameter}px;
		`;
		if (colorStyle) rippleStyle += colorStyle;
		ripple.style = rippleStyle;
		ripple.className = "ripple";
		node.appendChild(ripple);

		setTimeout(function () {
			ripple.classList.add("ripple--held");
		}, 0);

		setTimeout(function () {
			if (ripple.classList.contains("ripple--held")) return;
			ripple.classList.add("ripple--done");
			setTimeout(() => {
				node.removeChild(ripple);
			}, 400);
		}, 400);
	};

	const killRipple = target => {
		var ripples = target.querySelectorAll(".ripple");
		var previousRipple = ripples[ripples.length - 1];

		if (!previousRipple) return;
		previousRipple.classList.add("ripple--done");
		setTimeout(() => {
			previousRipple.parentNode.removeChild(previousRipple);
		}, 800);
	};

	const handleMouseUp = e => {
		killRipple(node);
	};
	const handleMouseLeave = e => {
		killRipple(node);
	};

	node.addEventListener("mousedown", handleMouseDown);
	node.addEventListener("mouseup", handleMouseUp);
	node.addEventListener("mouseleave", handleMouseLeave);

	return {
		destroy() {
			node.removeEventListener("mousedown", handleMouseDown);
			node.removeEventListener("mouseup", handleMouseUp);
			node.removeEventListener("mouseleave", handleMouseLeave);
		}
	}
}