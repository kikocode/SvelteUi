<script>
  import Buttons from "./demo/Buttons.svelte";
  import UiComponents from "./demo/UiComponents.svelte";
  import { Screen } from "./components/Layout";

  export let name;
</script>

<style>
  h1 {
    color: purple;
  }
</style>

<Screen>
  <UiComponents />
</Screen>
