export function ripple(node) {

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

		ripple.style = `
			left: ${x - diameter / 2}px;
			top: ${y - diameter / 2}px;
			width: ${diameter}px;
			height: ${diameter}px;
		`;
		ripple.className = "ripple";
		e.target.appendChild(ripple);

		setTimeout(function () {
			ripple.classList.add("ripple--held");
		}, 0);

		setTimeout(function () {
			if (ripple.classList.contains("ripple--held")) return;
			ripple.classList.add("ripple--done");
			setTimeout(() => {
				ripple.parentNode.removeChild(ripple);
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
		killRipple(e.target);
	};
	const handleMouseLeave = e => {
		killRipple(e.target);
	};

	node.addEventListener("mousedown", handleMouseDown);
}