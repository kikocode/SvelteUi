<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const VERSION = 1.0;
  const dispatch = createEventDispatcher();
  const LABEL_SCALE = 0.75;

  export let name = "";
  export let label = "";
  export let variant = "outlined"; // outlined, filled, simple
  export let compact = false;
  export let error = false;
  export let disabled = false;
  export let multiline = false;
  export let color = "#ffbb77";
  export let style = "";
  export let helperText = "";
  export let type = "text";

  let focused = false;
  let labelRef;
  let labelWidth;

  $: focusedClass = focused && !disabled ? "focused" : "";
  $: activeClass = name != "" || focused ? "active" : "";
  $: compactClass = compact ? "compact" : "";
  $: errorClass = error ? "error" : "";
  $: disabledClass = disabled ? "disabled" : "";
  $: multilineClass = multiline ? "multiline" : "";
  $: variantClass = variant ? "multiline" : "";
  $: textfieldClasses = ` ${focusedClass} ${activeClass} ${compactClass} ${errorClass} ${disabledClass} ${multilineClass} ${variant}`;

  $: textfieldStyle = `
    ${style};
    --primary-color:  ${hexToRGB(color)};
    --primary-color-light:  ${hexToRGB(color, 0.85)};
    --label-width: ${labelWidth}px;
    --label-scale: ${LABEL_SCALE}
    `;

  onMount(() => {
    const labelGap = 3;
    labelWidth = labelRef.offsetWidth * LABEL_SCALE + labelGap;
    console.log("label width", labelWidth);
  });

  const handleChange = e => {
    name = e.target.value;
    dispatch("change", e);
  };
  const handleFocus = e => {
    focused = true;
  };
  const handleBlur = e => {
    focused = false;
  };

  const hexToRGB = (hex, alpha) => {
    var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    if (alpha) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  };
</script>

<style type="text/scss">
  .textfield {
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --error-color: #e0274f;
    --disabled-color: rgba(0, 0, 0, 0.25);

    --spacing-input-outlined: 18px 13px;
    --spacing-input-filled: 28px 13px 9px;
    --spacing-input-simple: 8px 0 8px;

    --height-outlined: 55px;
    --height-outlined-compact: 39px;
    --height-filled-compact: 45px;
    --height-simple: 36px;
    --height-simple-compact: 30px;

    display: inline-flex;
    flex-flow: column;
    margin-right: 8px;
    margin-left: 8px;
    margin-top: 16px;
    margin-bottom: 8px;
    min-height: 40px;

    * {
      box-sizing: border-box;
    }

    .textfield-element {
      position: relative;
    }

    .input {
      width: 100%;
      min-width: 80px;
      height: var(--height-outlined);
      padding: var(--spacing-input-outlined);
      border-radius: 5px;
      font-size: 16px;
      outline: none;
      margin: 0;
      border: none;
      background: none;
    }

    .label {
      position: absolute;
      user-select: none;
      pointer-events: none;
      z-index: 1;
      transform: translate(13px, 18px) scale(1);
      padding-left: 2px;
      transform-origin: top left;
      transition: transform var(--transition-fast), color var(--transition-fast);
      white-space: pre;
      max-width: calc(100% - 35px);
      overflow: hidden;
      text-overflow: ellipsis;
      color: rgba(0, 0, 0, 0.6);
    }

    .borderSegment {
      transition: all var(--transition-fast);
      border-color: rgba(0, 0, 0, 0.25);
      border-width: 1px;
      border-style: solid;
    }

    .border {
      display: flex;
      justify-content: flex-start;
      box-sizing: border-box;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      background: none;
      pointer-events: none;
      transition: all var(--transition-fast);

      .start {
        width: 10px;
        height: 100%;
        border-radius: 4px 0 0px 4px;
        border-right: none;
      }

      .gap {
        width: var(--label-width);
        height: 100%;
        border-left: none;
        border-right: none;
      }

      .end {
        flex: 1;
        flex-shrink: 1;
        width: 100%;
        height: 100%;
        border-radius: 0 5px 5px 0;
        border-left: none;
      }
    }

    .helperText {
      font-size: 12px;
      margin-top: 5px;
      margin-left: 13px;
      margin-right: 13px;
      color: rgba(0, 0, 0, 0.5);
    }

    /* Hover */
    &:hover {
      .borderSegment {
        border-color: rgba(0, 0, 0, 0.85);
      }
    }

    /* Active */
    &.active {
      .label {
        transform: translate(10px, -7px) scale(var(--label-scale));
        color: rgba(0, 0, 0, 0.5);
      }
      .border .gap {
        border-top: 0px solid transparent;
      }
    }

    /* Focused */
    &.focused {
      .label {
        color: rgba(0, 0, 0, 0.85);
        color: var(--primary-color-light);
      }
      .borderSegment {
        border-color: var(--primary-color);
        border-width: 2px;
      }
      .border {
        border-width: 2px;
      }
    }

    /* Error */
    &.error {
      .borderSegment {
        border-color: var(--error-color);
      }
      .label {
        color: var(--error-color);
      }
      .helperText {
        color: var(--error-color);
      }
    }
    /* Disabled */
    &.disabled {
      user-select: none;
      pointer-events: none;
      .label {
        color: var(--disabled-color);
      }
      .borderSegment {
        border-color: var(--disabled-color);
      }
      .input {
        color: var(--disabled-color);
      }
      .helperText {
        color: var(--disabled-color);
      }
    }
  }

  /**
   * Compact
   */
  .textfield.compact {
    .input {
      padding: 10px 13px;
      height: var(--height-outlined-compact);
    }
    .label {
      transform: translate(10px, 10px) scale(1);
    }
    &.active .label {
      transform: translate(10px, -6px) scale(var(--label-scale));
    }
  }

  /**
  * Filled
  */
  .textfield.filled {
    .input {
      padding: var(--spacing-input-filled);
    }
    .borderSegment {
      border: none;
    }
    .border {
      border: none;
      background: rgba(0, 0, 0, 0.07);
      border-radius: 5px 5px 0 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.3);
    }
    .label {
      transform: translate(13px, 18px) scale(1);
      background: none;
    }
    /* Hover */
    &:hover .border {
      background: rgba(0, 0, 0, 0.11);
    }
    /* Active */
    &.active .label {
      transform: translate(10px, 10px) scale(var(--label-scale));
    }
    /* Focused */
    &.focused .border {
      border-width: 2px;
      border-color: var(--primary-color);
    }
    /* Compact */
    &.compact .input {
      padding: 20px 13px 6px;
      height: var(--height-filled-compact);
    }
    &.compact .label {
      transform: translate(12px, 13px) scale(1);
    }
    &.compact.active .label {
      transform: translate(12px, 5px) scale(var(--label-scale));
    }
    /* Error */
    &.error .border {
      border-bottom: 2px solid var(--error-color);
    }
    /* Disabled */
    &.disabled .border {
      border-bottom-style: dotted;
    }
  }

  /**
  * Simple
  */
  .textfield.simple {
    .input {
      margin: 0;
      padding: var(--spacing-input-simple);
      height: var(--height-simple);
    }
    .borderSegment {
      border: none;
    }
    .border {
      border-bottom: 1px solid grey;
      border-radius: 0;
    }
    .label {
      transform: translate(0, 10px) scale(1);
      padding: 0;
    }
    .helperText {
      margin-left: 0;
      margin-right: 0;
    }
    /* hover */
    &:hover .border {
      border-color: black;
      border-width: 2px;
    }
    /* compact */
    &.compact {
      .label {
        transform: translate(0, 6px) scale(1);
      }
      .input {
        height: var(--height-simple-compact);
      }
    }
    /* focused */
    &.focused {
      .border {
        border-color: var(--primary-color);
        border-width: 2px;
      }
    }
    /* active */
    &.active {
      .label {
        transform: translate(0, -12px) scale(var(--label-scale));
      }
    }
    /* multiline */
    &.multiline .input {
      margin: 12px 0;
    }
    /* error */
    &.error .border {
      border-width: 2px;
      border-color: var(--error-color);
    }
    /* disabled */
    &.disabled .border {
      border-color: var(--disabled-color);
    }
  }

  /**
  * Multiline
  */
  .textfield.multiline {
    .input {
      width: auto;
      padding: 0;
      margin: 15px 13px;
      margin-bottom: 10px;
    }
    /* Filled */
    &.filled .input {
      padding: 0;
      margin: var(--spacing-input-filled);
    }
  }
</style>

<div class={'textfield ' + textfieldClasses} style={textfieldStyle}>
  <div class="textfield-element">
    <div bind:this={labelRef} class="label">{label} </div>
    <div class="border">
      <div class="start borderSegment" />
      <div class="gap borderSegment" />
      <div class="end borderSegment" />
    </div>
    {#if multiline}
      <textarea
        class="input"
        {type}
        value={name}
        on:change={handleChange}
        on:keyup={handleChange}
        on:keydown={handleChange}
        on:focus={handleFocus}
        on:blur={handleBlur} />
    {:else}
      <input
        class="input"
        {type}
        value={name}
        on:change={handleChange}
        on:keydown={handleChange}
        on:keyup={handleChange}
        on:focus={handleFocus}
        on:blur={handleBlur} />
    {/if}
  </div>
  {#if helperText}
    <div class="helperText">{helperText}</div>
  {/if}
</div>
