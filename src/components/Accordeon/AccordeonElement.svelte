<script>
  import slide from 'svelte-transitions-slide';

	import { ACCORDEON } from './Accordeon.svelte';
	import { getContext } from 'svelte';

	const { dispatch } = getContext(ACCORDEON);

  export let expanded = false;
  export let multiple = false;
  export let expandDuration = 1000;
  let accordeonRef;

  const handleClick = e => {
    expanded = !expanded;
    dispatch("click", e);
  }

</script>

<style type="text/scss">

</style>
<div
  bind:this={accordeonRef}
  class={'accordeon'}
  on:click={handleClick}>

  <slot name="header" />
  {#if expanded}
    <!-- use `in`, `out`, or `transition` (bidirectional) -->
    <div class="accordeon__body" transition:slide>
    <slot name="body">
      <p>😮 No body!</p>
    </slot>
    </div>
  {/if}
</div>
