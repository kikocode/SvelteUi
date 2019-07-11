<script>
	import { hexToRGB } from '../../utils/color.js';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const VERSION = 1.2;

	export let name = '';
	export let label = '';
	export let variant = 'outlined'; // outlined, filled, simple
	export let compact = false;
	export let error = false;
	export let disabled = false;
	export let multiline = false;
	export let color = '#ffbb77';
	export let helperText = '';
	export let type = 'text';
	export let append = '';
	export let prepend = '';

	export let style = '';
	export let className = '';
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

	$: focusedClass = focused && !disabled ? 'textfield--focused' : '';
	$: activeClass = name != '' || focused ? 'textfield--active' : '';
	$: compactClass = compact ? 'textfield--compact' : '';
	$: errorClass = error ? 'textfield--error' : '';
	$: disabledClass = disabled ? 'textfield--disabled' : '';
	$: multilineClass = multiline ? 'textfield--multiline' : '';
	$: prependClass = append ? 'textfield--has--prepend' : '';
	$: appendClass = append ? 'textfield--has--append' : '';
	$: variantClass = variant ? 'textfield--' + variant : '';
	$: textfieldClasses = ` ${className} ${focusedClass} ${activeClass} ${compactClass} ${errorClass} ${disabledClass} ${multilineClass} ${variantClass} ${prependClass} ${appendClass}`;

	$: computeVariantProps(variant);

	const computeVariantProps = variant => {
		if (variant == 'outlined') {
			height = 55;
			if (compact) height = 39;
		} else if (variant == 'filled') {
			height = 55;
			if (compact) height = 45;
		} else if ((variant = 'simple')) {
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
		if (variant == 'simple') {
			labelX = 0;
			paddingLeft = 0;
		}
	});

	const handleChange = e => {
		name = e.target.value;
		dispatch('change', e);
	};
	const handleFocus = e => {
		focused = true;
	};
	const handleBlur = e => {
		focused = false;
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
	}

	.textfield__element {
		position: relative;
		display: flex;
	}

	.textfield__input {
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

	.textfield__label {
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

	.textfield__border__segment {
		transition: all var(--transition-fast);
		border-color: rgba(0, 0, 0, 0.25);
		border-width: 1px;
		border-style: solid;
	}

	.textfield__border {
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
	}

	.textfield__border__start {
		width: var(--padding-left);
		height: 100%;
		border-radius: 4px 0 0px 4px;
		border-right: none;
	}

	.textfield__border__gap {
		width: var(--label-width);
		height: 100%;
		border-left: none;
		border-right: none;
	}

	.textfield__border__end {
		flex: 1;
		flex-shrink: 1;
		width: 100%;
		height: 100%;
		border-radius: 0 5px 5px 0;
		border-left: none;
	}

	.textfield__prepend,
	.textfield__append {
		display: flex;
		align-items: center;
		white-space: pre;
		padding: var(--spacing-input-outlined);
		color: rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}

	.textfield__prepend {
		padding-right: 0;
	}
	.textfield__append {
		padding-left: 0;
	}

	.textfield__helper__text {
		font-size: 12px;
		margin-top: 5px;
		margin-left: 13px;
		margin-right: 13px;
		color: rgba(0, 0, 0, 0.5);
	}

	/* Hover */
	.textfield:hover {
		.textfield__border__segment {
			border-color: rgba(0, 0, 0, 0.85);
		}
	}

	/* Active */
	.textfield--active {
		.textfield__label {
			transform: translateY(-7px) scale(var(--label-scale));
			color: rgba(0, 0, 0, 0.5);
		}
		.textfield__border .textfield__border__segment.textfield__border__gap {
			border-top: 0px solid transparent;
		}
	}

	/* Focused */
	.textfield--focused {
		.textfield__label {
			color: rgba(0, 0, 0, 0.85);
			color: var(--primary-color-light);
		}
		.textfield__border .textfield__border__segment {
			border-color: var(--primary-color);
			border-width: 2px;
		}
		.textfield__border {
			border-width: 2px;
		}
	}

	/* Error */
	.textfield--error {
		.textfield__border .textfield__border__segment {
			border-color: var(--error-color);
		}
		.textfield__label {
			color: var(--error-color);
		}
		.textfield__helper__text {
			color: var(--error-color);
		}
	}

	/* Disabled */
	.textfield--disabled {
		user-select: none;
		pointer-events: none;
		.textfield__label {
			color: var(--disabled-color);
		}
		.textfield__border__segment {
			border-color: var(--disabled-color);
		}
		.textfield__input {
			color: var(--disabled-color);
		}
		.textfield__helper__text {
			color: var(--disabled-color);
		}
	}

	/**
   * Compact
   */
	.textfield--compact {
		.textfield__input {
			height: var(--height);
		}
		.textfield__label {
		}
	}

	/**
  * Filled
  */
	.textfield--filled {
		.textfield__input {
			padding: var(--spacing-input-filled);
		}
		.textfield__border__segment {
			border: none;
		}
		.textfield__border {
			border: none;
			background: rgba(0, 0, 0, 0.07);
			border-radius: 5px 5px 0 0;
			border-bottom: 1px solid rgba(0, 0, 0, 0.3);
		}
		.textfield__label {
			background: none;
		}
		/* Hover */
		&:hover .textfield__border {
			background: rgba(0, 0, 0, 0.11);
		}
		/* Active */
		&.textfield--active .textfield__label {
			transform: var(--transform-label-filled);
		}
		/* Focused */
		&.textfield--focused .textfield__border {
			border-width: 2px;
			border-color: var(--primary-color);
		}
		/* Compact */
		&.textfield--compact .textfield__input {
			padding: 20px 13px 6px;
			height: var(--height);
		}
		/* Error */
		&.textfield--error .textfield__border {
			border-bottom: 2px solid var(--error-color);
		}
		/* Disabled */
		&.textfield--disabled .textfield__border {
			border-bottom-style: dotted;
		}
	}

	/**
  * Simple
  */
	.textfield--simple {
		.textfield__input {
			margin: 0;
			padding: var(--spacing-input-simple);
			height: var(--height);
		}
		.textfield__border__segment {
			border: none;
		}
		.textfield__border {
			border-bottom: 1px solid grey;
			border-radius: 0;
		}
		.textfield__label {
			padding: 0;
		}
		.textfield__prepend {
			padding-left: 0;
		}
		.textfield__append {
			padding-right: 0;
		}
		&.textfield--has--prepend {
			.textfield__input {
				padding-left: 10px;
				padding-right: 10px;
			}
			.textfield__label {
				transform: translateX(calc(var(--prepend-width) + 10px))
					translateY(var(--label-y));
			}
		}
		.textfield__helper__text {
			margin-left: 0;
			margin-right: 0;
		}
		/* hover */
		&:hover {
			.textfield__border {
				border-color: black;
				border-width: 2px;
			}
		}
		/* compact */
		&.textfield--compact {
			.textfield__input {
				height: var(--height);
			}
		}
		/* focused */
		&.textfield--focused {
			.textfield__border {
				border-color: var(--primary-color);
				border-width: 2px;
			}
		}
		/* active */
		&.textfield--active {
			.textfield__label {
				transform: translateX(0) translateY(-10px) scale(var(--label-scale));
			}
		}
		/* multiline */
		&.textfield--multiline {
			.textfield__input {
				margin: 12px 0;
			}
		}
		/* error */
		&.textfield--error {
			.textfield__border {
				border-width: 2px;
				border-color: var(--error-color);
			}
		}
		/* disabled */
		&.textfield--disabled {
			.textfield__border {
				border-color: var(--disabled-color);
			}
		}
	}

	/**
  * Multiline
  */
	.textfield--multiline {
		.textfield__input {
			width: auto;
			padding: 0;
			margin: 15px 13px;
			margin-bottom: 10px;
		}
		/* Filled */
		&.textfield--filled {
			.textfield__input {
				padding: 0;
				margin: var(--spacing-input-filled);
			}
		}
	}
</style>

<div class={'textfield ' + textfieldClasses} style={textfieldStyle}>
	<div class="textfield__element">
		{#if prepend}
			<div class={'textfield__prepend'} bind:this={prependRef}>
				{@html prepend}
			</div>
		{/if}

		<div class="textfield__border">
			<div class="textfield__border__start textfield__border__segment" />
			<div class="textfield__border__gap textfield__border__segment">
				<div bind:this={labelRef} class="textfield__label">{label} </div>
			</div>
			<div class="textfield__border__end textfield__border__segment" />
		</div>
		{#if multiline}
			<textarea
				class="textfield__input"
				{type}
				value={name}
				on:change={handleChange}
				on:keyup={handleChange}
				on:keydown={handleChange}
				on:focus={handleFocus}
				on:blur={handleBlur} />
		{:else}
			<input
				class="textfield__input"
				{type}
				value={name}
				on:change={handleChange}
				on:keydown={handleChange}
				on:keyup={handleChange}
				on:focus={handleFocus}
				on:blur={handleBlur} />
		{/if}
		{#if append}
			<div class={'textfield__append'} bind:this={appendRef}>
				{@html append}
			</div>
		{/if}
	</div>
	{#if helperText}
		<div class="textfield__helper__text">{helperText}</div>
	{/if}
</div>
