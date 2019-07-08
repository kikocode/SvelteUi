<script>
  import { onMount } from "svelte";

  import Ripple from "../Ripple/Ripple.svelte";

  export let useNestedElements = true;
  export let ripple = true;
  export let color = "#ff00aa";
  export let circleContent;
  // options: left, right, top, bottom. default is bottom
  export let direction = "left";
  export let circleSize = 60;
  export let elementSize = 40;

  let timeouts = [];
  let animationStagger = 15;

  let bgRef;
  let elementsRef;
  let elems;

  let directions = {
    top: {
      class: "circnav--direction-top"
    },
    bottom: {
      class: "circnav--direction-bottom"
    },
    left: {
      class: "circnav--direction-left"
    },
    right: {
      class: "circnav--direction-right"
    }
  };

  $: directionClass = directions[direction]
    ? directions[direction].class
    : direction;
  $: circleNavigationClasses = `
    ${directionClass}
  `;

  $: circleNavigationStyle = `
		--color: ${color};
		--circle-size: ${circleSize}px;
		--element-size: ${elementSize}px;
	`;

  onMount(() => {
    elems = elementsRef.children;
    // using svelte's {#each} inside a named slot renders an extra div,
    // which will be taken care of here until fixed
    // @see - https://github.com/sveltejs/svelte/issues/2080
    if (useNestedElements) elems = elems[0];
    let entries = Array.from(elems.children);
    entries.forEach((el, i) => {
      if (el.classList) el.classList.add("circnav_subcircle");
    });
  });

  const animateIn = e => {
    clearTimeouts();
    Array.from(elems.children).forEach((el, i) => {
      let timeout = setTimeout(() => {
        if (el.classList) {
          el.classList.add("circnav_subcircle--active");
        }
        elems.visible += 1;
      }, i * animationStagger);
      timeouts.push(timeout);
    });
  };

  const animateOut = e => {
    clearTimeouts();
    let entries = Array.from(
      elems.querySelectorAll(".circnav_subcircle--active")
    );
    let maxAnimation = animationStagger * entries.length;
    entries.forEach((el, i) => {
      setTimeout(() => {
        if (el.classList) {
          el.classList.remove("circnav_subcircle--active");
        }
        // apply max duration so the first element fades last
      }, maxAnimation - i * animationStagger);
    });
  };

  const clearTimeouts = () => {
    timeouts.forEach(timeout => {
      clearInterval(timeout);
    });
  };

  const handleMouseover = e => {
    animateIn();
  };

  const handleMouseout = e => {
    animateOut();
  };
</script>

<style lang="scss">
  .circnav {
    display: flex;
    align-items: flex-start;
    --transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    --box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
      0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  }
  .circnav-element {
    display: flex;
    align-items: center;
    position: relative;
  }

  .circnav--direction-bottom {
    & .circnav-element {
      flex-flow: column;
    }
    & .circnav_subcircles {
      flex-flow: column;
    }
    & .circnav_subcircles > :global(*) {
      flex-flow: column;
    }
  }

  .circnav--direction-top {
    & .circnav-element {
      flex-flow: column;
      flex-direction: column-reverse;
    }
    & .circnav_subcircles {
      flex-flow: column;
      flex-direction: column-reverse;
    }
    & .circnav_subcircles > :global(*) {
      flex-flow: column;
      flex-direction: column-reverse;
    }
  }

  .circnav--direction-right {
    & .circnav-element {
      flex-flow: row;
    }
    & .circnav_subcircles {
      flex-flow: row;
    }
    & .circnav_subcircles > :global(*) {
      flex-flow: row;
    }
  }

  .circnav--direction-left {
    & .circnav-element {
      flex-flow: row-reverse;
    }
    & .circnav_subcircles {
      flex-flow: row-reverse;
    }
    & .circnav_subcircles > :global(*) {
      flex-flow: row-reverse;
    }
  }

  /* Subcircle */
  .circnav_subcircles {
    display: flex;
    align-items: center;
  }
  .circnav_subcircles > :global(*) {
    display: flex;
    align-items: center;
  }
  .circnav :global(.circnav_subcircle) {
    display: flex;
    width: var(--element-size);
    height: var(--element-size);
    margin: 6px;
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
    opacity: 0;
  }
  .circnav :global(.circnav_subcircle--active) {
    transform: scale(1);
    opacity: 1;
  }

  /* Button */
  .circnav_button {
    position: relative;
    z-index: 100;
    overflow: hidden;
    outline: none;
    border: none;

    margin: 10px;
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
  .circnav_button > :global(*) {
    display: flex;
  }

  /* Background */
  .circnav_bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>

<div
  class={'circnav ' + circleNavigationClasses}
  style={circleNavigationStyle}
  on:mouseleave={handleMouseout}>
  <div class="circnav-element">
    <button class="circnav_button" on:mouseenter={handleMouseover}>
      {#if ripple}
        <Ripple />
      {/if}

      <slot name="circle" />
    </button>
    <div class="circnav_subcircles" bind:this={elementsRef}>
      <slot name="elements" />
    </div>

    <div class="circnav_bg" bind:this={bgRef} />
  </div>
</div>
