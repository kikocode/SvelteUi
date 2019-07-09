<script context="module">
  export let TOGGLE_GROUP_KEY = {};
</script>

<script>
  import { onMount, setContext, createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let multiple = false;

  let actives = [];

  let handleClick = id => {
    if (multiple) {
      if (actives.includes(id)) actives = actives.filter(el => el != id);
      else actives.push(id);
    } else {
      if (actives.includes(id)) actives = [];
      else actives = [id];
    }

    console.log("k", id, actives, multiple);
    dispatch("change", {
      id: id,
      actives: actives
    });
  };

  setContext(TOGGLE_GROUP_KEY, {
    onclick: handleClick
  });
</script>

<style>
  .togglegroup {
    display: flex;
  }
</style>

<div class="togglegroup">
  <slot {actives} />
</div>
