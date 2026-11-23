import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";
import plugin from "../index.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: "module",
  },
});
const { rules } = plugin;
const fix = [{ fix: true }];

tester.run("prefer-ds-components", rules["prefer-ds-components"], {
  valid: [
    "<Button onPress={save}>Save</Button>",
    "<div><span>text</span></div>",
    "<a name='anchor'>no href</a>",
    "<input type='hidden' name='csrf' />",
    { code: "<button>ok</button>", options: [{ ignore: ["button"] }] },
  ],
  invalid: [
    // Reported without the fix option: same message, no rewrite.
    { code: "<button onClick={() => save()}>Save</button>", errors: [{ messageId: "use" }] },
    {
      code: "<button onClick={() => save()} disabled={busy} type='submit'>Save</button>",
      options: fix,
      output:
        "import { Button } from \"@dsw/ui\";\n<Button onPress={() => save()} isDisabled={busy} type='submit'>Save</Button>",
      errors: [{ message: /^Use <Button> from @dsw\/ui instead of <button>:/ }],
    },
    {
      code: 'import { Card } from "@dsw/ui";\nconst x = <h2 id="t">Title</h2>;',
      options: fix,
      output: 'import { Card, Heading } from "@dsw/ui";\nconst x = <Heading level={2} id="t">Title</Heading>;',
      errors: 1,
    },
    {
      code: 'import React from "react";\n<a href="/docs" target="_blank" rel="noopener noreferrer">Docs</a>',
      options: fix,
      output: 'import React from "react";\nimport { Link } from "@dsw/ui";\n<Link href="/docs" isExternal>Docs</Link>',
      errors: 1,
    },
    // The handler reads the DOM event: onPress's event differs, so no fix.
    { code: "<button onClick={(e) => e.preventDefault()}>x</button>", options: fix, output: null, errors: 1 },
    // Custom styling needs a decision (which variant?), not a rewrite.
    { code: "<button className='btn'>x</button>", options: fix, output: null, errors: 1 },
    { code: "<button {...props}>x</button>", options: fix, output: null, errors: 1 },
    // A local Button already owns the name.
    { code: "function Button() {}\n<button>x</button>", options: fix, output: null, errors: 1 },
    { code: "<input type='checkbox' />", errors: [{ message: /^Use <Checkbox> from @dsw\/ui instead of <input>:/ }] },
    { code: "<input />", errors: [{ message: /^Use <TextField> from @dsw\/ui instead of <input>:/ }] },
    { code: "<select><option /></select>", errors: 1 },
  ],
});

tester.run("no-react-aria-direct", rules["no-react-aria-direct"], {
  valid: [
    'import { Button } from "@dsw/ui";',
    'import type { Key } from "react-aria-components";',
    'import { type Key, RouterProvider } from "react-aria-components";',
  ],
  invalid: [
    {
      code: 'import { Button, type Key } from "react-aria-components";',
      errors: [{ messageId: "direct", data: { names: "Button", source: "react-aria-components" } }],
    },
    { code: 'import { useButton } from "react-aria";', errors: 1 },
  ],
});

tester.run("prefer-layout-primitives", rules["prefer-layout-primitives"], {
  valid: [
    // No gap: centring an icon is a component's internals.
    "stylex.create({ icon: { display: 'flex', alignItems: 'center' } });",
    "const s = { a: { display: 'flex', gap: 8 } };",
  ],
  invalid: [
    {
      code: "stylex.create({ list: { display: 'flex', flexDirection: 'column', gap: space.md } });",
      errors: [{ message: /hand-written Stack\./ }],
    },
    {
      code: "stylex.create({ row: { display: { default: 'flex' }, gap: space.sm } });",
      errors: [{ message: /hand-written Inline\./ }],
    },
    {
      code: "stylex.create({ cards: { display: 'grid', gap: space.lg } });",
      errors: [{ message: /hand-written Grid\./ }],
    },
  ],
});

tester.run("no-primitive-tokens", rules["no-primitive-tokens"], {
  valid: ['import { color } from "@dsw/tokens/semantic.stylex";'],
  invalid: [{ code: 'import { colorPrimitives } from "@dsw/tokens/primitives.stylex";', errors: 1 }],
});

tester.run("no-token-barrel", rules["no-token-barrel"], {
  valid: ['import type { BrandName } from "@dsw/tokens";', 'import { space } from "@dsw/tokens/semantic.stylex";'],
  invalid: [{ code: 'import { space } from "@dsw/tokens";', errors: 1 }],
});

tester.run("no-inline-style", rules["no-inline-style"], {
  valid: ["<div style={dynamic} />", "<Stack gap='md' />"],
  invalid: [{ code: "<div style={{ padding: 12 }} />", errors: 1 }],
});

tester.run("no-raw-style-values", rules["no-raw-style-values"], {
  valid: [
    "stylex.create({ a: { padding: space.md, width: '100%' } });",
    "stylex.create({ a: { width: '1px' } }); // token-exempt: hairline",
  ],
  invalid: [{ code: "stylex.create({ a: { padding: '12px', color: '#fff' } });", errors: 2 }],
});
