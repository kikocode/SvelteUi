<script>
  import { onMount } from "svelte";

  import Ripple from "../Ripple/Ripple.svelte";

  export let useNestedElements = true;
  export let ripple = true;
  export let color = "#ff00aa";
  export let circleContent;

  let circleSize = 60;
  let elementSize = 40;
  let animationStagger = 200;

  let bgRef;
  let elementsRef;
  let elems;

  $: circleNavigationStyle = `
		--color: ${color};
		--circle-size: ${circleSize}px;
		--element-size: ${elementSize}px;
	`;

  onMount(() => {
    elems = elementsRef.childNodes;
    // using svelte's {#each} inside a named slot renders an extra div,
    // which will be taken care of here until fixed
    // @see - https://github.com/sveltejs/svelte/issues/2080
    if (useNestedElements) elems = elems[0].childNodes;
    elems.forEach((el, i) => {
      if (el.classList) el.classList.add("circle-navigation_element");
    });
  });

  const animateIn = e => {
    elems.forEach((el, i) => {
      setTimeout(() => {
        if (el.classList) {
          el.classList.add("circle-navigation_element--active");
        }
      }, i * animationStagger);
    });
  };

  const animateOut = e => {
    // max duration of animation
    let maxAnimation = animationStagger * elems.length;
    elems.forEach((el, i) => {
      setTimeout(() => {
        if (el.classList) {
          el.classList.remove("circle-navigation_element--active");
        }
        // apply max duration so the first element fades last
      }, maxAnimation - i * animationStagger);
    });
  };

  const handleMouseover = e => {
    animateIn();
  };

  const handleMouseout = e => {
    animateOut();
  };
</script>

<style>
  .circle-navigation {
    display: flex;
    align-items: center;
    position: relative;
    margin: 15px;
    --transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    --box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
      0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  }

  .circle-navigation :global(.circle-navigation_element) {
    display: flex;
    width: var(--element-size);
    height: var(--element-size);
    margin: 0 4px;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 50%;
    transform: scale(0);
    transform-origin: center;
    background: var(--color);
    transition: var(--transition);
    box-shadow: var(--box-shadow);
    z-index: 10;
  }

  .circle-navigation :global(.circle-navigation_element--active) {
    transform: scale(1);
  }

  .circle-navigation_button {
    position: relative;
    z-index: 100;
    overflow: hidden;

    align-items: center;
    justify-content: center;
    display: flex;
    color: white;
    fill: white;
    cursor: pointer;
    width: var(--circle-size);
    height: var(--circle-size);
    box-shadow: var(--box-shadow);
    transition: var(--transition);
    background: var(--color);
    border-radius: 50%;
  }
  .circle-navigation_button > :global(*) {
    display: flex;
  }

  .circle-navigation_background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
  }

  .circle-navigation_elements {
    display: flex;
    margin-left: 8px;
  }
  .circle-navigation_elements > :global(*) {
    display: flex;
  }
</style>

<div
  class="circle-navigation"
  on:mouseover={handleMouseover}
  on:mouseout={handleMouseout}
  style={circleNavigationStyle}>

  <div class="circle-navigation_button">
    {#if ripple}
      <Ripple />
    {/if}

    <slot name="circle" />
  </div>
  <div class="circle-navigation_elements" bind:this={elementsRef}>
    <slot name="elements" />
  </div>

  <div class="circle-navigation_background" bind:this={bgRef} />
</div>
