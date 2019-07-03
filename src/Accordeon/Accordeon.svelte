<script>
  import slide from 'svelte-transitions-slide';
  export let expanded = false;
  export let expandDuration = 1000;
  let accordeonRef;

  const handleMouseDown = e => {
    expanded = !expanded;
  }

</script>

<style type="text/scss">

</style>

<div
  bind:this={accordeonRef}
  class={'accordeon'}
  on:mousedown={handleMouseDown}>
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
