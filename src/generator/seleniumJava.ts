import type { GherkinFeature, GherkinScenario, GherkinStep, GeneratedFile } from '../types/gherkin';
import { extractValue } from '../parser/gherkinParser';

function toClassName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function toMethodName(name: string): string {
  const pascal = toClassName(name);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function generateStepCode(step: GherkinStep): string {
  const lines: string[] = [];
  const value = extractValue(step.text);

  lines.push(`        // ${step.keyword} ${step.text}`);

  switch (step.action) {
    case 'navigate':
      lines.push(`        driver.get("${value}");`);
      break;
    case 'click':
      lines.push(`        driver.findElement(By.cssSelector("")).click();`);
      break;
    case 'fill':
      lines.push(`        driver.findElement(By.cssSelector("")).sendKeys("${value}");`);
      break;
    case 'assert': {
      const assertion = [
        `        WebElement element = driver.findElement(By.cssSelector(""));`,
        `        assertTrue("Element should be visible", element.isDisplayed());`,
      ];
      lines.push(...assertion);
      break;
    }
    default:
      lines.push(`        // TODO: ${step.keyword} ${step.text}`);
  }

  return lines.join('\n');
}

function generateScenarioMethod(
  scenario: GherkinScenario,
  background?: GherkinScenario['steps']
): string {
  const allSteps = [...(background ?? []), ...scenario.steps];
  const stepLines = allSteps.map((step) => generateStepCode(step));
  const methodName = toMethodName(scenario.name);

  return [
    `    @Test`,
    `    public void ${methodName}() {`,
    stepLines.join('\n\n'),
    `    }`,
  ].join('\n');
}

function scenarioToFilename(featureName: string): string {
  return `${toClassName(featureName)}Test.java`;
}

export function generateSeleniumJava(feature: GherkinFeature): GeneratedFile[] {
  const className = toClassName(feature.name) + 'Test';
  const methods = feature.scenarios.map((scenario) =>
    generateScenarioMethod(scenario, feature.background?.steps)
  );

  const content = [
    `import org.junit.After;`,
    `import org.junit.Before;`,
    `import org.junit.Test;`,
    `import org.openqa.selenium.By;`,
    `import org.openqa.selenium.WebDriver;`,
    `import org.openqa.selenium.WebElement;`,
    `import org.openqa.selenium.chrome.ChromeDriver;`,
    `import static org.junit.Assert.assertTrue;`,
    ``,
    `// Feature: ${feature.name}`,
    `public class ${className} {`,
    ``,
    `    private WebDriver driver;`,
    ``,
    `    @Before`,
    `    public void setUp() {`,
    `        driver = new ChromeDriver();`,
    `        driver.manage().window().maximize();`,
    `    }`,
    ``,
    methods.join('\n\n'),
    ``,
    `    @After`,
    `    public void tearDown() {`,
    `        if (driver != null) driver.quit();`,
    `    }`,
    `}`,
    ``,
  ].join('\n');

  const filename = scenarioToFilename(feature.name);
  return [{ filename, content, scenarioName: feature.name }];
}
