import type { GherkinFeature, TargetLanguage, GeneratedFile } from '../types/gherkin';
import { generatePlaywrightTs } from './playwrightTs';
import { generatePlaywrightJs } from './playwrightJs';

// ── Generator contract ────────────────────────────────────────────────────────
// Any new framework generator must implement this signature.
// The parser output (GherkinFeature) is framework-agnostic.

export type FrameworkGenerator = (feature: GherkinFeature) => GeneratedFile[];

// ── Registry ──────────────────────────────────────────────────────────────────

const GENERATOR_REGISTRY: Record<TargetLanguage, FrameworkGenerator> = {
  'playwright-ts': (feature) => generatePlaywrightTs(feature, true),
  'playwright-js': generatePlaywrightJs,
  // Future additions (uncomment when implemented):
  // 'cypress-ts':     generateCypressTs,
  // 'selenium-java':  generateSeleniumJava,
  // 'webdriverio-ts': generateWebdriverIoTs,
  // 'robot':          generateRobotFramework,
};

export function generate(feature: GherkinFeature, language: TargetLanguage): GeneratedFile[] {
  const generator = GENERATOR_REGISTRY[language];
  if (!generator) {
    throw new Error(`No generator registered for language: ${language}`);
  }
  return generator(feature);
}

export function getSupportedLanguages(): TargetLanguage[] {
  return Object.keys(GENERATOR_REGISTRY) as TargetLanguage[];
}
