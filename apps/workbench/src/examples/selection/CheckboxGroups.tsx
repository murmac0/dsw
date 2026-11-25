import { Checkbox, CheckboxGroup, Grid } from "@dsw/ui";

export default function CheckboxGroups() {
  return (
    <Grid columns={2} gap="lg">
      <CheckboxGroup
        label="Notify me by"
        description="We'll only message you about your orders."
        defaultValue={["email"]}
      >
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
        <Checkbox value="push">Push notifications</Checkbox>
      </CheckboxGroup>
      <CheckboxGroup
        label="Interests"
        isInvalid
        errorMessage="Choose at least one."
        orientation="horizontal"
      >
        <Checkbox value="design">Design</Checkbox>
        <Checkbox value="code">Code</Checkbox>
        <Checkbox value="ops">Ops</Checkbox>
      </CheckboxGroup>
    </Grid>
  );
}
