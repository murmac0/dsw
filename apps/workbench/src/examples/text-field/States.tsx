import { Grid, TextField } from "@dsw/ui";

export default function States() {
  return (
    <Grid columns={2} gap="lg">
      <TextField label="Name" autoComplete="name" placeholder="Ada Lovelace" />
      <TextField label="Email" description="We never share it." isRequired />
      <TextField
        label="Username"
        defaultValue="ada!"
        isInvalid
        errorMessage="Only letters, numbers and dashes."
      />
      <TextField label="Disabled" defaultValue="Read only" isDisabled />
    </Grid>
  );
}
