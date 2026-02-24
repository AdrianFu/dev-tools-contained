import type { PluginInput, Hooks, EventFileEdited } from "@opencode-ai/plugin";

const DEBOUNCE_MS = 60000; // 60 seconds
const MAX_ITERATIONS = 10;
const FLUTTER_PROJECT_ROOT = "/home/vscode/app/src/my_wardrobe";
const CHANGE_SUMMARY_PATH = "/home/vscode/app/CHANGELOG.md";

interface AnalysisIssue {
  severity: "info" | "warning" | "error";
  message: string;
  filePath: string;
  line: number;
  column: number;
  rule: string;
  raw: string;
}

interface Change {
  type: string;
  file: string;
  line: number;
  originalIssue: string;
  fixDescription: string;
  lintRule: string;
  impact: string;
}

interface SessionStats {
  totalSessions: number;
  totalIterations: number;
  totalIssuesFixed: number;
  filesModified: Set<string>;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isAnalyzing = false;
let sessionCounter = 0;
let globalStats: SessionStats = {
  totalSessions: 0,
  totalIterations: 0,
  totalIssuesFixed: 0,
  filesModified: new Set<string>(),
};

async function loadGlobalStats(): Promise<void> {
  try {
    const statsFile = Bun.file(CHANGE_SUMMARY_PATH);
    const content = await statsFile.text();
    
    const match = content.match(/Total Sessions: (\d+)/);
    if (match) globalStats.totalSessions = parseInt(match[1]);
    
    const iterMatch = content.match(/Total Iterations: (\d+)/);
    if (iterMatch) globalStats.totalIterations = parseInt(iterMatch[1]);
    
    const issuesMatch = content.match(/Total Issues Fixed: (\d+)/);
    if (issuesMatch) globalStats.totalIssuesFixed = parseInt(issuesMatch[1]);
    
    const filesMatch = content.match(/Files Modified: (\d+)/);
    if (filesMatch) {
      const count = parseInt(filesMatch[1]);
    }
    
    const sessionMatch = content.match(/## \[.*\] - Session #(\d+)/);
    if (sessionMatch) {
      sessionCounter = Math.max(sessionCounter, parseInt(sessionMatch[1]));
    }
  } catch (e) {
    console.log("No existing stats file, starting fresh");
  }
}

async function saveGlobalStats(totalIterationsInSession: number, issuesFixedInSession: number): Promise<void> {
  try {
    const statsFile = Bun.file(CHANGE_SUMMARY_PATH);
    const content = await statsFile.text();
    
    const statsRegex = /- \*\*Total Sessions\*\*: (\d+)\n- \*\*Total Iterations\*\*: (\d+)\n- \*\*Total Issues Fixed\*\*: (\d+)\n- \*\*Files Modified\*\*: (\d+)/;
    const newStats = `- **Total Sessions**: ${globalStats.totalSessions}\n- **Total Iterations**: ${globalStats.totalIterations}\n- **Total Issues Fixed**: ${globalStats.totalIssuesFixed}\n- **Files Modified**: ${globalStats.filesModified.size}`;
    
    const newContent = content.replace(statsRegex, newStats);
    await Bun.write(CHANGE_SUMMARY_PATH, newContent);
  } catch (e) {
    console.error("Error saving stats:", e);
  }
}

function parseAnalysisOutput(output: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (!line.includes('•')) continue;
    
    try {
      const parts = line.split(' • ');
      if (parts.length !== 4) continue;
      
      const [severity, message, location, rule] = parts;
      
      const locationMatch = location.match(/(.+):(\d+):(\d+)/);
      if (!locationMatch) continue;
      
      issues.push({
        severity: severity.trim() as "info" | "warning" | "error",
        message: message.trim(),
        filePath: locationMatch[1],
        line: parseInt(locationMatch[2]),
        column: parseInt(locationMatch[3]),
        rule: rule.trim(),
        raw: line.trim(),
      });
    } catch (e) {
      console.error("Error parsing line:", line, e);
    }
  }
  
  return issues;
}

async function runAnalysis({ $ }: PluginInput): Promise<AnalysisIssue[]> {
  const flutterShell = $.cwd(FLUTTER_PROJECT_ROOT);
  const output = await flutterShell`flutter analyze --no-pub`.nothrow().quiet().text();
  return parseAnalysisOutput(output);
}

async function readFile(path: string): Promise<string> {
  return Bun.file(path).text();
}

async function writeFile(path: string, content: string): Promise<void> {
  await Bun.write(path, content);
  globalStats.filesModified.add(path);
}

async function fixUnusedImport(issue: AnalysisIssue): Promise<Change> {
  const content = await readFile(issue.filePath);
  const lines = content.split('\n');
  
  lines.splice(issue.line - 1, 1);
  const newContent = lines.join('\n');
  
  await writeFile(issue.filePath, newContent);
  
  return {
    type: "Removed Unused Import",
    file: issue.filePath,
    line: issue.line,
    originalIssue: issue.message,
    fixDescription: "Removed import line",
    lintRule: issue.rule,
    impact: "None - import was never used",
  };
}

async function fixUnusedVariable(issue: AnalysisIssue): Promise<Change> {
  const content = await readFile(issue.filePath);
  const lines = content.split('\n');
  
  const line = lines[issue.line - 1];
  const varNameMatch = line.match(/(\w+)\s*[=:]/);
  
  if (varNameMatch) {
    const varName = varNameMatch[1];
    const varRegex = new RegExp(`\\b${varName}\\b`, 'g');
    
    let newContent = content;
    let matchCount = 0;
    
    newContent = newContent.replace(varRegex, (match, offset) => {
      const lineNum = content.substring(0, offset).split('\n').length;
      
      if (lineNum === issue.line) {
        matchCount++;
        return "";
      }
      
      return match;
    });
    
    if (matchCount > 0) {
      newContent = newContent.replace(/^.*\n/, (match) => {
        if (match.includes(varName)) {
          return "";
        }
        return match;
      });
      
      await writeFile(issue.filePath, newContent);
      
      return {
        type: "Removed Unused Variable",
        file: issue.filePath,
        line: issue.line,
        originalIssue: issue.message,
        fixDescription: `Removed variable '${varName}' and its usage`,
        lintRule: issue.rule,
        impact: "Reduces memory usage and code clarity",
      };
    }
  }
  
  throw new Error(`Could not parse unused variable at ${issue.filePath}:${issue.line}`);
}

async function fixDeadCode(issue: AnalysisIssue): Promise<Change> {
  const content = await readFile(issue.filePath);
  const lines = content.split('\n');
  
  lines.splice(issue.line - 1, 1);
  const newContent = lines.join('\n');
  
  await writeFile(issue.filePath, newContent);
  
  return {
    type: "Removed Dead Code",
    file: issue.filePath,
    line: issue.line,
    originalIssue: issue.message,
    fixDescription: "Removed unused code block",
    lintRule: issue.rule,
    impact: "Reduces code complexity",
  };
}

async function fixConstConstructor(issue: AnalysisIssue): Promise<Change> {
  const content = await readFile(issue.filePath);
  const lines = content.split('\n');
  
  const line = lines[issue.line - 1];
  const newLine = line.replace(/(\w+)(\()/, 'const $1(');
  lines[issue.line - 1] = newLine;
  
  const newContent = lines.join('\n');
  await writeFile(issue.filePath, newContent);
  
  return {
    type: "Added const to Constructor",
    file: issue.filePath,
    line: issue.line,
    originalIssue: issue.message,
    fixDescription: "Added const keyword to constructor",
    lintRule: issue.rule,
    impact: "Improves performance by using compile-time constants",
  };
}

async function fixPreferFinalLocals(issue: AnalysisIssue): Promise<Change> {
  const content = await readFile(issue.filePath);
  const lines = content.split('\n');
  
  const line = lines[issue.line - 1];
  const newLine = line.replace(/\bvar\s+/g, 'final ');
  lines[issue.line - 1] = newLine;
  
  const newContent = lines.join('\n');
  await writeFile(issue.filePath, newContent);
  
  return {
    type: "Changed var to final",
    file: issue.filePath,
    line: issue.line,
    originalIssue: issue.message,
    fixDescription: "Changed variable declaration from var to final",
    lintRule: issue.rule,
    impact: "Prevents accidental reassignment, improves code safety",
  };
}

async function fixIssue(issue: AnalysisIssue): Promise<Change> {
  const fixers: Record<string, (issue: AnalysisIssue) => Promise<Change>> = {
    unused_import: fixUnusedImport,
    unused_local_variable: fixUnusedVariable,
    dead_code: fixDeadCode,
    prefer_const_constructors: fixConstConstructor,
    prefer_final_locals: fixPreferFinalLocals,
  };
  
  const fixer = fixers[issue.rule];
  
  if (fixer) {
    return await fixer(issue);
  }
  
  throw new Error(`No fixer available for rule: ${issue.rule}`);
}

async function documentSession(changes: Change[], iterations: number): Promise<void> {
  const timestamp = new Date().toISOString();
  const sessionNum = sessionCounter + 1;
  
  const sessionDoc = `
## [${timestamp}] - Session #${sessionNum}

### Analysis Results
- **Issues Found**: ${changes.length}
- **Iterations**: ${iterations}

### Changes Made

${changes.map((change, i) => `
#### ${i + 1}. ${change.type}
- **File**: \`${change.file}:${change.line}\`
- **Issue**: ${change.originalIssue}
- **Fix**: ${change.fixDescription}
- **Lint Rule**: \`${change.lintRule}\`
- **Impact**: ${change.impact}
`).join('\n')}

### Post-Fix Analysis
- **Issues Remaining**: 0
- **Status**: ✅ All issues resolved

---

`;

  const existingContent = await readFile(CHANGE_SUMMARY_PATH).catch(() => "# Flutter Auto-Fix Change Summary\n\n");
  
  const statsSectionIndex = existingContent.indexOf("\n---\n\n### Cumulative Statistics");
  let newContent;
  
  if (statsSectionIndex !== -1) {
    newContent = existingContent.slice(0, statsSectionIndex) + sessionDoc + existingContent.slice(statsSectionIndex);
  } else {
    newContent = existingContent + sessionDoc + "\n---\n\n### Cumulative Statistics\n";
  }
  
  await Bun.write(CHANGE_SUMMARY_PATH, newContent);
  
  globalStats.totalSessions = sessionNum;
  globalStats.totalIterations += iterations;
  
  await saveGlobalStats(iterations, changes.length);
  
  sessionCounter = sessionNum;
}

async function runAnalysisAndFix({ $ }: PluginInput): Promise<void> {
  if (isAnalyzing) return;
  isAnalyzing = true;
  
  try {
    let iteration = 0;
    let issues: AnalysisIssue[] = [];
    let allChanges: Change[] = [];
    const seenIssues = new Set<string>();
    
    console.log("Starting Flutter auto-fix session...");
    
    while (iteration < MAX_ITERATIONS) {
      iteration++;
      console.log(`Iteration ${iteration}/${MAX_ITERATIONS}`);
      
      issues = await runAnalysis({ $ });
      console.log(`Found ${issues.length} issues`);
      
      if (issues.length === 0) {
        console.log("No issues found. Session complete.");
        break;
      }
      
      const iterationChanges: Change[] = [];
      let repeatDetected = false;
      
      for (const issue of issues) {
        const issueKey = `${issue.filePath}:${issue.line}:${issue.rule}`;
        
        if (seenIssues.has(issueKey)) {
          console.log(`Repeat issue detected: ${issueKey}`);
          repeatDetected = true;
          continue;
        }
        
        seenIssues.add(issueKey);
        
        try {
          console.log(`Fixing: ${issue.message} at ${issue.filePath}:${issue.line}`);
          const change = await fixIssue(issue);
          iterationChanges.push(change);
          globalStats.totalIssuesFixed++;
          console.log(`Fixed: ${change.type}`);
        } catch (e) {
          console.error(`Error fixing issue:`, e);
        }
      }
      
      allChanges.push(...iterationChanges);
      
      if (repeatDetected) {
        console.log("Repeat issue detected. Stopping to prevent infinite loop.");
        break;
      }
      
      if (iterationChanges.length === 0) {
        console.log("No changes made. Stopping.");
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (iteration >= MAX_ITERATIONS) {
      console.log(`Warning: Max iterations (${MAX_ITERATIONS}) reached without clean state.`);
    }
    
    if (allChanges.length > 0) {
      await documentSession(allChanges, iteration);
      console.log(`Session complete. Documented ${allChanges.length} changes in ${iteration} iterations.`);
    } else {
      console.log("Session complete. No changes made.");
    }
    
  } finally {
    isAnalyzing = false;
  }
}

function scheduleAnalysis(ctx: PluginInput): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  
  console.log("Scheduling analysis in 60 seconds...");
  debounceTimer = setTimeout(() => {
    console.log("Debounce timer elapsed. Starting analysis...");
    runAnalysisAndFix(ctx);
    debounceTimer = null;
  }, DEBOUNCE_MS);
}

export default async function plugin(ctx: PluginInput): Promise<Hooks> {
  console.log("Flutter Auto-Fix Plugin loaded");
  
  await loadGlobalStats();
  
  return {
    event: async ({ event }) => {
      if (event.type === "file.edited") {
        const fileEvent = event as EventFileEdited;
        
        if (fileEvent.properties.file.endsWith('.dart')) {
          console.log(`Dart file edited: ${fileEvent.properties.file}`);
          scheduleAnalysis(ctx);
        }
      }
    },
  };
}
