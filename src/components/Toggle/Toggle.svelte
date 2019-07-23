<script>
	export let toggle = false;
	export let color = '#333333';
	export let disabled = false;

	$: toggleClass = toggle ? 'toggle--on' : '';
	$: disabledClass = disabled ? 'toggle--disabled' : '';
	$: toggleClasses = `${toggleClass} ${disabledClass}`;
	$: toggleStyle = `
    --color-primary: ${color};
  `;

	const handleClick = () => {
		if (disabled) return;
		toggle = !toggle;
	};
</script>

<style type="text/scss">
	.toggle {
		--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
		--color-disabled: #dbdbdb;

		display: inline-flex;
		cursor: pointer;
		margin-top: 12px;
		margin-bottom: 8px;
		margin-left: 8px;
		margin-right: 8px;

		* {
			box-sizing: border-box;
		}
	}

	.toggle-bg {
		position: relative;
		border: 1px solid rgba(0, 0, 0, 0.3);
		background: white;
		width: 44px;
		height: 22px;
		border-radius: 50px;
		transition: background var(--transition-fast);
	}

	.toggle-grabber {
		position: absolute;
		top: 3px;
		left: 4px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #7d7d7d;
		transition: left var(--transition-fast);
	}

	.toggle--on {
		.toggle-grabber {
			background: white;
			left: 24px;
		}
		.toggle-bg {
			background: var(--color-primary);
			border-color: var(--color-primary);
		}
	}

	.toggle--disabled {
		cursor: default;
		pointer-events: none;

		.toggle-grabber {
			background: rgba(0, 0, 0, 0.3);
		}
		.toggle-bg {
			border-color: rgba(0, 0, 0, 0.18);
		}

		&.toggle--on {
			.toggle-grabber {
				background: #a0a0a0;
			}
			.toggle-bg {
				background: var(--color-disabled);
				border-color: var(--color-disabled);
			}
		}
	}
</style>

<div
	class={`toggle ${toggleClasses}`}
	on:click={handleClick}
	style={toggleStyle}>

	<div class="toggle-bg">
		<div class="toggle-grabber" />
	</div>
</div>
