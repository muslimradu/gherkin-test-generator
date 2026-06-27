import type { GherkinFeature, GherkinScenario, GherkinStep, GeneratedFile } from '../types/gherkin';
import { extractValue } from '../parser/gherkinParser';

// ── Step code generation ──────────────────────────────────────────────────────

function generateStepCode(step: GherkinStep, includeComments: boolean): string {
  const lines: string[] = [];
  const value = extractValue(step.text);

  if (includeComments) {
    lines.push(`    // ${step.keyword} ${step.text}`);
  }

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
  background?: GherkinScenario['steps'],
  includeComments = true
): string {
  const stepLines: string[] = [];

  const allSteps = [...(background ?? []), ...scenario.steps];

  for (const step of allSteps) {
    const code = generateStepCode(step, includeComments);
    stepLines.push(code);
  }

  return `test('${scenario.name}', async ({ page }) => {\n${stepLines.join('\n\n')}\n});`;
}

// ── Feature → file ────────────────────────────────────────────────────────────

export function generatePlaywrightTs(
  feature: GherkinFeature,
  includeComments = true
): GeneratedFile[] {
  return feature.scenarios.map((scenario) => {
    const testBlock = generateScenarioBlock(
      scenario,
      feature.background?.steps,
      includeComments
    );

    const content = [
      `import { test, expect } from '@playwright/test';`,
      ``,
      `// Feature: ${feature.name}`,
      ``,
      testBlock,
      ``,
    ].join('\n');

    const filename = scenarioToFilename(scenario.name, 'ts');

    return { filename, content, scenarioName: scenario.name };
  });
}

// ── Filename helper ───────────────────────────────────────────────────────────

export function scenarioToFilename(name: string, ext: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${slug}.spec.${ext}`;
}
