<script>
	import ArrowDown from '../Icons/ArrowDown.svelte';
	import TextInputBase from './TextInputBase.svelte';

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
	export let prepend = '';
	export let append = '';
	export let onChange;

	export let style = '';
	export let className = '';
	export { className as class };

	let focused = false;

	$: textInputProps = {
		name: name,
		label: label,
		variant: variant,
		compact: compact,
		error: error,
		disabled: disabled,
		multiline: multiline,
		color: color,
		helperText: helperText,
		type: type,
		append: append,
		prepend: prepend,
		style: style,
		className: className,
		focused: focused
	};

	const handleChange = e => {
		name = e.target.value;
		onChange(e.target.value);
	};
	const handleFocus = e => {
		focused = true;
	};
	const handleBlur = e => {
		focused = false;
	};
</script>

<TextInputBase {...textInputProps} let:nativeElementClass>

	<select
		slot="nativeElement"
		class={nativeElementClass}
		{type}
		value={name}
		on:change={handleChange}
		on:keydown={handleChange}
		on:keyup={handleChange}
		on:focus={handleFocus}
		on:blur={handleBlur}>
		<slot />
	</select>

	<div slot="prepend">
		{#if prepend}
			{@html prepend}
		{/if}
	</div>
	<div slot="append">
		<ArrowDown />
	</div>
</TextInputBase>
