<script>
	import { createEventDispatcher, getContext } from 'svelte';
	import { TOGGLE_GROUP_KEY } from './ToggleGroup.svelte';
	const dispatch = createEventDispatcher();
	const { onclick } = getContext(TOGGLE_GROUP_KEY);

	export let id;
	export let active = '';

	let togglebuttonStyle = '';
	let isActive = false;
	$: if (active == id) isActive = true;
	else isActive = false;

	const handleClick = e => {
		onclick(id);
	};
</script>

<div on:click={handleClick}>
	<slot />
</div>
