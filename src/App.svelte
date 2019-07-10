<script>
	import Buttons from './demo/Buttons.svelte';
	import UiComponents from './demo/UiComponents.svelte';
	import { Screen } from './components/Layout';

	import { Ripple } from './components/Ripple';
	import { ToggleButton } from './components/Toggle';
	import { ToggleGroup } from './components/Toggle';
	import { Toggle } from './components/Toggle';

	let headColor = '#bb2266';

	let current = '';

	let menupoints = [
		'Toggle Groups',
		'Circle Navigation',
		'Accordeon',
		'Buttons',
		'Textfields'
	];
</script>

<style>
	:global(body) {
		margin: 0;
	}
	.headbar {
		width: 100%;
		height: 55px;
		display: flex;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		margin-bottom: 20px;
		color: rgba(0, 0, 0, 0.85);
		align-items: center;
	}
	.headbar-center {
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.headbar-link {
		display: inline-flex;
		border-radius: 5px;
		padding: 8px 10px;
		cursor: pointer;
		position: relative;
		font-size: 14px;

		&:hover {
			color: #2a74e6;
		}
		&.on {
			color: #2a74e6;
		}
	}
</style>

<div class="headbar">
	<div class="headbar-center">

		<div class="toggleGroupOffset">
			<!--<ToggleGroup
        let:active
        on:change={a => {
          current = a.detail.active;
        }}>
        {#each menupoints as menupoint, i}
          <ToggleButton id={i} color={headColor} nostyle={true}>
            <div class="headbar-link" class:on={current === i}>
               {menupoint}
            </div>
          </ToggleButton>
        {/each}
      </ToggleGroup>-->
		</div>

	</div>
</div>
<Screen>
	<UiComponents />
</Screen>
