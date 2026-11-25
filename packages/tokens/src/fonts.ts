/**
 * Side-effect import that registers the system's self-hosted variable
 * fonts (@font-face only; no styles). Import once at an app's entry:
 *
 *   import "@dsw/tokens/fonts";
 *
 * Self-hosted rather than a font CDN: no third-party request (privacy),
 * works offline, and versions are pinned with the rest of the system.
 * `fontFamily` tokens name these families with system fallbacks.
 */
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
// Brand fonts. @font-face only downloads a file when text actually uses
// the family, so unused brands cost nothing at runtime.
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/instrument-sans";
