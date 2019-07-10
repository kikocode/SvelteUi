<script>
  import {
    hexToRGB,
    getContrastColor,
    lighten,
    darken
  } from "../../utils/color.js";

  import Check from "../Icons/Check.svelte";

  export let checked = false;
  export let label = "";
  export let color = "#333333";

  $: checkedClass = checked ? "checked" : "";
  $: checkboxClasses = `${checkedClass}`;
</script>

<style type="text/scss">
  .checkbox {
    * {
      cursor: pointer;
    }
    margin: 14px;
    --text-color: rgba(0, 0, 0, 0.75);

    &.checked {
      .checkbox-box {
        background: black;
        border-color: black;
      }
      .checkbox-checker :global(svg) {
        fill: white;
      }
    }
  }

  .checkbox-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background: transparent;
    border: 2px solid grey;
  }
  .checkbox-input {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    outline: 0;
    -webkit-appearance: none;
  }

  .checkbox-field {
    display: inline-flex;
  }
  .checkbox-label {
    user-select: none;
    margin-left: 12px;
    font-size: 14px;
    color: var(--text-color);
  }

  .checkbox-checker,
  .checkbox-checker :global(svg) {
    display: flex;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
  }
</style>

<div class={'checkbox ' + checkboxClasses}>
  <input class="checkbox-input" type="checkbox" {checked} />
  <div class="checkbox-box">
    {#if checked}
      <div class="checkbox-checker">
        <Check />
      </div>
    {/if}
  </div>
  {#if label}
    <div class="checkbox-label">{label}</div>
  {/if}

</div>
