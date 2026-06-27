import type { GherkinFeature, GherkinScenario, GherkinStep, GeneratedFile } from '../types/gherkin';
import { extractValue } from '../parser/gherkinParser';

function generateStepCode(step: GherkinStep): string {
  const lines: string[] = [];
  const value = extractValue(step.text);

  lines.push(`    // ${step.keyword} ${step.text}`);

  switch (step.action) {
    case 'navigate':
      lines.push(`    cy.visit('${value}');`);
      break;
    case 'click':
      lines.push(`    cy.get('').click();`);
      break;
    case 'fill':
      lines.push(`    cy.get('').type('${value}');`);
      break;
    case 'assert':
      lines.push(`    cy.get('').should('be.visible');`);
      break;
    default:
      lines.push(`    // TODO: ${step.keyword} ${step.text}`);
  }

  return lines.join('\n');
}

function generateScenarioBlock(
  scenario: GherkinScenario,
  background?: GherkinScenario['steps']
): string {
  const allSteps = [...(background ?? []), ...scenario.steps];
  const stepLines = allSteps.map((step) => generateStepCode(step));

  return `  it('${scenario.name}', () => {\n${stepLines.join('\n\n')}\n  });`;
}

function scenarioToFilename(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${slug}.cy.js`;
}

export function generateCypressJs(feature: GherkinFeature): GeneratedFile[] {
  return feature.scenarios.map((scenario) => {
    const testBlock = generateScenarioBlock(scenario, feature.background?.steps);

    const content = [
      `// Feature: ${feature.name}`,
      ``,
      `describe('${feature.name}', () => {`,
      testBlock,
      `});`,
      ``,
    ].join('\n');

    const filename = scenarioToFilename(scenario.name);
    return { filename, content, scenarioName: scenario.name };
  });
}
