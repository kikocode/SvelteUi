<script>
  export let checked = false;
  export let label = "";
  export let id = "checkbox" + Math.round(Math.random() * 95002000);

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

    .box {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      background: transparent;
      border: 2px solid grey;
    }
    .input {
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

    .field {
      display: inline-flex;
    }
    .label {
      user-select: none;
      margin-left: 12px;
      font-size: 14px;
      color: var(--text-color);
    }
  }

  /**
  * Checked
  */
  .checkbox.checked {
    .box {
      background: #ddd;
    }
  }
</style>

<div class={'checkbox ' + checkboxClasses}>
  <label class="field" for={id}>
    <input {id} class="input" type="checkbox" bind:checked />
    <div class="box">
      <div class="checker" />
    </div>
    {#if label}
      <div class="label">{label}</div>
    {/if}
  </label>
</div>
