import { useState } from "react";
import { Checkbox, Fieldset, Grid, Stack, TextField } from "@dsw/ui";

/** `section` scopes autocomplete so browsers fill the right address (1.3.5). */
function AddressFields({ section }: { section: "shipping" | "billing" }) {
  return (
    <>
      <TextField label="Street" autoComplete={`${section} street-address`} />
      <TextField label="City" autoComplete={`${section} address-level2`} />
    </>
  );
}

export default function ShippingAndBilling() {
  const [sameAsShipping, setSameAsShipping] = useState(true);
  return (
    <Grid columns={2} gap="lg">
      <Fieldset legend="Shipping address" description="Where we send your order." variant="boxed">
        <AddressFields section="shipping" />
      </Fieldset>
      <Stack gap="md">
        <Checkbox isSelected={sameAsShipping} onChange={setSameAsShipping}>
          Billing address is the same as shipping
        </Checkbox>
        <Fieldset legend="Billing address" variant="boxed" isDisabled={sameAsShipping}>
          <AddressFields section="billing" />
        </Fieldset>
      </Stack>
    </Grid>
  );
}
