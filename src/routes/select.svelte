<script>
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

	import { Textfield as Textfield2 } from '../components/Input';
	import { Select } from '../components/Input';

	import Prism from 'prismjs';

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

	let selectedLang = 'html';

	function handleChangeLanguage(val) {
		selectedLang = val;
	}

	// prettier-ignore
	$: x = Prism.highlight(
`<div class="testElement">
    <Select
        label={'Outlined'}
        name="Custom"
        color="#99bbdd"
        compact={false}
        prepend="$"
        helperText="Prepend">
        <option />
        <option>Test</option>
        <option>OptionWithLongText</option>
    </Select>
</div>`,
		Prism.languages[selectedLang],
		selectedLang,
	);
</script>

<style>
	.code :global(*) {
		font-family: monospace !important;
	}
</style>

<h2>Select</h2>
{selectedLang}
<Select
	label={'Language'}
	color="#ff00aa"
	compact={true}
	value={selectedLang}
	onChange={handleChangeLanguage}>
	<option selected>markup</option>
	<option>html</option>
	<option>css</option>
	<option>javascript</option>
	<option>clike</option>
</Select>

<pre class="code">
	<code class={`lang-${selectedLang}`}>
		{@html x}
	</code>
</pre>

<Block>

	<div class="testElement">
		<Select
			label={'Outlined'}
			name="Custom"
			color="#99bbdd"
			compact={false}
			prepend="$"
			helperText="Prepend">
			<option />
			<option>Test</option>
			<option>OptionWithLongText</option>
		</Select>
	</div>

	<Select
		label={'Outlined'}
		name="Custom"
		color="#99bbdd"
		compact={false}
		append="$$"
		helperText="Append">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Filled'}
		name="Custom"
		color="#99bbdd"
		compact={false}
		prepend="¢"
		append="-Append-"
		variant="filled"
		helperText="Append/Prepend">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Outlined'}
		name="Custom"
		color="#bb99dd"
		compact={true}
		prepend="$$$"
		append="¢¢¢"
		helperText="Compact">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Filled'}
		name="Custom"
		color="#aa2277"
		compact={true}
		error={true}
		prepend="$$$"
		append="$-8"
		variant="filled"
		helperText="Error">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Simple'}
		name="Custom"
		color="#99bbaa"
		compact={false}
		prepend="¢¢¢"
		append="$"
		variant="simple"
		helperText="Simple">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Simple'}
		name="Custom"
		color="#33ddaa"
		compact={true}
		prepend="¢¢¢¢"
		append="$$$$"
		variant="simple"
		helperText="Compact">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Simple'}
		name="Custom"
		color="#33ddaa"
		compact={false}
		prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
		append="$"
		variant="filled"
		helperText="Icon">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Simple'}
		name="Custom"
		color="#33ddaa"
		compact={false}
		prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
		append="$"
		variant="outlined"
		helperText="Icon">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Simple'}
		name="Custom"
		color="#33ddaa"
		compact={false}
		prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
		append={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`}
		variant="outlined"
		helperText="2 Icons">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>

	<Select
		label={'Simple'}
		name="Custom"
		color="#33ddaa"
		compact={false}
		prepend={`<div style="width:25px; height:25px; background:pink; border-radius:50px;"></div>`}
		append={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`}
		variant="outlined"
		helperText="Html">
		<option />
		<option>Test</option>
		<option>OptionWithLongText</option>
	</Select>
</Block>

<h3>Default</h3>
<Block>

	<div class="column">
		<div class="row">
			<Select label={'Outlined'} color={randomColor}>
				<option />
				<option>Test</option>
				<option>OptionWithLongText</option>
			</Select>

			<Select prepend="$" label={'Prepend'} color={randomColor}>
				<option />
				<option>Test</option>
				<option>OptionWithLongText</option>
			</Select>

			<Select
				error={true}
				helperText="Error Text"
				label={'Outlined'}
				color={randomColor}>
				<option />
				<option>Test</option>
				<option>OptionWithLongText</option>
			</Select>

			<Select label={'Filled'} color={randomColor} variant="filled">
				<option />
				<option>Test</option>
				<option>OptionWithLongText</option>
			</Select>

			<Select label={'Compact'} color={randomColor} compact={true}>
				<option />
				<option>Test</option>
				<option>OptionWithLongText</option>
			</Select>

			<Select
				label={'Compact'}
				color={randomColor}
				variant="filled"
				compact={true}>
				<option />
				<option>Test</option>
				<option>OptionWithLongText</option>
			</Select>
		</div>
		<div class="row">
			<Select label={'Simple'} color={randomColor} variant="simple">
				<option />
				<option>Test</option>
				<option>OptionWithLongText</option>
			</Select>

			<Select
				label={'Simple'}
				compact={true}
				color={randomColor}
				variant="simple">
				<option />
				<option>Test</option>
				<option>OptionWithLongText</option>
			</Select>
		</div>
	</div>

</Block>
