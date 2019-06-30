<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const VERSION = 1.2;

  export let name = "";
  export let label = "";
  export let variant = "outlined"; // outlined, filled, simple
  export let compact = false;
  export let error = false;
  export let disabled = false;
  export let multiline = false;
  export let color = "#ffbb77";
  export let helperText = "";
  export let type = "text";
  export let append = "";
  export let prepend = "";

  export let style = "";
  export let className = "";
  export { className as class };

  let focused = false;
  let labelRef;
  let labelWidth;
  let labelHeight;
  let labelX;
  let labelY;
  let prependRef;
  let prependWidth;
  let appendRef;
  let appendWidth;
  let height;

  let LABEL_SCALE = 0.75;
  let labelGap = 3;
  let paddingLeft = 10;

  $: focusedClass = focused && !disabled ? "focused" : "";
  $: activeClass = name != "" || focused ? "active" : "";
  $: compactClass = compact ? "compact" : "";
  $: errorClass = error ? "error" : "";
  $: disabledClass = disabled ? "disabled" : "";
  $: multilineClass = multiline ? "multiline" : "";
  $: variantClass = variant ? "multiline" : "";
  $: prependClass = append ? "hasPrepend" : "";
  $: appendClass = append ? "hasAppend" : "";
  $: textfieldClasses = ` ${className} ${focusedClass} ${activeClass} ${compactClass} ${errorClass} ${disabledClass} ${multilineClass} ${variant} ${prependClass} ${appendClass}`;

  $: computeVariant(variant);

  const computeVariant = variant => {
    if (variant == "outlined") {
      height = 55;
      if (compact) height = 39;
    } else if (variant == "filled") {
      height = 55;
      if (compact) height = 45;
    } else if ((variant = "simple")) {
      height = 36;
      if (compact) height = 30;
    } else {
      height = 55;
    }
  };

  $: textfieldStyle = `
    ${style};
    --primary-color:  ${hexToRGB(color)};
    --primary-color-light:  ${hexToRGB(color, 0.85)};

    --height: ${height}px;
    --padding-left: ${paddingLeft}px;

    --prepend-width: ${prependWidth}px;
    --append-width: ${appendWidth}px;
    
    --label-scale: ${LABEL_SCALE};
    --label-width: ${labelWidth}px;
    --label-x: ${labelX}px;
    --label-y: ${labelY}px;
    --transform-label: translate(${labelX}px, ${labelY}px) scale(1);
    --transform-label-filled: translateX(${labelX}px) translateY(${labelY -
    7}px) scale(${LABEL_SCALE});
  `;

  onMount(() => {
    appendWidth = appendRef ? appendRef.offsetWidth : 0;
    prependWidth = prependRef ? prependRef.offsetWidth : 0;

    labelWidth = labelRef.offsetWidth * LABEL_SCALE + labelGap;
    labelHeight = labelRef.offsetHeight;
    labelY = Math.round(height / 2 - labelHeight / 2);
    labelX = prependWidth;
    if (variant == "simple") {
      labelX = 0;
      paddingLeft = 0;
    }

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

    --spacing-input-outlined: 0 13px;
    --spacing-input-filled: 28px 13px 9px;
    --spacing-input-simple: 8px 0 8px;

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
      display: flex;
    }

    .input {
      width: 100%;
      min-width: 80px;
      height: var(--height);
      padding: var(--spacing-input-outlined);
      border-radius: 5px;
      font-size: 16px;
      outline: none;
      margin: 0;
      border: none;
      background: none;

      &::-ms-clear {
        display: none;
      }
    }

    .label {
      position: absolute;
      user-select: none;
      pointer-events: none;
      z-index: 1;
      transform-origin: top left;
      transform: var(--transform-label);
      transition: transform var(--transition-fast), color var(--transition-fast);
      padding-left: 2px;
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
        width: var(--padding-left);
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

    .prepend,
    .append {
      display: flex;
      align-items: center;
      white-space: pre;
      padding: var(--spacing-input-outlined);
      color: rgba(0, 0, 0, 0.5);
      pointer-events: none;
    }

    .prepend {
      padding-right: 0;
    }
    .append {
      padding-left: 0;
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
        transform: translateY(-7px) scale(var(--label-scale));
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
      height: var(--height);
    }
    .label {
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
      background: none;
    }
    /* Hover */
    &:hover .border {
      background: rgba(0, 0, 0, 0.11);
    }
    /* Active */
    &.active .label {
      transform: var(--transform-label-filled);
    }
    /* Focused */
    &.focused .border {
      border-width: 2px;
      border-color: var(--primary-color);
    }
    /* Compact */
    &.compact .input {
      padding: 20px 13px 6px;
      height: var(--height);
    }
    &.compact .label {
    }
    &.compact.active .label {
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
      height: var(--height);
    }
    .borderSegment {
      border: none;
    }
    .border {
      border-bottom: 1px solid grey;
      border-radius: 0;
    }
    .label {
      padding: 0;
    }
    .prepend {
      padding-left: 0;
    }
    .append {
      padding-right: 0;
    }
    &.hasPrepend {
      .input {
        padding-left: 10px;
        padding-right: 10px;
      }
      .label {
        transform: translateX(calc(var(--prepend-width) + 10px))
          translateY(var(--label-y));
      }
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
      }
      .input {
        height: var(--height);
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
        transform: translateX(0) translateY(-10px) scale(var(--label-scale));
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
    {#if prepend}
      <div class={'prepend'} bind:this={prependRef}>
        {@html prepend}
      </div>
    {/if}

    <div class="border">
      <div class="start borderSegment" />
      <div class="gap borderSegment">
        <div bind:this={labelRef} class="label">{label} </div>
      </div>
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
    {#if append}
      <div class={'append'} bind:this={appendRef}>
        {@html append}
      </div>
    {/if}
  </div>
  {#if helperText}
    <div class="helperText">{helperText}</div>
  {/if}
</div>
