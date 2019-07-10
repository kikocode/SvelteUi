<script>
  import {
    hexToRGB,
    getContrastColor,
    lighten,
    darken
  } from "../../utils/color.js";

  export let style = "";
  export let color = "#000000";
  export let isOn = false;

  let togglebuttonStyle = "";

  $: isOnClass = isOn ? "togglebutton--is-on" : "";
  $: togglebuttonClasses = `
    togglebutton
    ${isOnClass}
  `;
  $: togglebuttonStyle = `
    ${style};
    --primary-color:  ${color};
    --primary-color-medium:  ${hexToRGB(color, 0.4)};
    --primary-color-light:  ${hexToRGB(color, 0.25)};
    --primary-color-soft:  ${hexToRGB(color, 0.12)};
    --text-color:  ${darken(color, 20)};
  `;

  const handleClick = e => {
    onclick(id);
  };
</script>

<style type="text/scss">
  .togglebutton {
    --transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

    display: inline-flex;
    position: relative;
    overflow: hidden;
    padding: 10px 13px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.85);

    cursor: pointer;
    border-radius: 3px 3px 0px 0px;
    border-bottom: 3px solid transparent;
    transition: var(--transition);
    &:hover {
      background: var(--primary-color-soft);
      border-bottom-color: var(--primary-color-medium);
      color: var(--text-color);
    }
  }

  .togglebutton--is-on,
  .togglebutton--is-on:hover {
    background: var(--primary-color-light);
    border-bottom-color: var(--primary-color);
    font-weight: 500;
    color: var(--text-color);
  }
</style>

<div style={togglebuttonStyle} class={togglebuttonClasses}>
  <slot />
</div>
