import { Checkbox, Grid, Radio, RadioGroup, Stack, Switch } from "@dsw/ui";

export default function Controls() {
  return (
    <Grid columns={3} gap="lg">
      <Stack gap="md">
        <Checkbox defaultSelected>Checked</Checkbox>
        <Checkbox>Unchecked</Checkbox>
        <Checkbox isIndeterminate>Indeterminate</Checkbox>
        <Checkbox isDisabled>Disabled</Checkbox>
      </Stack>
      <Stack gap="md">
        <Switch defaultSelected>Notifications</Switch>
        <Switch>Dark mode sync</Switch>
        <Switch isDisabled>Disabled</Switch>
      </Stack>
      <RadioGroup label="Density" defaultValue="comfortable">
        <Radio value="compact">Compact</Radio>
        <Radio value="comfortable">Comfortable</Radio>
        <Radio value="spacious" isDisabled>
          Spacious
        </Radio>
      </RadioGroup>
    </Grid>
  );
}
