<script>
  import { hexToRGB, getContrastColor } from "../Utils/color.js";

  export let use = () => {};
  export let color = "#1976d2";
  export let style = "";
  export let disabled = false;
  export let compact = false;
  export let raised = false;
  export let outlined = false;
  export let simple = false;

  $: disabledClass = disabled ? "button--disabled" : "";
  $: compactClass = compact ? "button--compact" : "";
  $: raisedClass = raised ? "button--raised" : "";
  $: outlinedClass = outlined ? "button--outlined" : "";
  $: simpleClass = simple ? "button--simple" : "";
  $: buttonClasses = `${disabledClass} ${compactClass} ${raisedClass} ${outlinedClass} ${simpleClass}`;
  $: textColor = hexToRGB(getContrastColor(color), 1);

  $: buttonStyles = `
    ${style};
    --primary-color:  ${color};
    --text-color:  ${textColor};
  `;
</script>

<style type="text/scss">
  .button {
    --height: 40px;
    --padding: 0px 16px;
    --font-size: 16px;
    --transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

    margin: 8px;
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: pointer;
    transition: var(--transition);
    height: var(--height);
    padding: var(--padding);
    font-size: var(--font-size);
    background: var(--primary-color);
    color: var(--text-color);
    font-weight: 500;
    border-radius: 4px;
  }

  .button--disabled {
    background: #d0d0d0;
    color: #929292;
    cursor: default;
    pointer-events: none;
  }

  .button--raised {
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  }

  .button--outlined {
    background: none;
    border: 1px solid rgba(0, 0, 0, 0.15);
    color: var(--primary-color);
  }

  .button--simple {
    background: none;
    color: var(--primary-color);
  }

  .button--compact {
    --padding: 0px 14px;
    --height: 34px;
  }
</style>

<div on:click class={'button ' + buttonClasses} style={buttonStyles} use:use>
  <slot />
</div>
