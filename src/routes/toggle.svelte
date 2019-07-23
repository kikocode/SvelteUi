<script>
	import { Textfield } from '../components/Textfield';
	import { Toggle } from '../components/Toggle';
	import { Checkbox } from '../components/Checkbox';

	import { Ripple } from '../components/Ripple';
	import { useRipple } from '../components/Ripple';

	import {
		ToggleGroup,
		ToggleGroupElement,
		ToggleButton,
		Switch
	} from '../components/Toggle';

	import { Block } from '../components/Layout';
	import { Line } from '../components/Layout';

	import { randomHex } from '../components/utils/color.js';
	import { colors } from '../components/utils/color.js';

	let randomColor = '#2a74e6';

	const setRandomColor = () => {
		//var c = randomHex();
		var c = colors[Math.round(Math.random() * colors.length)];
		randomColor = c;
	};

	const randomIcon = () => {
		const icons = [Check, Favorite, Phone, Star, Close];
		return randomPick(icons);
	};

	const randomPick = arr => {
		return arr[Math.floor(Math.random() * arr.length)];
	};

	let circles1 = Array.from({ length: 5 }, () => ({ icon: randomIcon() }));
	let circles2 = Array.from({ length: 8 }, () => ({ icon: randomIcon() }));
	let circles3 = Array.from({ length: 2 }, () => ({ icon: randomIcon() }));

	let actives0 = [];
	let actives1 = [];
	let actives2 = [];
	let actives4 = [];
</script>

<h2>Toggle Group</h2>
<Block>

	<div style="display:flex; flex-flow:column">
		<div>

			<ToggleGroup
				on:change={e => {
					actives4 = e.detail.actives;
				}}>
				{#each new Array(3).fill('') as el, i}
					<ToggleGroupElement id={i}>
						<Checkbox
							checked={actives4.includes(i)}
							color="#bbddaa"
							label="test" />
					</ToggleGroupElement>
				{/each}
			</ToggleGroup>

		</div>
		<div>
			<ToggleGroup
				on:change={e => {
					actives0 = e.detail.actives;
				}}>
				{#each new Array(3).fill('') as el, i}
					<ToggleGroupElement id={i}>
						<ToggleButton isOn={actives0.includes(i)} color={randomColor}>
							Toggle Button {i}
							<Ripple color={randomColor} />
						</ToggleButton>
					</ToggleGroupElement>
				{/each}
			</ToggleGroup>
		</div>

		<div>
			<ToggleGroup
				on:change={e => {
					actives1 = e.detail.actives;
				}}>
				{#each new Array(3).fill('') as el, i}
					<ToggleGroupElement id={i}>
						<Switch isOn={actives1.includes(i)} color={randomColor} />
					</ToggleGroupElement>
				{/each}
			</ToggleGroup>
		</div>

		<div>
			<ToggleGroup
				on:change={e => {
					actives2 = e.detail.actives;
				}}
				multiple={false}>
				{#each new Array(3).fill('') as el, i}
					<ToggleGroupElement id={i}>
						<Toggle toggle={actives2.includes(i)} color={randomColor} />
					</ToggleGroupElement>
				{/each}
			</ToggleGroup>
		</div>

	</div>
</Block>

<h2>Toggle Buttons</h2>

<Block>
	<Toggle />
	<Toggle toggle={true} color="#bb99dd" />
	<Toggle toggle={true} color="#99aa33" />
	<Toggle toggle={true} color="#88bbaa" />
	<Toggle toggle={true} color="#88bbaa" disabled={true} />
	<Toggle toggle={false} color="#88bbaa" disabled={true} />
</Block>

<h2>Checkboxes</h2>

<Block>
	<Checkbox color="#bbddaa" />
	<Checkbox color="#bbddaa" label="Checkbox 02" />
</Block>
