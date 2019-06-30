<script>
  export let text = "";

  let buttonRef;

  $: buttonClasses = ``;

  const handleClick = e => {
    let pos = { x: e.offsetX, y: e.offsetY };
    let w = e.currentTarget.offsetWidth;
    let ripple = document.createElement("div");
    let rippleStartSize = w / 3;

    ripple.className = "ripple";
    ripple.style = `
			left: ${pos.x - rippleStartSize / 2}px;
			top: ${pos.y - rippleStartSize / 2}px;
			width: ${rippleStartSize}px;
			height: ${rippleStartSize}px;
		`;
    e.currentTarget.appendChild(ripple);
    ripple.style = `
			width: ${w}px;
			height: ${w}px;
		`;

    setTimeout(() => {
      ripple.parentNode.removeChild(ripple);
    }, 500);
  };
</script>

<style type="text/scss">
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
  :global(.ripple) {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(255, 255, 255, 0.35);
    border-radius: 50%;
    pointer-events: none;
    transform: scale(1);
    transition: opacity, transform 0s cubic-bezier(0, 0, 0.2, 1);
    transition-duration: 450ms;
  }

  @keyframes rippleEffect {
    0% {
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(var(--scale));
    }
  }
</style>

<div
  bind:this={buttonRef}
  class={'button ' + buttonClasses}
  on:click={handleClick}>
   {text}
  <div class="ripple" style="display:none;" />
</div>
