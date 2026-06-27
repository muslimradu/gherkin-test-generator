import type { GherkinFeature, GherkinScenario, GherkinStep, GeneratedFile } from '../types/gherkin';
import { extractValue } from '../parser/gherkinParser';
import { scenarioToFilename } from './playwrightTs';

// ── Step code generation ──────────────────────────────────────────────────────

function generateStepCode(step: GherkinStep): string {
  const lines: string[] = [];
  const value = extractValue(step.text);

  switch (step.action) {
    case 'navigate':
      lines.push(`    await page.goto('${value}');`);
      break;
    case 'click':
      lines.push(`    await page.locator('').click();`);
      break;
    case 'fill':
      lines.push(`    await page.locator('').fill('${value}');`);
      break;
    case 'assert':
      lines.push(`    await expect(page.locator('')).toBeVisible();`);
      break;
    default:
      lines.push(`    // TODO: ${step.keyword} ${step.text}`);
  }

  return lines.join('\n');
}

// ── Scenario → test block ─────────────────────────────────────────────────────

function generateScenarioBlock(
  scenario: GherkinScenario,
  background?: GherkinScenario['steps']
): string {
  const allSteps = [...(background ?? []), ...scenario.steps];
  const stepLines = allSteps.map((step) => generateStepCode(step));

  return `test('${scenario.name}', async ({ page }) => {\n${stepLines.join('\n\n')}\n});`;
}

// ── Feature → file ────────────────────────────────────────────────────────────

export function generatePlaywrightJs(feature: GherkinFeature): GeneratedFile[] {
  return feature.scenarios.map((scenario) => {
    const testBlock = generateScenarioBlock(scenario, feature.background?.steps);

    const content = [
      `const { test, expect } = require('@playwright/test');`,
      ``,
      `// Feature: ${feature.name}`,
      ``,
      testBlock,
      ``,
    ].join('\n');

    const filename = scenarioToFilename(scenario.name, 'js');

    return { filename, content, scenarioName: scenario.name };
  });
}
