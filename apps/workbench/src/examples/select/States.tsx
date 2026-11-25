import { Grid, Select, SelectItem } from "@dsw/ui";

export default function States() {
  return (
    <Grid columns={2} gap="lg">
      <Select label="Country" placeholder="Choose a country">
        <SelectItem id="ie">Ireland</SelectItem>
        <SelectItem id="nz">New Zealand</SelectItem>
        <SelectItem id="pt">Portugal</SelectItem>
      </Select>
      <Select label="Disabled" isDisabled defaultValue="pt">
        <SelectItem id="pt">Portugal</SelectItem>
      </Select>
    </Grid>
  );
}
