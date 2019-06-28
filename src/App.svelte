<script>
  import UIComponents from "./UIComponents.svelte";
  import Textfield from "./Textfield/Textfield.svelte";
  import Screen from "./Layout/Screen.svelte";

  export let name;
</script>

<style>
  h1 {
    color: purple;
  }
</style>

<Screen>
  <UIComponents />
</Screen>
