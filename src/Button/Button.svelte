<script>
  export let text = "";

  let buttonRef;

  $: buttonClasses = ``;

  const handleMouseDown = e => {
    let x = e.offsetX;
    let y = e.offsetY;
    let w = e.currentTarget.offsetWidth;
    let h = e.currentTarget.offsetHeight;
    let diameter = Math.sqrt(Math.pow(w / 2, 2) + Math.pow(h / 2, 2)) * 2;

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
      ripple.classList.add("ripple--done");
    }, 0);

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
    --darken-color: darken( --primary-color, 10% )
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
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    pointer-events: none;
    user-select: none;
    transform: scale(0);
    transition: opacity, transform 0s cubic-bezier(0, 0, 0.2, 1);
    /*transition: transform 0.4s ease-out, opacity 0.4s ease-out;*/
    transition-duration: 450ms;
  }
  :global(.ripple--held) {
    transform: scale(1);
    opacity:0.8;
  }
  :global(.ripple--done) {
    opacity: 0;
  }
</style>

<div
  bind:this={buttonRef}
  class={'button ' + buttonClasses}
  on:mousedown={handleMouseDown}>
   {text}
  <div class="ripple" style="display:none;" />
</div>
