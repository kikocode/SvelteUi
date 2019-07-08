<script>
  export let mode = "default";

  $: modeClass = modes[mode] ? modes[mode] : mode;
  $: classes = `${modeClass}`;

  let modes = {
    "default": "",
    "rows": "block--rows",
  };
</script>

<style lang="scss">
  .block {
    display: flex;
    flex-flow: wrap;
    background-color: #f5f5f5;
    border-radius: 5px;
    padding: 20px;
    margin-bottom: 40px;
  }

  .block--rows {
    flex-flow:columns;
  }
</style>

<div class={"block " + classes}>
  <slot />
</div>
