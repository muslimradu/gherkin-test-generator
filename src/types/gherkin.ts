export type GherkinKeyword =
  | 'Feature'
  | 'Background'
  | 'Scenario'
  | 'Scenario Outline'
  | 'Given'
  | 'When'
  | 'Then'
  | 'And'
  | 'But'
  | 'Examples';

export type StepAction =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'assert'
  | 'unknown';

export interface GherkinStep {
  keyword: GherkinKeyword;
  text: string;
  action: StepAction;
  originalLine: string;
  lineNumber: number;
}

export interface GherkinBackground {
  steps: GherkinStep[];
}

export interface GherkinScenario {
  name: string;
  steps: GherkinStep[];
  tags: string[];
  lineNumber: number;
}

export interface GherkinFeature {
  name: string;
  description: string;
  background?: GherkinBackground;
  scenarios: GherkinScenario[];
  tags: string[];
}

export type TargetLanguage =
  | 'playwright-ts'
  | 'playwright-js'
  | 'cypress-ts'
  | 'cypress-js'
  | 'selenium-java';

export interface GeneratorConfig {
  language: TargetLanguage;
  includeComments: boolean;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  scenarioName: string;
}

export interface ParseResult {
  success: boolean;
  feature?: GherkinFeature;
  error?: string;
}
