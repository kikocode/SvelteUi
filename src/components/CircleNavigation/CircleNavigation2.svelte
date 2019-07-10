<script>
	import { onMount } from 'svelte';

	import Ripple from '../Ripple/Ripple.svelte';

	export let useNestedElements = true;
	export let ripple = true;
	export let color = '#ff00aa';
	export let circleContent;

	let circleSize = 60;
	let elementSize = 40;

	let bgRef;
	let elementsRef;
	let elems;

	$: circleNavigationStyle = `
		--color: ${color};
		--circle-size: ${circleSize}px;
		--element-size: ${elementSize}px;
	`;

	onMount(() => {
		elems = elementsRef.childNodes;
		// using svelte's {#each} inside a named slot renders an extra div, which will be taken care of here until fixed
		// @see - https://github.com/sveltejs/svelte/issues/2080
		if (useNestedElements) elems = elems[0].childNodes;
		elems.forEach((el, i) => {
			let top = circleSize / 2 - elementSize / 2;
			let left = circleSize / 2 - elementSize / 2;
			el.style.opacity = `0`;
			el.style.top = `${top}px`;
			el.style.left = `${left}px`;
			if (el.classList) el.classList.add('circle-navigation_element');
		});
	});

	const handleMouseover = e => {
		let gapX = 10;
		let startX = circleSize + gapX;
		let maxW = startX;

		elems.forEach((el, i) => {
			let w = el.offsetWidth;
			let left = i * (w + gapX) + startX;
			maxW += i * (w + gapX);

			el.style.opacity = `1`;
			el.style.left = `${left}px`;
		});

		bgRef.style = `
			width:${maxW}px;
		`;
	};

	const handleMouseout = e => {
		elems.forEach((el, i) => {
			let left = circleSize / 2 - elementSize / 2;
			el.style.left = `${left}px`;
		});
		bgRef.style = `
			width:100%;
		`;
	};
</script>

<style>
	.circle-navigation {
		position: relative;
		margin: 15px;
		--transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
			box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
			border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
		--box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
			0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
	}

	.circle-navigation :global(.circle-navigation_element) {
		position: absolute;
		z-index: 20;
		opacity: 0;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		width: var(--element-size);
		height: var(--element-size);
		background: var(--color);
		transition: var(--transition);
		box-shadow: var(--box-shadow);
	}

	.circle-navigation_button {
		position: relative;
		z-index: 100;
		overflow: hidden;

		align-items: center;
		justify-content: center;
		display: flex;
		color: white;
		fill: white;
		cursor: pointer;
		width: var(--circle-size);
		height: var(--circle-size);
		box-shadow: var(--box-shadow);
		transition: var(--transition);
		background: var(--color);
		border-radius: 50%;
	}
	.circle-navigation_button > :global(*) {
		display: flex;
	}

	.circle-navigation_background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: transparent;
	}

	.circle-navigation_elements {
	}
</style>

<div
	class="circle-navigation"
	on:mouseover={handleMouseover}
	on:mouseout={handleMouseout}
	style={circleNavigationStyle}>

	<button class="circle-navigation_button">
		{#if ripple}
			<Ripple />
		{/if}

		<slot name="circle" />
	</button>
	<div class="circle-navigation_elements" bind:this={elementsRef}>
		<slot name="elements" />
	</div>

	<div class="circle-navigation_background" bind:this={bgRef} />
</div>
