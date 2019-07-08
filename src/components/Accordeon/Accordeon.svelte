<script context="module">
	export const ACCORDEON = {};
</script>

<script>

	import { setContext } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();


	setContext(ACCORDEON, {
		dispatch(data) {
			console.log("clicky", data);
		}
	})
</script>

<slot><!-- optional fallback --></slot>
