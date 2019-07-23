<script>
	import { Button } from '../components/Button';
	import { Ripple } from '../components/Ripple';
	import { useRipple } from '../components/Ripple';

	import { Block } from '../components/Layout';
	import { Line } from '../components/Layout';

	import { randomHex } from '../components/utils/color.js';
	import { colors } from '../components/utils/color.js';

	import { Favorite } from '../assets/icons';
	import { Phone } from '../assets/icons';
	import { Star } from '../assets/icons';
	import { Check } from '../assets/icons';
	import { Close } from '../assets/icons';

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

<h2>Buttons</h2>
<h3>Types</h3>
<Block>

	<div style="flex-flow:column">
		<div>
			<Button color="#2a74e6" raised={true}>
				<Ripple color={'#ffffff'} />
				Raised
			</Button>
			<Button color="#2a74e6">
				<Ripple color={'#ffffff'} />
				Flat
			</Button>
			<Button color="#2a74e6" outlined={true}>
				<Ripple color={'#3781b7'} />
				Outlined
			</Button>
			<Button color="#2a74e6" simple={true}>
				<Ripple color={'#3781b7'} />
				Simple
			</Button>
		</div>

	</div>
</Block>

<h3>Disabled</h3>
<Block>
	<div>
		<Button color="#c12da0" disabled={true}>
			<Ripple color={'#ffffff'} />
			Flat
		</Button>
		<Button color={randomColor} outlined={true} disabled={true}>
			<Ripple color={randomColor} />
			Outlined
		</Button>
		<Button color={randomColor} simple={true} disabled={true}>
			<Ripple color={randomColor} />
			Simple
		</Button>
	</div>
</Block>

<h3>Colored</h3>
<Block>
	<div>
		<Button color="#333333" raised={true}>
			<Ripple color={'#ffffff'} />
			Raised
		</Button>
		<Button color="#333333">
			<Ripple color={'#ffffff'} />
			Flat
		</Button>
		<Button color="#333333" outlined={true}>
			<Ripple color={'#3781b7'} />
			Outlined
		</Button>
		<Button color="#333333" simple={true}>
			<Ripple color={'#3781b7'} />
			Simple
		</Button>
	</div>
</Block>

<h3>Sizes</h3>
<Block>
	<div>
		<Button color={randomColor} size={'small'} raised={true}>
			Small
			<Ripple />
		</Button>
		<Button color={randomColor} size={'medium'} raised={true}>
			Medium
			<Ripple />
		</Button>
		<Button color={randomColor} size={'large'} raised={true}>
			Large
			<Ripple />
		</Button>
	</div>
</Block>

<h3>Random Color</h3>
<Block>
	<Button color={randomColor} on:click={setRandomColor} raised={true}>
		Random Color
		<Ripple color={'#000000'} />
	</Button>

	<Button color={randomColor} on:click={setRandomColor} outlined={true}>
		<Ripple color={randomColor} />
		Outlined
	</Button>

	<Button color={randomColor} on:click={setRandomColor} simple={true}>
		<Ripple color={randomColor} />
		Simple
	</Button>
</Block>
