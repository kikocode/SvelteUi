<script>
	import { Button } from '../components/Button';
	import { Ripple } from '../components/Ripple';
	import { Accordeon } from '../components/Accordeon';
	import { useRipple } from '../components/Ripple';

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
</script>

<style type="text/scss">
	h1 {
		color: purple;
	}

	.sheet {
		margin: 10px;
		position: relative;
		overflow: hidden;
		width: 200px;
		height: 60px;
		border-radius: 5px;
		background: white;
		box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
	}

	.circle {
		margin: 10px;
		position: relative;
		width: 60px;
		height: 60px;
		background: white;
		box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #333;
		font-size: 36px;
	}

	.tagLabel {
		font-size: 12px;
		color: rgba(0, 0, 0, 0.6);
		background: rgba(0, 0, 0, 0.07);
		display: inline-flex;
		align-self: flex-start;
		padding: 6px 9px;
		border-radius: 50px;
	}

	.row {
		display: flex;
		align-items: flex-start;
	}
	.column {
		display: flex;
		flex-flow: column;
		align-items: flex-start;
	}
</style>

<Button
	color={randomColor}
	on:click={setRandomColor}
	outlined={true}
	style="border-width: 2px; border-radius: 50px;">
	<Ripple color={randomColor} />
	Random Color
</Button>

<h2>Accordeon</h2>

<Block>
	<Accordeon>
		<p slot="header">header</p>
		<p slot="body">Body text</p>
	</Accordeon>

</Block>

<h2>Ripple</h2>

<Block>
	<Button color={randomColor}>
		<Ripple />
		Button
	</Button>
	<div class="sheet">
		<Ripple color={'#bbdd33'} />
	</div>
	<div class="sheet">
		<Ripple color={'#bb00aa'} />
	</div>
	<div class="sheet">
		<Ripple color="#000000" />
	</div>
	<div class="circle">
		+
		<Ripple color="#ff00bb" />
	</div>
	<div class="circle">
		-
		<Ripple color="#99abd2" />
	</div>
</Block>
