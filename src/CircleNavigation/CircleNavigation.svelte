<script>
  import { onMount } from "svelte";

  import Ripple from "../Ripple/Ripple.svelte";

  export let ripple = true;
  export let color = "#ff00aa";
  export let circleContent;

  let elementsRef;
  let elems;

  /* use html reference on mount */
  onMount(() => {
    elems = elementsRef.childNodes[0].childNodes;
    elems.forEach((el, i) => {
      el.classList.add("circle-navigation_element");
    });
  });

  const handleMouseover = e => {
    let startX = 50;
    let gapX = 0;

    elems.forEach((el, i) => {
      let w = el.offsetWidth;
      let top = "0px";
      let left = i * (w + gapX) + startX + "px";
      el.style = `
				left:${left};
				top:${top};
			`;
    });
  };

  const handleMouseout = e => {
    elems.forEach((el, i) => {
      el.style = `
				left:0px;
				top:0px;
			`;
    });
  };
</script>

<style>
  .circle-navigation {
    position: relative;
    --transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }

  .circle-navigation :global(.circle-navigation_element) {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    background: grey;
    transition: var(--transition);
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
    width: 45px;
    height: 45px;
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
      0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);

    background: grey;
    border-radius: 50%;
  }

  .circle-navigation_elements {
  }
</style>

<div class="circle-navigation">

  <div
    class="circle-navigation_button"
    on:mouseover={handleMouseover}
    on:mouseout={handleMouseout}>
    {#if ripple}
      <Ripple />
    {/if}

    <slot name="circle" />
  </div>
  <div class="circle-navigation_elements" bind:this={elementsRef}>
    <slot name="elements" />
  </div>
</div>
