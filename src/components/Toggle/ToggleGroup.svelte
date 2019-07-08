<script>
  import { onMount } from "svelte";

  export let useNestedElements = true;

  let toggleButtonElemsRef;
  let elems;

  onMount(() => {
    elems = toggleButtonElemsRef.children;
    // using svelte's {#each} inside a named slot renders an extra div,
    // which will be taken care of here until fixed
    // @see - https://github.com/sveltejs/svelte/issues/2080
    if (useNestedElements) elems = elems[0].children;
    let entries = Array.from(elems);
    entries.forEach((el, i) => {
      el.addEventListener("click", handleClick);
    });
  });

  const handleClick = e => {};
</script>

<style lang="scss">
  .togglegroup {
  }
</style>

<div class="togglegroup">

  <div bind:this={toggleButtonElemsRef}>
    <slot />
  </div>
</div>
