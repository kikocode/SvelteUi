<script>
  import Textfield from "./Textfield/Textfield.svelte";
  import Toggle from "./Toggle/Toggle.svelte";
  import Checkbox from "./Checkbox/Checkbox.svelte";
  import Button from "./Button/Button.svelte";
  import Accordeon from "./Accordeon/Accordeon.svelte";
  import Block from "./Layout/Block.svelte";

  let list = ["Test", "Textfield 02", "E-Mail", "Enter a name"];

  let helper01 = "Test";

  let error12 = false;
  let helper12 = "";
  const handleChange12 = e => {
    let val = e.detail.target.value;
    if (val.length < 8) {
      error12 = false;
      helper12 = "< 8 chars";
    } else {
      error12 = true;
      helper12 = "!!more than 8 chars";
    }
  };
  let customStyle1 = ``;
</script>

<style type="text/scss">
  h1 {
    color: purple;
  }

  :global(body) {
    .textfield.customRounded {
      .textfield__border__start {
        width: 30px;
        border-radius: 50px 0 0 50px;
      }
      .textfield__border__end {
        border-radius: 0 50px 50px 0;
      }

      .textfield__input {
        padding: 0 30px;
      }
    }

    .textfield.customSharpEdges {
      .textfield__border,
      .textfield__borderSegment {
        border-radius: 0;
      }
    }

    .textfield.customFontsize {
      .textfield__input {
        font-size: 20px;
      }
    }
    .textfield.customFont {
      .textfield__helperText {
        font-family: monospace;
      }
      .textfield__element {
        * {
          font-family: monospace;
        }
      }
    }

    .textfield.customBackground {
      .textfield__element {
        background: white;
      }
    }
  }
</style>

<h2>Accordeon</h2>

<Block>
  <Accordeon>
    <h1 slot="header">
     header stuff
    </h1>
    <p slot="body">
      Body text
    </p>
  </Accordeon>

</Block>

<h2>Buttons</h2>

<Block>
  <Button text="Button 01" />
</Block>

<h2>Checkboxes</h2>

<Block>
  <Checkbox color="#bbddaa" />
  <Checkbox color="#bbddaa" label="Checkbox 02" />
</Block>

<h2>Textfields</h2>

<h3>Simple</h3>

<Block>
  <Textfield label={'Simple'} name="Name" color="#bb88dd" variant={'simple'} />

  <Textfield
    on:change={e => {
      helper01 = e.detail.target.value;
    }}
    label={'Simple'}
    name="Name"
    color="#bb88dd"
    variant={'simple'}
    helperText={helper01} />

  <Textfield
    label={'Simple'}
    name="Name"
    color="#bb88dd"
    variant={'simple'}
    compact={true}
    helperText="Compact" />

  <Textfield
    label={'Simple'}
    name="Name"
    color="#bb88dd"
    variant={'simple'}
    error={true}
    helperText="Error" />

  <Textfield
    label={'Simple'}
    name="Name"
    color="#bb88dd"
    variant={'simple'}
    disabled={true}
    helperText="Disabled" />

  <Textfield
    label={'Simple'}
    name="Name"
    color="#bb88dd"
    variant={'simple'}
    multiline={true}
    helperText="Multiline" />

</Block>

<h3>Outlined</h3>
<Block>
  <Textfield label={'Textfield'} name="Name" color="#bb88dd" compact={false} />
  <Textfield
    label={'fixed width'}
    name="Name"
    color="#bb88dd"
    compact={false}
    style="width:100px" />
  <Textfield
    label={'very long test description of a label'}
    name="Name"
    color="#00aa88"
    compact={false} />
  <Textfield label={'Compact'} name="Name" color="#00aa88" compact={true} />

  <Textfield
    label={'Number'}
    type="number"
    name="Name"
    color="#99bbee"
    compact={false}
    error={error12} />

  <Textfield
    label={'Date'}
    type="date"
    name="Name"
    color="#99bbee"
    compact={false}
    error={error12} />

  <Textfield
    label={'Search'}
    type="search"
    name="Name"
    color="#99bbee"
    compact={false}
    error={error12} />

  <Textfield
    label={'Password'}
    type="search"
    name="Name"
    color="#99bbee"
    compact={false}
    error={error12} />

  <Textfield
    label={'Disabled'}
    name="Name"
    color="#ff55aa"
    compact={false}
    error={error12}
    disabled={true} />

  <Textfield label="Name" compact={true} color="#ff99bb" helperText="Compact" />
  <Textfield
    label="Password"
    type="password"
    compact={true}
    helperText="Compact" />
  <Textfield label="E-Mail" compact={true} helperText="Compact" />

  <Textfield
    label={'100% width'}
    name="Name"
    color="#bb88dd"
    compact={false}
    style="width:100%" />

  <Textfield
    label={'Multiline'}
    name="Name"
    color="#ff55aa"
    compact={false}
    error={error12}
    helperText="Multiline"
    multiline={true} />

  <Textfield
    label={'Outlined'}
    name="Error"
    color="#bb88dd"
    compact={false}
    error={true}
    helperText="Error" />

</Block>

<h3>Filled</h3>
<Block>
  <Textfield
    label={'Filled'}
    name="Name"
    color="#99bbee"
    compact={true}
    helperText="Compact"
    variant={'filled'} />

  <Textfield
    label={'Filled'}
    name="Name"
    color="#00aa88"
    compact={false}
    helperText="Standard"
    variant={'filled'} />

  <Textfield
    label={'Error State'}
    name="Name"
    color="#00aa88"
    compact={false}
    variant={'filled'}
    error={true} />
  <Textfield
    label={'Error State'}
    name="Name"
    color="#00aa88"
    compact={false}
    variant={'filled'}
    error={true} />

  <Textfield
    label={'< 8 chars allowed'}
    name="Name"
    color="#99bbee"
    compact={false}
    variant={'filled'}
    error={error12}
    on:change={handleChange12} />

  <Textfield
    label={'< 8 chars allowed'}
    name="Name"
    color="#99bbee"
    compact={false}
    variant={'filled'}
    helperText={helper12}
    error={error12} />

  <Textfield
    label={'With Helper'}
    name="Name"
    color="#99bbee"
    compact={false}
    variant={'filled'}
    error={error12}
    helperText={'Helper Text'} />

  <Textfield
    label={'Filled'}
    name="Name"
    color="#ff55aa"
    compact={false}
    error={error12}
    disabled={true}
    variant={'filled'}
    helperText="Disabled" />

  <Textfield
    label={'Multiline'}
    name="Name"
    color="#ff55aa"
    compact={false}
    error={error12}
    variant={'filled'}
    multiline={true}
    helperText="filled" />

</Block>

<h3>Customized</h3>
<Block>

  <Textfield
    class="customRounded"
    style={customStyle1}
    label={'Outlined'}
    name="Custom"
    color="#d88bb"
    compact={false}
    helperText="Custom Shaped" />

  <Textfield
    class="customRounded"
    label={'Outlined'}
    prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
    name="Custom"
    color="#99aaff"
    compact={true}
    helperText="Custom Shaped" />

  <Textfield
    class="customSharpEdges"
    label={'Outlined'}
    prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
    name="Custom"
    color="#ff99bb"
    helperText="Sharp Edges" />

  <Textfield
    class="customFontsize"
    label={'Outlined'}
    prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
    name="Custom"
    color="#ff99bb"
    helperText="Fontsize" />

  <Textfield
    class="customFont"
    label={'Outlined'}
    prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
    name="Custom"
    color="#bbddaa"
    helperText="Font" />

  <Textfield
    class="customBackground"
    label={'Outlined'}
    prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
    name="Custom"
    color="#bbddaa"
    helperText="Background" />
</Block>

<h3>Prepend / Append</h3>
<Block>

  <div class="testElement">
    <Textfield
      style={customStyle1}
      label={'Outlined'}
      name="Custom"
      color="#99bbdd"
      compact={false}
      prepend="$"
      helperText="Prepend" />
  </div>

  <Textfield
    label={'Outlined'}
    name="Custom"
    color="#99bbdd"
    compact={false}
    append="$$"
    helperText="Append" />

  <Textfield
    label={'Filled'}
    name="Custom"
    color="#99bbdd"
    compact={false}
    prepend="¢"
    append="-Append-"
    variant="filled"
    helperText="Append/Prepend" />

  <Textfield
    label={'Outlined'}
    name="Custom"
    color="#bb99dd"
    compact={true}
    prepend="$$$"
    append="¢¢¢"
    helperText="Compact" />

  <Textfield
    label={'Filled'}
    name="Custom"
    color="#aa2277"
    compact={true}
    error={true}
    prepend="$$$"
    append="$-8"
    variant="filled"
    helperText="Error" />

  <Textfield
    label={'Simple'}
    name="Custom"
    color="#99bbaa"
    compact={false}
    prepend="¢¢¢"
    append="$"
    variant="simple"
    helperText="Simple" />

  <Textfield
    label={'Simple'}
    name="Custom"
    color="#33ddaa"
    compact={true}
    prepend="¢¢¢¢"
    append="$$$$"
    variant="simple"
    helperText="Compact" />

  <Textfield
    label={'Simple'}
    name="Custom"
    color="#33ddaa"
    compact={false}
    prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
    append="$"
    variant="filled"
    helperText="Icon" />

  <Textfield
    label={'Simple'}
    name="Custom"
    color="#33ddaa"
    compact={false}
    prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
    append="$"
    variant="outlined"
    helperText="Icon" />

  <Textfield
    label={'Simple'}
    name="Custom"
    color="#33ddaa"
    compact={false}
    prepend={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`}
    append={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`}
    variant="outlined"
    helperText="2 Icons" />

  <Textfield
    label={'Simple'}
    name="Custom"
    color="#33ddaa"
    compact={false}
    prepend={`<div style="width:25px; height:25px; background:pink; border-radius:50px;"></div>`}
    append={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`}
    variant="outlined"
    helperText="Html" />

</Block>

<h2>Toggle Buttons</h2>

<Block>
  <Toggle />
  <Toggle toggle={true} color="#bb99dd" />
  <Toggle toggle={true} color="#99aa33" />
  <Toggle toggle={true} color="#88bbaa" />
</Block>
