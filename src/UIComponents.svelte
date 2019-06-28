<script>
  import Textfield from "./Textfield/Textfield.svelte";
  import Toggle from "./Toggle/Toggle.svelte";
  import Checkbox from "./Checkbox/Checkbox.svelte";
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
</script>

<style>
  h1 {
    color: purple;
  }
</style>

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
    label={'With Helper'}
    name="Name"
    color="#99bbee"
    compact={false}
    error={error12}
    helperText={'Helper Text'} />

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

<h2>Toggle Buttons</h2>

<Block>
  <Toggle />
  <Toggle toggle={true} color="#bb99dd" />
  <Toggle toggle={true} color="#99aa33" />
  <Toggle toggle={true} color="#88bbaa" />
</Block>

<h2>Checkboxes</h2>

<Block>
  <Checkbox color="#bbddaa" />
  <Checkbox color="#bbddaa" label="Checkbox 02" />
</Block>
