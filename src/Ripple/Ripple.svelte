<script>
  import { hexToRGB } from "../Utils/color.js";

  export let color = "#ffffff";

  $: rippleStyle = `
    --primary-color:  ${hexToRGB(color)};
    --primary-color-light:  ${hexToRGB(color, 0.35)};
  `;

  const handleMouseDown = e => {
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

    setTimeout(function() {
      ripple.classList.add("ripple--held");
    }, 0);

    setTimeout(function() {
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
</script>

<style type="text/scss">
  :global(.ripple) {
    position: absolute;
    width: 2px;
    height: 2px;
    background: var(--primary-color-light);
    border-radius: 50%;
    pointer-events: none;
    user-select: none;
    transform: scale(0);
    transition: opacity, transform 0s cubic-bezier(0, 0, 0.2, 1);
    transition-duration: 400ms;
    /*transition: transform 0.4s ease-out, opacity 0.4s ease-out;*/
  }
  :global(.ripple--held) {
    transform: scale(1);
    opacity: 0.8;
  }
  :global(.ripple--done) {
    opacity: 0;
  }
  .ripple-container {
    position: relative;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
  }
</style>

<div
  class="ripple-container"
  style={rippleStyle}
  on:mousedown={handleMouseDown}
  on:mouseleave={handleMouseLeave}
  on:mouseup={handleMouseUp} />
