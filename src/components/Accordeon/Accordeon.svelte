<script context="module">
  export const ACCORDEON = {};
</script>

<script>
  import { setContext } from "svelte";
  import { createEventDispatcher } from "svelte";

  let actives = [];

  const dispatch = createEventDispatcher();
  const handleClick = id => {
    if (actives.includes(id)) actives = [];
    else actives = [id];

    dispatch("change", {
      actives: actives
    });
  };

  setContext(ACCORDEON, {
    onclick: handleClick
  });
</script>

<style type="text/scss">
  /* your styles go here */
  .accordeon {
    width: 100%;
  }
</style>

<div class="accordeon">
  <slot>
    <!-- optional fallback -->
  </slot>
</div>
