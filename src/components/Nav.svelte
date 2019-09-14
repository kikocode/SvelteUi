<script>
	export let segment;
</script>

<style type="text/scss">
	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}

	.headbar {
		width: 100%;
		height: 55px;
		display: flex;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		margin-bottom: 20px;
		color: rgba(0, 0, 0, 0.85);
		align-items: center;

		li {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
		}

		a {
			display: inline-flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			cursor: pointer;
			position: relative;
			color: grey;
			font-weight: 500;

			font-size: 14px;
			padding: 0 14px;

			&:hover {
				color: #2a74e6;
			}
			&.selected {
				color: #2a74e6;
				&:after {
					content: ' ';
					position: absolute;
					bottom: 0;
					height: 2px;
					width: 100%;
					background: #2a74e6;
				}
			}
			&.on {
				color: #2a74e6;
			}
		}

		li {
			list-style: none;
		}
	}
	.headbar-center {
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>

<nav class="headbar">
	<ul class="headbar-center">
		<li>
			<a class={segment === 'textfields' ? 'selected' : ''} href="textfields">
				Textfields
			</a>
		</li>
		<li>
			<a class={segment === 'select' ? 'selected' : ''} href="select">Select</a>
		</li>
		<li>
			<a class={segment === 'buttons' ? 'selected' : ''} href="buttons">
				Buttons
			</a>
		</li>
		<li>
			<a
				class={segment === 'circle_navigation' ? 'selected' : ''}
				href="circle_navigation">
				Circle Navigation
			</a>
		</li>
		<li>
			<a class={segment === 'toggle' ? 'selected' : ''} href="toggle">Toggle</a>
		</li>
		<li>
			<a class={segment === 'ripple' ? 'selected' : ''} href="ripple">Ripple</a>
		</li>
		<li>
			<a class={segment === 'lab' ? 'selected' : ''} href="lab">Lab</a>
		</li>
	</ul>
</nav>
