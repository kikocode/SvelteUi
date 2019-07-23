<script>
	import { Ripple } from '../components/Ripple';
	import { useRipple } from '../components/Ripple';

	import { CircleNavigation } from '../components/CircleNavigation';
	import { CircleNavigation2 } from '../components/CircleNavigation';

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

	let circles1 = Array.from({ length: 5 }, () => ({ icon: randomIcon() }));
	let circles2 = Array.from({ length: 8 }, () => ({ icon: randomIcon() }));
	let circles3 = Array.from({ length: 2 }, () => ({ icon: randomIcon() }));

	let actives0 = [];
	let actives1 = [];
	let actives2 = [];
	let actives4 = [];
</script>

<style>
	.buttonLabel {
		font-size: 12px;
		color: white;
		width: auto !important;
		height: auto !important;
		padding: 10px 12px;
		border-radius: 20px !important;
	}

	.whiteIconCircle {
		fill: #666666;
		cursor: pointer;
		background: white !important;
	}
</style>

<h2>Circle Navigation</h2>
<Block>
	<div style="display:flex; position:relative;">

		<div style="display:none;">
			<CircleNavigation2 color={randomColor}>
				<div slot="circle">
					<Check />
				</div>
				<div slot="elements">
					{#each new Array(3).fill('') as elem, i}
						<div style="fill:white; cursor:pointer;">
							<Check />
							<Ripple color="#ffffff" />
						</div>
					{/each}
				</div>
			</CircleNavigation2>
		</div>

		<CircleNavigation color={randomColor} direction="right">

			<div slot="circle">
				<Close />
			</div>
			<div slot="elements">
				<div class={'buttonLabel'}>
					Right
					<Ripple color="#ffff00" />
				</div>
				{#each Array.from({ length: 6 }, () => ({
					icon: randomIcon()
				})) as elem, i}
					<div class={'whiteIconCircle'}>
						<svelte:component this={elem.icon} />
						<Ripple color="#000000" />
					</div>
				{/each}
			</div>
		</CircleNavigation>

		<div>
			<CircleNavigation color={randomColor} direction="bottom">
				<div slot="circle">
					<Close />
				</div>
				<div slot="elements">
					<div class={'buttonLabel'}>Bot</div>
					{#each Array.from({ length: 2 }, () => ({
						icon: randomIcon()
					})) as elem, i}
						<div class={'whiteIconCircle'}>
							<svelte:component this={elem.icon} />
							<Ripple color="#000000" />
						</div>
					{/each}

				</div>
			</CircleNavigation>
			<CircleNavigation color={randomColor} direction="top">
				<div slot="circle">
					<Close />
				</div>
				<div slot="elements">
					<div class={'buttonLabel'}>Top</div>
					{#each Array.from({ length: 2 }, () => ({
						icon: randomIcon()
					})) as elem, i}
						<div class={'whiteIconCircle'}>
							<svelte:component this={elem.icon} />
							<Ripple color="#000000" />
						</div>
					{/each}
				</div>
			</CircleNavigation>
		</div>
		<CircleNavigation color={randomColor} direction="left">
			<div slot="circle">
				<Close />
			</div>
			<div slot="elements">
				<div class={'buttonLabel'}>Left</div>
				{#each Array.from({ length: 8 }, () => ({
					icon: randomIcon()
				})) as elem, i}
					<div class={'whiteIconCircle'}>
						<svelte:component this={elem.icon} />
						<Ripple color="#000000" />
					</div>
				{/each}
			</div>
		</CircleNavigation>

	</div>

</Block>
