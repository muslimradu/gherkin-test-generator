import type {
  GherkinFeature,
  GherkinScenario,
  GherkinBackground,
  GherkinStep,
  GherkinKeyword,
  StepAction,
  ParseResult,
} from '../types/gherkin';

// ── Keyword detection ─────────────────────────────────────────────────────────

const STEP_KEYWORDS: GherkinKeyword[] = ['Given', 'When', 'Then', 'And', 'But'];

const BLOCK_KEYWORDS: Record<string, GherkinKeyword> = {
  feature: 'Feature',
  background: 'Background',
  scenario: 'Scenario',
  'scenario outline': 'Scenario Outline',
  examples: 'Examples',
};

function detectStepKeyword(line: string): GherkinKeyword | null {
  for (const kw of STEP_KEYWORDS) {
    if (line.toLowerCase().startsWith(kw.toLowerCase() + ' ')) return kw;
  }
  return null;
}

function detectBlockKeyword(line: string): { keyword: GherkinKeyword; rest: string } | null {
  const lower = line.toLowerCase();
  for (const [key, kw] of Object.entries(BLOCK_KEYWORDS)) {
    if (lower.startsWith(key + ':')) {
      const rest = line.slice(key.length + 1).trim();
      return { keyword: kw, rest };
    }
  }
  return null;
}

// ── Action mapping ────────────────────────────────────────────────────────────

const ACTION_PATTERNS: Array<{ patterns: RegExp[]; action: StepAction }> = [
  {
    patterns: [
      /buka\s+halaman/i,
      /\bopen\b/i,
      /\bvisit\b/i,
      /\bnavigate\b/i,
      /\bgo to\b/i,
      /\bpergi ke\b/i,
      /\bbuka\s+url\b/i,
      /\bmenuju\b/i,
    ],
    action: 'navigate',
  },
  {
    patterns: [
      /\bklik\b/i,
      /\bclick\b/i,
      /\btekan\b/i,
      /\bpilih\b/i,
      /\bpress\b/i,
      /\bselect\b/i,
      /\btap\b/i,
    ],
    action: 'click',
  },
  {
    patterns: [
      /\bisi\b/i,
      /\binput\b/i,
      /\bketik\b/i,
      /\benter\b/i,
      /\bfill\b/i,
      /\btype\b/i,
      /\bmasukkan\b/i,
      /\btulis\b/i,
    ],
    action: 'fill',
  },
  {
    patterns: [
      /\blihat\b/i,
      /\btampil\b/i,
      /\bmuncul\b/i,
      /\bverify\b/i,
      /\bshould\b/i,
      /\bberhasil\b/i,
      /\bsee\b/i,
      /\bassert\b/i,
      /\bcheck\b/i,
      /\bmelihat\b/i,
      /\bterdapat\b/i,
      /\bexpect\b/i,
    ],
    action: 'assert',
  },
];

export function detectStepAction(text: string): StepAction {
  for (const { patterns, action } of ACTION_PATTERNS) {
    if (patterns.some((p) => p.test(text))) return action;
  }
  return 'unknown';
}

// ── Value extraction (quoted strings, numbers) ────────────────────────────────

export function extractValue(text: string): string {
  const quoted = text.match(/["']([^"']+)["']/);
  if (quoted) return quoted[1];
  return '';
}

// ── Parser ────────────────────────────────────────────────────────────────────

export function parseGherkin(raw: string): ParseResult {
  const lines = raw.split('\n');
  const trimmedLines = lines.map((l, i) => ({ text: l.trim(), lineNumber: i + 1 }));

  // Filter out empty lines and comments
  const contentLines = trimmedLines.filter(
    ({ text }) => text.length > 0 && !text.startsWith('#')
  );

  if (contentLines.length === 0) {
    return { success: false, error: 'Please input a Gherkin feature first.' };
  }

  // Must start with Feature:
  const firstLine = contentLines[0];
  const firstBlock = detectBlockKeyword(firstLine.text);
  if (!firstBlock || firstBlock.keyword !== 'Feature') {
    return { success: false, error: 'Invalid Gherkin format. Must start with "Feature:".' };
  }

  const feature: GherkinFeature = {
    name: firstBlock.rest,
    description: '',
    scenarios: [],
    tags: [],
  };

  let currentScenario: GherkinScenario | null = null;
  let inBackground = false;
  let background: GherkinBackground = { steps: [] };
  let hasAnyScenario = false;

  for (let i = 1; i < contentLines.length; i++) {
    const { text, lineNumber } = contentLines[i];

    // Tags
    if (text.startsWith('@')) {
      if (currentScenario) {
        currentScenario.tags.push(...text.split(' ').filter((t) => t.startsWith('@')));
      } else {
        feature.tags.push(...text.split(' ').filter((t) => t.startsWith('@')));
      }
      continue;
    }

    const block = detectBlockKeyword(text);
    if (block) {
      if (block.keyword === 'Background') {
        inBackground = true;
        currentScenario = null;
        continue;
      }

      if (block.keyword === 'Scenario' || block.keyword === 'Scenario Outline') {
        inBackground = false;
        if (currentScenario) feature.scenarios.push(currentScenario);
        currentScenario = {
          name: block.rest,
          steps: [],
          tags: [],
          lineNumber,
        };
        hasAnyScenario = true;
        continue;
      }

      if (block.keyword === 'Examples') {
        // Skip examples table for now
        continue;
      }

      // Feature description lines
      if (block.keyword === 'Feature') {
        continue;
      }
    }

    // Step keywords
    const stepKw = detectStepKeyword(text);
    if (stepKw) {
      const stepText = text.slice(stepKw.length + 1);
      const step: GherkinStep = {
        keyword: stepKw,
        text: stepText,
        action: detectStepAction(stepText),
        originalLine: text,
        lineNumber,
      };

      if (inBackground) {
        background.steps.push(step);
      } else if (currentScenario) {
        currentScenario.steps.push(step);
      }
      continue;
    }

    // Pipe-separated table rows (skip)
    if (text.startsWith('|')) continue;

    // Feature description (free-form text before first Background/Scenario)
    if (!hasAnyScenario && !inBackground) {
      feature.description += (feature.description ? '\n' : '') + text;
    }
  }

  // Push last scenario
  if (currentScenario) feature.scenarios.push(currentScenario);

  if (background.steps.length > 0) {
    feature.background = background;
  }

  if (!hasAnyScenario && feature.scenarios.length === 0) {
    return {
      success: false,
      error: 'Invalid Gherkin format. No Scenario found.',
    };
  }

  return { success: true, feature };
}
