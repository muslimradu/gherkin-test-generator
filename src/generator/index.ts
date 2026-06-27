import type { GherkinFeature, TargetLanguage, GeneratedFile } from '../types/gherkin';
import { generatePlaywrightTs } from './playwrightTs';
import { generatePlaywrightJs } from './playwrightJs';
import { generateCypressTs } from './cypressTs';
import { generateCypressJs } from './cypressJs';
import { generateSeleniumJava } from './seleniumJava';

export type FrameworkGenerator = (feature: GherkinFeature) => GeneratedFile[];

const GENERATOR_REGISTRY: Record<TargetLanguage, FrameworkGenerator> = {
  'playwright-ts':  (feature) => generatePlaywrightTs(feature, true),
  'playwright-js':  generatePlaywrightJs,
  'cypress-ts':     generateCypressTs,
  'cypress-js':     generateCypressJs,
  'selenium-java':  generateSeleniumJava,
};

export function generate(feature: GherkinFeature, language: TargetLanguage): GeneratedFile[] {
  const generator = GENERATOR_REGISTRY[language];
  if (!generator) throw new Error(`No generator registered for language: ${language}`);
  return generator(feature);
}

export function getSupportedLanguages(): TargetLanguage[] {
  return Object.keys(GENERATOR_REGISTRY) as TargetLanguage[];
}
