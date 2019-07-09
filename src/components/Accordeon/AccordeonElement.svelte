<script>
  import slide from "svelte-transitions-slide";

  import { ACCORDEON } from "./Accordeon.svelte";
  import { ArrowDown } from "../../assets/icons";
  import { getContext } from "svelte";

  const { onclick } = getContext(ACCORDEON);

  export let id;
  export let expanded = false;
  export let multiple = false;
  export let expandDuration = 1000;
  let accordeonRef;

  $: expandedClass = expanded ? "accordeon__element--expanded" : "";

  const handleClick = e => {
    onclick(id);
  };
</script>

<style type="text/scss">
  .accordeon__element {
    cursor: pointer;
    display: block;
    padding: 10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background: #d6d6d6;
    border-bottom: 2px solid #f5f5f5d9;
    svg {
      width: 50px;
      height: 50px;
    }
  }
</style>

<div
  bind:this={accordeonRef}
  class={'accordeon__element ' + expandedClass}
  on:click={handleClick}>
  <slot name="header" />
   {expandedClass}
  {#if expanded}
    <!-- use `in`, `out`, or `transition` (bidirectional) -->
    <div class="accordeon__body" transition:slide>
      <slot name="body">
        <p>😮 No body!</p>
      </slot>
    </div>
  {/if}
  <ArrowDown />
</div>
