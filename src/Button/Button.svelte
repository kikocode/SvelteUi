<script>
  export let text = "";

  let buttonRef;

  $: buttonClasses = ``;

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

  const handleMouseUp = e => {
    console.log("mouse up ", e.target.getElementsByClassName("ripple"));

    var ripples = e.target.querySelectorAll(".ripple");
    var previousRipple = ripples[ripples.length - 1];

    previousRipple.classList.add("ripple--done");
    setTimeout(() => {
      previousRipple.parentNode.removeChild(previousRipple);
    }, 800);
  };
</script>

<style type="text/scss">
  :global(.ripple) {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(255, 255, 255, 0.35);
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

  .button {
    --height: 40px;
    --padding: 0px 16px;
    --font-size: 16px;
    --primary-color: #1976d2;
    --transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: pointer;
    transition: var(--transition);
    height: var(--height);
    padding: var(--padding);
    font-size: var(--font-size);
    background: var(--primary-color);
    color: white;
    font-weight: 500;
    border-radius: 2px;

    &:hover {
      background-color: #115293;
    }
  }
</style>

<div
  bind:this={buttonRef}
  class={'button ' + buttonClasses}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}>
   {text}
</div>
