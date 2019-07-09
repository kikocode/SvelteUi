<script>
  import {
    hexToRGB,
    getContrastColor,
    lighten,
    darken
  } from "../../utils/color.js";

  export let isOn = false;
  export let color = "#333333";

  $: switchClass = isOn ? "switch--on" : "";
  $: switchClasses = `${switchClass}`;
  $: switchStyle = `
    --color-primary: ${color};
    --color-primary-light: ${hexToRGB(color, 0.6)};
  `;

  const handleClick = () => {
    isOn = !isOn;
  };
</script>

<style>
  .switch {
    display: inline-flex;
    margin: 0;
    padding: 0;
    width: 35px;
    cursor: pointer;
    margin-top: 12px;
    margin-bottom: 8px;
    margin-left: 8px;
    margin-right: 8px;
    border: none;
    background: none;
    outline: none;

    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

    * {
      box-sizing: border-box;
    }
  }

  .switch-bg {
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    width: 34px;
    height: 14px;
    border-radius: 50px;
    transition: background var(--transition-fast);
  }

  .switch-grabber {
    position: absolute;
    top: -3px;
    left: -2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    transition: left var(--transition-fast);
    box-shadow: var(--box-shadow);
  }

  /* On */
  .switch--on {
    & .switch-grabber {
      left: 18px;
      background: var(--color-primary);
    }
    & .switch-bg {
      background: var(--color-primary-light);
    }
  }
</style>

<button
  class={'switch ' + switchClasses}
  on:click={handleClick}
  style={switchStyle}>

  <div class="switch-bg">
    <div class="switch-grabber" />
  </div>

</button>
