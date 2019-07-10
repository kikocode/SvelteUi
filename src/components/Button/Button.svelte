<script>
	import {
		hexToRGB,
		getContrastColor,
		lighten,
		darken
	} from '../../utils/color.js';

	export let use = () => {};
	export let color = '#1976d2';
	export let style = '';
	export let disabled = false;
	export let raised = false;
	export let outlined = false;
	export let simple = false;
	export let size = 'medium';

	$: disabledClass = disabled ? 'button--disabled' : '';
	$: raisedClass = raised ? 'button--raised' : '';
	$: outlinedClass = outlined ? 'button--outlined' : '';
	$: simpleClass = simple ? 'button--simple' : '';
	$: sizeClass = sizes[size] ? sizes[size].class : size;
	$: buttonClasses = `${disabledClass} ${raisedClass} ${outlinedClass} ${simpleClass} ${sizeClass}`;
	$: textColor = getContrastColor(color);
	$: if (textColor == '#000000') {
		textColor = hexToRGB(textColor, 0.85);
	} else {
		textColor = hexToRGB(textColor, 1);
	}

	$: buttonStyles = `
    ${style};
    --primary-color:  ${color};
    --primary-color-dark:  ${darken(color, 10)};
    --primary-color-medium:  ${hexToRGB(color, 0.8)};
    --primary-color-light:  ${hexToRGB(color, 0.4)};
    --primary-color-soft:  ${hexToRGB(color, 0.08)};
    --text-color:  ${textColor};
  `;

	let sizes = {
		small: {
			class: 'button--small'
		},
		medium: {
			class: 'button--medium'
		},
		large: {
			class: 'button--large'
		}
	};
</script>

<style type="text/scss">
	.button {
		--disabled-text-color: rgba(0, 0, 0, 0.26);
		--disabled-bg-color: rgba(0, 0, 0, 0.12);
		--height: 36px;
		--padding: 0px 16px;
		--font-size: 14px;
		--transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
			box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
			border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

		outline: none;
		border: none;
		margin: 8px;
		position: relative;
		overflow: hidden;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		cursor: pointer;
		transition: var(--transition);
		height: var(--height);
		padding: var(--padding);
		font-size: var(--font-size);
		background: var(--primary-color);
		color: var(--text-color);
		font-weight: 500;
		border-radius: 4px;
		text-transform: uppercase;

		&:hover {
			background: var(--primary-color-dark);
		}
	}

	.button--disabled {
		background: var(--disabled-bg-color);
		color: var(--disabled-text-color);
		cursor: default;
		pointer-events: none;
	}

	.button--raised {
		box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
			0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
	}

	.button--outlined {
		background: none;
		border: 1px solid var(--primary-color-light);
		color: var(--primary-color);

		&:hover {
			border-color: var(--primary-color-medium);
			background: var(--primary-color-soft);
		}
		&.button--disabled {
			border-color: var(--disabled-text-color);
			color: var(--disabled-text-color);
		}
	}

	.button--simple {
		background: none;
		color: var(--primary-color);

		&:hover {
			background: var(--primary-color-soft);
		}
		&.button--disabled {
			color: var(--disabled-text-color);
		}
	}
	.button--small {
		font-size: 12px;
		padding: 0 14px;
		--height: 30px;
	}
	.button--large {
		font-size: 16px;
		padding: 0 24px;
		--height: 42px;
	}
</style>

<button on:click class={'button ' + buttonClasses} style={buttonStyles} use:use>
	<slot />
</button>
