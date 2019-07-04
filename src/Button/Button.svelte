<script>
  export let use = () => {};
  export let color = "#1976d2";
  export let style = "";
  export let disabled = false;
  export let compact = false;

  $: disabledClass = disabled ? "button--disabled" : "";
  $: compactClass = compact ? "button--compact" : "";
  $: buttonClasses = `${disabledClass} ${compactClass}`;

  $: buttonStyles = `
    ${style};
    --primary-color:  ${color};
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
    color: white;
    font-weight: 500;
    border-radius: 4px;
  }

  .button--disabled {
    background: #d0d0d0;
    color: #929292;
    cursor: default;
    pointer-events: none;
  }

  .button--compact {
    --padding: 0px 14px;
    --height: 34px;
  }
</style>

<div class={'button ' + buttonClasses} style={buttonStyles} use:use>
  <slot />
</div>
