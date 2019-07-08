<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let color = "#000000";

  const handleClick = e => {
    dispatch("test", e);
  };
</script>

<style>
  .togglebutton {
    --transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    font-size: 14px;
    display: inline-flex;
    padding: 10px 13px;
    cursor: pointer;
    border-radius: 3px 3px 0px 0px;
    border-bottom: 2px solid transparent;
    transition: var(--transition);
    &:hover {
      background: rgba(0, 0, 0, 0.2);
      border-bottom-color: black;
    }
  }
</style>

<div class="togglebutton" on:click={handleClick}>
  <slot />
</div>
