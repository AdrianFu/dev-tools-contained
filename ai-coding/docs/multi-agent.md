# Multi-Agent Architecture Documentation

Complete guide for orchestrator-builder multi-agent system.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [Orchestrator Agent](#3-orchestrator-agent)
4. [Builder Agent](#4-builder-agent)
5. [Workflow Examples](#5-workflow-examples)
6. [State Management](#6-state-management)
7. [Skills Integration](#7-skills-integration)
8. [Communication Protocol](#8-communication-protocol)
9. [Implementation Details](#9-implementation-details)
10. [Usage Examples](#10-usage-examples)
11. [Edge Cases](#11-edge-cases)
12. [Troubleshooting](#12-troubleshooting)
13. [Best Practices](#13-best-practices)
14. [Migration Path](#14-migration-path)

---

## 1. Introduction

### 1.1 Purpose

The multi-agent architecture solves critical workflow problems:

**Problems Solved:**
- ❌ Workflow violations (skipping analyze-and-fix-cycle)
- ❌ Forgetting post-code-change steps
- ❌ Inconsistent communication patterns
- ❌ Questions receiving actions instead of explanations
- ❌ Manual agent switching and state management

**Solutions Provided:**
- ✅ Single entry point (orchestrator always active)
- ✅ Automatic workflow enforcement
- ✅ Dynamic agent routing
- ✅ State continuity management
- ✅ Integrated skill awareness

### 1.2 Architecture Goals

**Primary Goal:**
Ensure all user interactions follow proper workflow without manual intervention.

**Secondary Goals:**
- Reduce user cognitive load (no manual agent switching)
- Improve consistency (same behavior every time)
- Enable graceful error handling
- Provide clear visibility into agent state

### 1.3 Overview of Agent Relationships

```
┌─────────────────────────────────────────┐
│     orchestrator (Root Agent)          │
│  ┌───────────────────────────────────┐ │
│  │ Message Analysis                │ │
│  │                                 │ │
│  │ User message → Classify type:    │ │
│  │                                 │ │
│  │ ┌─────────────────────────────┐│ │
│  │ │ Question? → Explain only     ││ │
│  │ │                            ││ │
│  │ │ Request? → Clarify first   ││ │
│  │ │                            ││ │
│  │ │ Ready to implement? →       ││ │
│  │ │     Delegate to builder ────┼─┼─┐
│  │ └─────────────────────────────┘│ │ │
│  └───────────────────────────────────┘ │ │
│                                    │ │
│                                    │ │ Delegation
│                                    │ │
│                                    │ ▼
│                     ┌──────────────────────────┐
│                     │ builder (Sub-Agent)    │
│                     │  ┌──────────────────┐│
│                     │  │ 1. Receive task  ││
│                     │  │ 2. Implement     ││
│                     │  │ 3. Test/verify  ││
│                     │  │ 4. Return status ││
│                     │  └──────────────────┘│
│                     │  ┌──────────────────┐│
│                     │  │ Skills:          ││
│                     │  │ • analyze-and-   ││
│                     │  │   fix-cycle      ││
│                     │  │ • flutter-code-   ││
│                     │  │   scanner        ││
│                     │  └──────────────────┘│
│                     └──────────────────────────┘
│                                    │
│                                    │ Return
│                                    │
│                                    ▼
│  ┌───────────────────────────────────┐ │
│  │ Re-Entry from Builder           │ │
│  │                                 │ │
│  │ Acknowledge completion             │ │
│  │ Explain changes made               │ │
│  │ Ask if user has questions         │ │
│  │ Remain active for follow-up         │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 2. Architecture Overview

### 2.1 System Components

| Component | Type | Purpose | Always Active? |
|-----------|------|---------|---------------|
| **orchestrator** | Root Agent | Primary entry point, workflow enforcement | ✅ Yes |
| **builder** | Sub-Agent | Implementation execution | ⚠️ No (only when delegated) |
| **Skills** | Tools | Specialized tasks (analyze, scan) | ⚠️ On-demand |

### 2.2 Agent Lifecycle

```
Session Start
    ↓
[orchestrator activates]
    ↓
┌─────────────────────────────┐
│ Interaction Loop:           │
│                             │
│ User message               │
│   ↓                        │
│ orchestrator analyzes       │
│   ↓                        │
│ ┌─ Question? ──┐          │
│ │ Yes → Explain        │      │
│ └─────────────────────┘      │
│                             │
│ ┌─ Request? ──┐            │
│ │ Yes → Clarify        │      │
│ │   ↓                  │      │
│ │ Ready? ──┐           │      │
│ │ Yes → Delegate to   │      │
│ │        builder ───────┼──────┼──┐
│ └─────────────────────┘      │      │  │
│                             │      │  │
│ ┌─ Ambiguous? ──┐          │      │  │
│ │ Ask user           │          │      │  │
│ └─────────────────────┘      │      │  │
└─────────────────────────────┘      │  │
                                    │  │
                                    │  │ Builder Lifecycle
                                    │  │
                                    │  ├─ builder activates
                                    │  ├─ builder executes
                                    │  ├─ builder returns
                                    │  └─ builder deactivates
                                    │  │
                                    │  │ Return
                                    │  │
                                    ▼  │
                            orchestrator re-enters
                                    ↓
                        Ask: "Questions?"
                                    ↓
                      Wait for user response
```

### 2.3 Communication Flow

```
User ────┐
        │
        ↓
   orchestrator ──┐
        │          │
        │          ├──[Explain]────────→ User
        │          │
        │          └──[Delegation]────→ builder ────┐
        │                                 │          │
        │                                 │          ├─[Implement]
        │                                 │          ├─[Run Skills]
        │                                 │          └─[Return]
        │                                 │          │
        │                                 └──────────→ orchestrator
        │                                             │
        │                                             └──[Summary]──→ User
```

### 2.4 State Management

**Global Session State:**
```json
{
  "active_agent": "orchestrator",
  "delegated_agent": null,
  "conversation_history": [],
  "last_builder_task": null,
  "workflow_state": "idle"
}
```

**Builder Active State:**
```json
{
  "active_agent": "orchestrator",
  "delegated_agent": "builder",
  "builder_task": {
    "description": "...",
    "started_at": "...",
    "status": "in_progress"
  },
  "workflow_state": "delegated"
}
```

**Builder Complete State:**
```json
{
  "active_agent": "orchestrator",
  "delegated_agent": null,
  "last_builder_task": {
    "description": "...",
    "completed_at": "...",
    "status": "complete",
    "changes": [...],
    "issues": []
  },
  "workflow_state": "post_builder"
}
```

---

## 3. Orchestrator Agent

### 3.1 Purpose

The orchestrator is the **primary and always-active agent** that:

1. Receives all user messages
2. Enforces communication guidelines
3. Classifies message type (question vs request)
4. Manages agent routing and delegation
5. Ensures proper workflow before any actions
6. Maintains session state and continuity
7. Handles builder return and re-entry

### 3.2 Responsibilities

| # | Responsibility | Priority |
|---|---------------|----------|
| 1 | Message type classification | Critical |
| 2 | Communication guideline enforcement | Critical |
| 3 | Skill discovery and routing | High |
| 4 | Delegation decisions to builder | High |
| 5 | State continuity management | High |
| 6 | Builder return handling | Medium |
| 7 | Follow-up question management | Medium |

### 3.3 Core Workflow

**Step 1: Load Guidelines**
```markdown
- Read ~/.config/opencode/COMMUNICATION_GUIDELINES.md
- Load question/response patterns
- Identify: "Question" vs "Request" indicators
```

**Step 2: Classify Message**
```markdown
Question Indicators:
- "Why...?"
- "How...?"
- "What...?"
- "Should I...?"
- "Can you explain...?"

Request Indicators:
- "Fix..."
- "Add..."
- "Implement..."
- "Change..."
- "Remove..."
- "Update..."

Ambiguous:
- "Auth is broken"
- "It doesn't work"
- "Need to do X"
```

**Step 3: Apply Rules Based on Type**

**For Questions:**
```markdown
1. Provide thorough explanation
2. Consider multiple perspectives
3. Highlight trade-offs
4. NO actions: No Edit, Write, or code modification commands
5. NO delegation to builder
```

**For Requests:**
```markdown
1. Verify understanding of request
2. Ask clarifying questions if needed
3. Assess soundness of approach
4. Identify risks or alternatives
5. Get user confirmation before implementation
6. Only then delegate to builder
```

**For Ambiguous:**
```markdown
1. Ask for clarification
2. Request more context
3. Don't assume intent
4. Wait for user response
```

**Step 4: Delegation Decision (For Requests Only)**

**Delegate to builder when:**
- ✅ User confirms they want implementation
- ✅ All clarifications answered
- ✅ Approach is sound and well-informed
- ✅ Risks identified and accepted
- ✅ No better alternatives require discussion

**Do NOT delegate when:**
- ❌ User hasn't confirmed
- ❌ Ambiguity remains
- ❌ Better alternative exists
- ❌ Security concerns identified
- ❌ High risk without user awareness

**Step 5: Return Handling (After Builder)**

```markdown
When builder returns:
1. Acknowledge completion
2. Summarize changes made
3. Highlight any issues found
4. Ask: "Do you have any questions?"
5. Remain active for follow-up
```

### 3.4 Decision Tree

```
User Message Received
    ↓
┌─ Is it a Question? ─────────────────────┐
│  │                                   │
│  ├─ Yes → Explain thoroughly             │
│  │        [NO actions]                 │
│  │        [NO delegation]              │
│  │                                     │
│  └─ No → Next classification           │
│                                     │
├─ Is it a Request? ─────────────────────┤
│  │                                   │
│  ├─ Yes → Verify understanding          │
│  │        Ask clarifying questions      │
│  │        Assess approach              │
│  │        Identify risks               │
│  │           ↓                       │
│  │        User confirms? ──┐         │
│  │        ├─ Yes → Delegate builder │
│  │        └─ No  → Clarify more  │
│  │                                     │
│  └─ No → Next classification           │
│                                     │
└─ Is it Ambiguous? ─────────────────────┤
                                     │
                                     ├─ Ask for clarification
                                     ├─ Request more context
                                     └─ Don't assume intent
```

### 3.5 Skills Integration

**Skill Discovery Protocol:**
```markdown
On startup:
1. Scan ~/.opencode/skills/ directory
2. For each skill directory:
   - Read SKILL.md
   - Extract: name, description
   - Determine "when to use" conditions
3. Build skill registry in memory
4. Maintain awareness throughout session
```

**Skill Routing Logic:**

| Skill | When Orchestrator Uses | When Builder Uses |
|-------|------------------------|------------------|
| **analyze-and-fix-cycle** | After code changes (if no builder needed) | Always after implementation |
| **flutter-code-scanner** | When reviewing Flutter code | When implementing Flutter code |
| **skill-maintainer** | When creating/updating SKILL.md files | When managing skill structure |
| **[other skills]** | Based on conversation context | Based on task requirements |

**Skill Execution Before Delegation:**

In some cases, orchestrator may use skills before delegating:

```markdown
Example: "Review the Flutter code"
  ↓
orchestrator: [Classifies as request]
orchestrator: [Clarifies scope]
  ↓
orchestrator: [Runs flutter-code-scanner skill]
orchestrator: [Presents findings]
  ↓
User: "OK, fix the issues"
  ↓
orchestrator: [Delegates to builder]
```

### 3.6 Communication Protocol

**When Delegating to Builder:**

```json
{
  "type": "delegation",
  "from": "orchestrator",
  "to": "builder",
  "task": {
    "description": "Fix FedCM error",
    "requirements": [
      "Update index.html with GSI script",
      "Create html_web.dart and html_stub.dart",
      "Update main.dart imports"
    ],
    "context": "FedCM blocking Google Sign-In on Cloudflare Pages",
    "guidelines": "Explain before implementing",
    "conversation_history": [
      {"role": "user", "content": "Why didn't you use analyze-and-fix-cycle?"},
      {"role": "assistant", "content": "..."}
    ],
    "skills_to_run": ["analyze-and-fix-cycle"]
  }
}
```

**When Receiving from Builder:**

```json
{
  "type": "completion",
  "from": "builder",
  "to": "orchestrator",
  "status": "complete",
  "changes": [
    "Created: html_web.dart",
    "Created: html_stub.dart",
    "Modified: main.dart",
    "Modified: index.html"
  ],
  "issues": [
    {
      "type": "info",
      "message": "dart:html deprecated in html_web.dart",
      "file": "lib/html_web.dart",
      "line": 1
    }
  ],
  "summary": "Fixed FedCM by implementing Google Identity Services",
  "test_results": {
    "tests": "1/1 passed",
    "lint": "2 info issues"
  }
}
```

---

## 4. Builder Agent

### 4.1 Purpose

The builder is an **implementation sub-agent** that:

1. Receives task delegation from orchestrator
2. Executes code changes only
3. Runs appropriate skills automatically
4. Tests and verifies changes
5. Always returns to orchestrator
6. Never takes initiative or makes decisions

### 4.2 Responsibilities

| # | Responsibility | Priority |
|---|---------------|----------|
| 1 | Receive and understand task | Critical |
| 2 | Implement requested changes | Critical |
| 3 | Run analyze-and-fix-cycle skill | Critical |
| 4 | Run project-specific skills | High |
| 5 | Test and verify changes | High |
| 6 | Return summary and status | Critical |
| 7 | Report errors immediately | Critical |

### 4.3 When Invoked

**Delegation Conditions:**
- ✅ Only by orchestrator
- ✅ After orchestrator confirms requirements
- ✅ With clear task description
- ✅ With conversation context
- ✅ With skill execution requirements

**Never Invoked When:**
- ❌ User directly requests (must go through orchestrator)
- ❌ Ambiguous requirements exist
- ❌ No task delegation received
- ❌ Orchestrator hasn't confirmed

### 4.4 Core Workflow

**Step 1: Receive Delegation**
```markdown
- Parse delegation message from orchestrator
- Extract: task description, requirements, context
- Load conversation history
- Understand guidelines to follow
- Identify skills to run
```

**Step 2: Implement Changes**
```markdown
- Use appropriate tools (Edit, Write, Bash)
- Follow task requirements exactly
- Make changes in logical order
- Provide progress updates if needed
- Don't deviate from requirements
```

**Step 3: Run Skills**
```markdown
Mandatory skill:
- analyze-and-fix-cycle (always run)

Project-specific skills:
- flutter-code-scanner (if Flutter code)
- [other skills] (based on context)

Skill execution order:
1. Implement all changes
2. Run analyze-and-fix-cycle
3. Address any issues found
4. Re-run tests
5. Confirm clean status
```

**Step 4: Test and Verify**
```markdown
- Build the project (if applicable)
- Run tests
- Verify no blocking errors
- Document any non-blocking warnings
```

**Step 5: Return to Orchestrator**
```markdown
Create return message:
{
  "status": "complete" | "error",
  "changes": [...],
  "issues": [...],
  "summary": "...",
  "test_results": {...},
  "recommendations": [...]
}
```

### 4.5 Return Protocol

**Success Return:**
```json
{
  "type": "completion",
  "from": "builder",
  "to": "orchestrator",
  "status": "complete",
  "changes": [
    {"file": "lib/main.dart", "action": "modified"},
    {"file": "web/index.html", "action": "modified"},
    {"file": "lib/html_web.dart", "action": "created"}
  ],
  "issues": [],
  "summary": "Successfully implemented Google Identity Services for FedCM",
  "test_results": {
    "tests": "1/1 passed",
    "lint": "0 errors, 2 warnings (info-level)",
    "build": "success"
  }
}
```

**Error Return:**
```json
{
  "type": "completion",
  "from": "builder",
  "to": "orchestrator",
  "status": "error",
  "error_type": "lint_failure",
  "changes": [
    {"file": "lib/main.dart", "action": "modified"}
  ],
  "issues": [
    {
      "severity": "error",
      "file": "lib/main.dart",
      "line": 42,
      "message": "Undefined function 'foo'",
      "suggested_fix": "Import 'package:foo/foo.dart' or define function"
    }
  ],
  "summary": "Lint errors require manual intervention",
  "test_results": {
    "tests": "not run (blocking errors)",
    "lint": "1 error"
  },
  "recommendations": [
    "Add missing import",
    "Or define required function"
  ]
}
```

### 4.6 Error Handling

**Types of Errors:**

| Error Type | Builder Action |
|-----------|---------------|
| **Build failure** | Return to orchestrator with details |
| **Test failure** | Fix if possible, else return with recommendations |
| **Lint error** | Fix automatically, re-run |
| **Lint warning** | Document in return message, continue |
| **Tool failure** | Return immediately with error details |
| **Ambiguous task** | Return to orchestrator for clarification |

**Error Recovery:**

```
Build failure detected
    ↓
Builder: [Analyze error]
    ↓
┌─ Can fix automatically? ──┐
│  │                       │
│  ├─ Yes → Fix           │
│  │        ↓              │
│  │        Rebuild        │
│  │                     │
│  └─ No  → Return error │
│         to orchestrator │
└──────────────────────────┘
```

### 4.7 Skill Execution Protocol

**analyze-and-fix-cycle (Mandatory):**
```markdown
Always run after implementing changes:
1. Run flutter analyze
2. Run flutter test
3. Parse outputs
4. Fix issues iteratively (max 10 iterations)
5. Confirm clean status
6. Return with summary
```

**flutter-code-scanner (Conditional):**
```markdown
Run when Flutter code is changed:
1. Scan Flutter-specific issues
2. Check Material design violations
3. Verify widget best practices
4. Report findings
```

**Other Skills:**
```markdown
Run based on task requirements:
- skill-maintainer (if creating SKILL.md)
- [project-specific skills]
```

**Skill Return Format:**
```json
{
  "skill": "analyze-and-fix-cycle",
  "status": "complete",
  "iterations": 3,
  "issues_found": 5,
  "issues_fixed": 5,
  "remaining_issues": [],
  "test_status": "1/1 passed",
  "lint_status": "2 info warnings"
}
```

---

## 5. Workflow Examples

### 5.1 Example 1: Question (No Delegation)

**Scenario:**
```
User: "Why didn't you use analyze-and-fix-cycle after changing files?"
```

**Workflow:**
```
User message received
    ↓
orchestrator: [Load guidelines]
orchestrator: [Classify as "question"]
  ↓
orchestrator: "You're right to ask - I should have used it.

Let me explain what happened:

**The Issue:**
- I made file changes to fix FedCM
- I ran flutter build web to verify
- But I skipped analyze-and-fix-cycle skill
- This violates the workflow which requires it after ANY code changes

**Why I Forgot:**
- I focused on solving the immediate problem (FedCM)
- I didn't have automatic triggers to remind me
- I proceeded without running analyzers/tests

**The Correct Workflow Should Be:**
[Code changes] → [Run analyze-and-fix-cycle] → [Fix issues] → [Clean codebase]

This is a clear workflow violation. The guidelines say for questions I should provide 'comprehensive explanation' and 'NEVER jump into implementation' - which I failed to do by immediately running the skill and making changes."
  ↓
[NO delegation - explanation only]
```

**Key Points:**
- ✅ Question classified correctly
- ✅ Comprehensive explanation provided
- ✅ No actions taken
- ✅ No delegation to builder

---

### 5.2 Example 2: Request → Clarification → Builder

**Scenario:**
```
User: "Fix the FedCM error"
```

**Workflow:**
```
User message received
    ↓
orchestrator: [Load guidelines]
orchestrator: [Classify as "request"]
  ↓
orchestrator: "I can help fix the FedCM error. Before I start, I'd like to clarify:

**Questions:**
1. Are you referring to the Google Sign-In FedCM error on Cloudflare Pages?
2. Should I implement the Google Identity Services fix (using renderButton)?
3. Are there any other OAuth-related changes needed?

**Approach I'll Take:**
1. Update web/index.html to include Google Identity Services script
2. Create conditional HTML imports (html_web.dart for web, html_stub.dart for other platforms)
3. Update main.dart to use the new HTML imports
4. Run analyze-and-fix-cycle to ensure clean code

**Risks to Consider:**
- This changes the sign-in flow significantly
- Requires testing on both web and mobile platforms
- May have browser compatibility issues

Should I proceed with this approach?"
  ↓
User: "Yes, go ahead"
  ↓
orchestrator: [Load skill registry]
orchestrator: [Identify relevant skills]
orchestrator: [Run analyze-and-fix-cycle]
  ↓
[analyze-and-fix-cycle completes]
  ↓
orchestrator: [Delegate to builder]
```

**Builder Delegation:**
```json
{
  "type": "delegation",
  "from": "orchestrator",
  "to": "builder",
  "task": {
    "description": "Fix FedCM error by implementing Google Identity Services",
    "requirements": [
      "Add GSI script to web/index.html",
      "Create html_web.dart and html_stub.dart",
      "Update main.dart imports"
    ],
    "context": "FedCM blocking Google Sign-In, deprecated signIn() method",
    "guidelines": "Explain before implementing",
    "skills_to_run": ["analyze-and-fix-cycle", "flutter-code-scanner"]
  }
}
```

**Builder Execution:**
```
builder: [Receive delegation]
builder: [Implement changes]
  - Edit: web/index.html (add GSI script)
  - Write: lib/html_web.dart
  - Write: lib/html_stub.dart
  - Edit: lib/main.dart (update imports)
  ↓
builder: [Run analyze-and-fix-cycle]
  - flutter analyze: 2 info warnings
  - flutter test: 1/1 passed
  ↓
builder: [Run flutter-code-scanner]
  - No Flutter-specific issues
  ↓
builder: [Build verification]
  - flutter build web: success
  ↓
builder: [Return to orchestrator]
```

**Builder Return:**
```json
{
  "type": "completion",
  "from": "builder",
  "to": "orchestrator",
  "status": "complete",
  "changes": [
    {"file": "web/index.html", "action": "modified"},
    {"file": "lib/html_web.dart", "action": "created"},
    {"file": "lib/html_stub.dart", "action": "created"},
    {"file": "lib/main.dart", "action": "modified"}
  ],
  "issues": [
    {
      "type": "info",
      "message": "dart:html deprecated in html_web.dart",
      "file": "lib/html_web.dart",
      "line": 1
    }
  ],
  "summary": "Successfully implemented Google Identity Services for FedCM compatibility",
  "test_results": {
    "tests": "1/1 passed",
    "lint": "2 info warnings (acceptable)",
    "build": "success"
  }
}
```

**Orchestrator Re-entry:**
```
orchestrator: [Receive builder return]
orchestrator: "✅ Builder completed the FedCM fix!

**Changes Made:**
- Updated web/index.html with Google Identity Services script
- Created html_web.dart for web platform
- Created html_stub.dart for non-web platforms
- Updated main.dart to use conditional HTML imports

**Test Results:**
- Tests: 1/1 passed ✅
- Lint: 2 info warnings (acceptable - dart:html deprecation)
- Build: Success ✅

**What This Fixes:**
- FedCM NetworkError on Cloudflare Pages
- Deprecated signIn() method warning
- Popup closure issues with Google Sign-In

**Next Steps:**
Push these changes to GitHub to trigger Cloudflare Pages deployment.

Do you have any questions about these changes or should we proceed with the deployment?"
```

---

### 5.3 Example 3: Follow-up Question After Builder

**Scenario:**
```
[Builder just completed FedCM fix]

User: "What did you change in main.dart?"
```

**Workflow:**
```
User message received
    ↓
orchestrator: [Load guidelines]
orchestrator: [Classify as "question"]
  ↓
orchestrator: "Good question. Here's what changed in main.dart:

**Before:**
```dart
import 'dart:html' as html;

// Code used html.ScriptElement, html.document directly
```

**After:**
```dart
import 'html_import.dart';

// Code now uses: initializeGoogleSignIn(), setupMessageListener(), showGoogleSignInButton()
```

**Key Changes:**
1. **Removed direct dart:html import** - This was causing test failures on non-web platforms
2. **Added conditional imports** - html_import.dart automatically selects html_web.dart for web, html_stub.dart for others
3. **Extracted HTML functions** - Created wrapper functions to abstract platform-specific code
4. **Updated Google Sign-In initialization** - Now uses the new wrapper functions

**Why This Matters:**
- Tests now run on all platforms (not just web)
- HTML-specific code is isolated to web-only file (html_web.dart)
- The stub file (html_stub.dart) provides empty implementations for other platforms
- The conditional import pattern is a Flutter best practice

This change was necessary to fix the test failures that occurred when dart:html was imported directly."
```

**Key Points:**
- ✅ Question about builder's work
- ✅ Orchestrator handled (not builder)
- ✅ Comprehensive explanation
- ✅ No delegation needed

---

### 5.4 Example 4: Ambiguous Message

**Scenario:**
```
User: "Auth is broken"
```

**Workflow:**
```
User message received
    ↓
orchestrator: [Load guidelines]
orchestrator: [Classify as "ambiguous"]
  ↓
orchestrator: "I'd like to help fix the auth issue, but I need more information:

**Clarification Needed:**
1. What specific error are you seeing?
   - Browser console error message?
   - Supabase error?
   - Network error?
2. When did this happen?
   - Recently after a change?
   - Always been broken?
3. What platform?
   - Web (Cloudflare Pages)?
   - Local development?
   - Android mobile?
4. What auth method?
   - Google Sign-In?
   - Email/password?
   - Other?

**Once I know more, I can:**
- Diagnose the root cause
- Propose a solution
- Implement the fix if you confirm

Please share any error messages or details you have."
```

**Key Points:**
- ✅ Ambiguous message identified
- ✅ Clarification requested
- ✅ No assumptions made
- ✅ Waiting for user response

---

### 5.5 Example 5: Multiple Related Tasks

**Scenario:**
```
User: "Fix the lint errors and add dark mode"
```

**Workflow:**
```
User message received
    ↓
orchestrator: [Load guidelines]
orchestrator: [Classify as "request"]
  ↓
orchestrator: "I can help with both. Let me clarify:

**Task 1: Fix Lint Errors**
- How many lint errors?
- Any specific files to focus on?
- Should I run analyze-and-fix-cycle to handle them?

**Task 2: Add Dark Mode**
- System-controlled or user toggle?
- Persist preference?
- Which screens should support it initially?

**Execution Order:**
I recommend:
1. Fix lint errors first (clean slate)
2. Then add dark mode (avoid mixing issues)

Should I proceed with this order?"
  ↓
User: "Yes"
  ↓
orchestrator: [Delegate Task 1 to builder]
```

**Builder - Task 1 (Lint Errors):**
```
builder: [Receive delegation]
builder: [Run analyze-and-fix-cycle]
  - flutter analyze: 5 errors found
  - Fix all 5 errors
  - flutter test: all passed
  ↓
builder: [Return to orchestrator]
```

**Orchestrator Re-entry:**
```
orchestrator: "✅ Fixed lint errors!

**Errors Fixed:**
- [List of 5 errors]

All tests pass. Ready for dark mode implementation.

Should I proceed with Task 2 (add dark mode)?"
  ↓
User: "Yes"
  ↓
orchestrator: [Delegate Task 2 to builder]
```

**Builder - Task 2 (Dark Mode):**
```
builder: [Receive delegation]
builder: [Implement dark mode]
builder: [Run analyze-and-fix-cycle]
builder: [Return to orchestrator]
```

**Orchestrator Re-entry:**
```
orchestrator: "✅ All tasks complete!

**Task 1 (Lint Errors):** ✅ Complete
**Task 2 (Dark Mode):** ✅ Complete

**Summary:**
All lint errors fixed and dark mode implemented. Tests pass.

Questions?"
```

---

## 6. State Management

### 6.1 Session State Structure

**Initial State:**
```json
{
  "active_agent": "orchestrator",
  "delegated_agent": null,
  "conversation_history": [],
  "last_builder_task": null,
  "workflow_state": "idle",
  "skill_registry": {
    "analyze-and-fix-cycle": {
      "name": "analyze-and-fix-cycle",
      "description": "Auto-detect project, run analyzers, fix issues",
      "last_used": null
    },
    "flutter-code-scanner": {
      "name": "flutter-code-scanner",
      "description": "Scan Flutter codebase for issues",
      "last_used": null
    }
  }
}
```

**After User Message (Question):**
```json
{
  "active_agent": "orchestrator",
  "delegated_agent": null,
  "conversation_history": [
    {"role": "user", "content": "Why didn't you use...?"},
    {"role": "assistant", "content": "You're right to ask..."}
  ],
  "last_builder_task": null,
  "workflow_state": "idle",
  "skill_registry": {...}
}
```

**After Delegation to Builder:**
```json
{
  "active_agent": "orchestrator",
  "delegated_agent": "builder",
  "conversation_history": [...],
  "last_builder_task": {
    "description": "Fix FedCM error",
    "delegated_at": "2026-02-27T10:30:00Z",
    "status": "in_progress"
  },
  "workflow_state": "delegated",
  "skill_registry": {...}
}
```

**Builder Returns:**
```json
{
  "active_agent": "orchestrator",
  "delegated_agent": null,
  "conversation_history": [...],
  "last_builder_task": {
    "description": "Fix FedCM error",
    "delegated_at": "2026-02-27T10:30:00Z",
    "completed_at": "2026-02-27T10:35:00Z",
    "status": "complete",
    "changes": [...],
    "issues": []
  },
  "workflow_state": "post_builder",
  "skill_registry": {
    "analyze-and-fix-cycle": {
      "name": "analyze-and-fix-cycle",
      "description": "...",
      "last_used": "2026-02-27T10:34:00Z"
    },
    ...
  }
}
```

### 6.2 State Transitions

```
┌─────────────────────────────────────────┐
│ State: idle                             │
│ orchestrator active, no builder            │
└─────────────────────────────────────────┘
    ↓ [User sends request and confirms]
┌─────────────────────────────────────────┐
│ State: delegated                         │
│ orchestrator active, builder executing      │
└─────────────────────────────────────────┘
    ↓ [Builder completes]
┌─────────────────────────────────────────┐
│ State: post_builder                      │
│ orchestrator active, builder complete     │
└─────────────────────────────────────────┘
    ↓ [User responds: "Questions?" → "No"]
┌─────────────────────────────────────────┐
│ State: idle                             │
│ Ready for next interaction               │
└─────────────────────────────────────────┘
```

### 6.3 Conversation History

**Format:**
```json
[
  {
    "role": "user",
    "content": "Why didn't you use analyze-and-fix-cycle?",
    "timestamp": "2026-02-27T10:25:00Z",
    "agent_active": "orchestrator"
  },
  {
    "role": "assistant",
    "content": "You're right to ask...",
    "timestamp": "2026-02-27T10:25:30Z",
    "agent_active": "orchestrator",
    "action_taken": "explanation"
  },
  {
    "role": "user",
    "content": "Fix the FedCM error",
    "timestamp": "2026-02-27T10:28:00Z",
    "agent_active": "orchestrator"
  },
  {
    "role": "assistant",
    "content": "I can help fix the FedCM...",
    "timestamp": "2026-02-27T10:28:30Z",
    "agent_active": "orchestrator",
    "action_taken": "clarification"
  },
  {
    "role": "user",
    "content": "Yes, go ahead",
    "timestamp": "2026-02-27T10:30:00Z",
    "agent_active": "orchestrator"
  },
  {
    "role": "delegation",
    "to": "builder",
    "task": "...",
    "timestamp": "2026-02-27T10:30:30Z"
  },
  {
    "role": "builder",
    "content": "Implementation complete",
    "timestamp": "2026-02-27T10:35:00Z",
    "status": "complete"
  },
  {
    "role": "assistant",
    "content": "✅ Builder completed...",
    "timestamp": "2026-02-27T10:35:30Z",
    "agent_active": "orchestrator",
    "action_taken": "summary"
  }
]
```

### 6.4 Skill Registry

**Structure:**
```json
{
  "skills": {
    "analyze-and-fix-cycle": {
      "name": "analyze-and-fix-cycle",
      "description": "Auto-detect project type, run analyzers, fix issues",
      "file": "~/.opencode/skills/analyze-and-fix-cycle/SKILL.md",
      "when_to_use": [
        "After any code changes",
        "Before marking task complete",
        "When quality issues suspected"
      ],
      "last_used": "2026-02-27T10:34:00Z",
      "execution_count": 3
    },
    "flutter-code-scanner": {
      "name": "flutter-code-scanner",
      "description": "Perform comprehensive scan of Flutter codebase",
      "file": "~/.opencode/skills/flutter-code-scanner/SKILL.md",
      "when_to_use": [
        "When reviewing Flutter code",
        "Before Flutter deployments",
        "After Flutter changes"
      ],
      "last_used": null,
      "execution_count": 0
    }
  },
  "last_updated": "2026-02-27T10:00:00Z"
}
```

**Skill Discovery Workflow:**
```
Orchestrator Startup
    ↓
Scan ~/.opencode/skills/ directory
    ↓
For each skill directory:
    ├─ Read SKILL.md
    ├─ Extract: name, description
    ├─ Parse when-to-use section
    └─ Add to skill registry
    ↓
Save skill registry to session state
    ↓
Use throughout conversation
```

---

## 7. Skills Integration

### 7.1 Orchestrator's Role with Skills

**Skill Discovery:**
```markdown
On orchestrator activation:
1. Scan ~/.opencode/skills/
2. Read each SKILL.md
3. Extract name, description, when-to-use
4. Build in-memory registry
5. Maintain awareness throughout session
```

**Skill Routing Decision Tree:**
```
User message
    ↓
orchestrator: [Classify type]
    ↓
┌─ Question? ──┐
│  │           │
│  └─ Yes → Explain only, NO skills
│
├─ Request? ──┐
│  │           │
│  ├─ Yes → Check context
│  │       ↓   │
│  ┌─ Code review needed? ──┐
│  │  │                   │
│  │  ├─ Yes → Run flutter-code-scanner
│  │  │  │          [Before delegation]
│  │  └─ No  → Next
│  │              │
│  └─ Ready to delegate? ──┐
│                    │
│     ├─ Yes → [Delegate to builder]
│     │          [Builder will run skills]
│     └─ No  → Continue clarification
```

**Pre-Delegation Skill Usage:**

In some cases, orchestrator uses skills BEFORE delegating:

```markdown
Scenario: "Review the Flutter code"
  ↓
orchestrator: [Classify as request]
orchestrator: [Clarify scope]
  ↓
orchestrator: [Run flutter-code-scanner]
  ↓
orchestrator: [Present findings]
  ↓
User: "OK, fix the issues"
  ↓
orchestrator: [Delegate to builder]
```

### 7.2 Builder's Role with Skills

**Mandatory Skills:**
```markdown
Always run after implementing changes:
1. analyze-and-fix-cycle (MUST)
   - Run project analyzers
   - Run project tests
   - Fix issues iteratively
   - Confirm clean status
```

**Contextual Skills:**
```markdown
Run based on task type:
- flutter-code-scanner (Flutter code changes)
- [project-specific skills]
- [language-specific skills]
```

**Skill Execution Order:**
```
Builder receives task
    ↓
Implement changes
    ↓
Run mandatory skills
    ├─ analyze-and-fix-cycle
    │   ├─ Run analyzers
    │   ├─ Run tests
    │   └─ Fix issues
    ↓
Run contextual skills
    ├─ flutter-code-scanner (if Flutter)
    └─ [other skills as needed]
    ↓
Test and verify
    ↓
Return to orchestrator
```

### 7.3 Skill Communication Protocol

**When Orchestrator Runs Skill:**
```json
{
  "from": "orchestrator",
  "to": "analyze-and-fix-cycle",
  "task": "Scan codebase for issues",
  "context": "Before delegating implementation task"
}
```

**Skill Return:**
```json
{
  "from": "analyze-and-fix-cycle",
  "to": "orchestrator",
  "status": "complete",
  "findings": {
    "errors": 0,
    "warnings": 2,
    "tests": "1/1 passed"
  },
  "recommendations": [
    "Address info-level warnings if desired"
  ]
}
```

**When Builder Runs Skill:**
```json
{
  "from": "builder",
  "to": "analyze-and-fix-cycle",
  "task": "Fix issues after implementation",
  "context": "Post-implementation validation"
}
```

### 7.4 Skill Integration Examples

**Example 1: Orchestrator Pre-Delegation**
```
User: "Review the Flutter code quality"
  ↓
orchestrator: [Classify as request]
orchestrator: [Run flutter-code-scanner]
  ↓
flutter-code-scanner: [Scans codebase]
flutter-code-scanner: [Returns findings]
  ↓
orchestrator: "Code review complete:

**Findings:**
- 2 potential issues found
- All widgets follow best practices
- Material design compliance good

**Issues:**
1. Line 42: Unused import 'dart:math'
2. Line 156: Function too long (consider breaking down)

Should I fix these before proceeding?"
  ↓
User: "Yes, fix them"
  ↓
orchestrator: [Delegate to builder]
```

**Example 2: Builder Post-Implementation**
```
builder: [Receive task: "Add dark mode"]
builder: [Implement dark mode]
  ↓
builder: [Run analyze-and-fix-cycle]
  ├─ flutter analyze: 3 errors
  │   ├─ Fix error 1: Missing import
  │   ├─ Fix error 2: Undefined variable
  │   └─ Fix error 3: Type mismatch
  ├─ Re-run flutter analyze: 0 errors
  ├─ flutter test: 2/2 passed
  ↓
builder: [Return to orchestrator]
```

**Example 3: Both Agents Using Same Skill**
```
User: "Review and fix Flutter code"
  ↓
orchestrator: [Classify as request]
orchestrator: [Run flutter-code-scanner]
  ↓
orchestrator: "Issues found:
1. Missing null safety
2. Unused variable
3. Deprecated method

Should I fix these?"
  ↓
User: "Yes"
  ↓
orchestrator: [Delegate to builder]
  ↓
builder: [Fix issues]
builder: [Run analyze-and-fix-cycle]
  ↓
builder: [Return to orchestrator]
orchestrator: "✅ All issues fixed and verified"
```

---

## 8. Communication Protocol

### 8.1 Inter-Agent Message Format

**Delegation Message (Orchestrator → Builder):**
```json
{
  "type": "delegation",
  "from": "orchestrator",
  "to": "builder",
  "timestamp": "2026-02-27T10:30:00Z",
  "task": {
    "id": "task-001",
    "description": "Fix FedCM error by implementing Google Identity Services",
    "requirements": [
      {
        "type": "file_creation",
        "path": "lib/html_web.dart",
        "content": "Google Identity Services integration"
      },
      {
        "type": "file_creation",
        "path": "lib/html_stub.dart",
        "content": "Stub implementation for non-web"
      },
      {
        "type": "file_modification",
        "path": "lib/main.dart",
        "changes": "Update HTML imports"
      }
    ],
    "context": "FedCM blocking Google Sign-In on Cloudflare Pages",
    "guidelines": "Explain before implementing",
    "priority": "high",
    "deadline": null
  },
  "conversation_history": [
    {"role": "user", "content": "Fix FedCM"},
    {"role": "assistant", "content": "I'll implement GSI..."},
    {"role": "user", "content": "Go ahead"}
  ],
  "skills_to_run": [
    {
      "name": "analyze-and-fix-cycle",
      "mandatory": true,
      "parameters": {}
    },
    {
      "name": "flutter-code-scanner",
      "mandatory": false,
      "parameters": {}
    }
  ],
  "expected_outcomes": {
    "fixes_fedcm": true,
    "tests_pass": true,
    "lint_clean": true
  }
}
```

**Completion Message (Builder → Orchestrator):**
```json
{
  "type": "completion",
  "from": "builder",
  "to": "orchestrator",
  "timestamp": "2026-02-27T10:35:00Z",
  "task_id": "task-001",
  "status": "complete",
  "duration_seconds": 300,
  "changes": [
    {
      "file": "web/index.html",
      "action": "modified",
      "lines_added": 15,
      "lines_removed": 3,
      "changes": "Added GSI script and initialization functions"
    },
    {
      "file": "lib/html_web.dart",
      "action": "created",
      "lines_total": 25,
      "purpose": "Google Identity Services integration"
    },
    {
      "file": "lib/html_stub.dart",
      "action": "created",
      "lines_total": 8,
      "purpose": "Stub for non-web platforms"
    },
    {
      "file": "lib/main.dart",
      "action": "modified",
      "lines_changed": 42,
      "changes": "Updated HTML imports and Google Sign-In logic"
    }
  ],
  "issues": [
    {
      "severity": "info",
      "message": "dart:html deprecated in html_web.dart",
      "file": "lib/html_web.dart",
      "line": 1,
      "code": "deprecated_member_use"
    }
  ],
  "test_results": {
    "tests": {
      "total": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    },
    "lint": {
      "errors": 0,
      "warnings": 0,
      "info": 2
    },
    "build": {
      "platform": "web",
      "status": "success",
      "duration_seconds": 156
    }
  },
  "summary": "Successfully implemented Google Identity Services for FedCM compatibility. All tests pass, build succeeds.",
  "recommendations": [
    "Info-level warnings acceptable (dart:html deprecation in web-only file)",
    "Test on Cloudflare Pages to verify fix"
  ],
  "next_steps": ["Push to GitHub", "Deploy to Cloudflare Pages"]
}
```

**Error Message (Builder → Orchestrator):**
```json
{
  "type": "completion",
  "from": "builder",
  "to": "orchestrator",
  "timestamp": "2026-02-27T10:35:00Z",
  "task_id": "task-001",
  "status": "error",
  "duration_seconds": 45,
  "changes": [
    {
      "file": "lib/main.dart",
      "action": "modified",
      "status": "incomplete"
    }
  ],
  "error": {
    "type": "lint_failure",
    "message": "Unable to fix lint errors automatically",
    "details": [
      {
        "file": "lib/main.dart",
        "line": 42,
        "code": "undefined_function",
        "message": "The function 'foo' isn't defined",
        "suggested_fix": "Import 'package:foo/foo.dart' or define 'foo'"
      }
    ]
  },
  "summary": "Lint errors require manual intervention. Code changes incomplete.",
  "recommendations": [
    "Add missing import: import 'package:foo/foo.dart'",
    "Or define required function locally"
  ],
  "can_continue": false
}
```

### 8.2 Status Updates

**Progress Update (Builder → Orchestrator):**
```json
{
  "type": "progress",
  "from": "builder",
  "to": "orchestrator",
  "task_id": "task-001",
  "stage": "implementing",
  "percent_complete": 50,
  "current_action": "Creating html_web.dart",
  "estimated_remaining_seconds": 150
}
```

**User-Facing Status (Orchestrator → User):**
```
Builder is implementing changes...

Progress: 50%
Currently: Creating html_web.dart
Estimated time remaining: 2.5 minutes
```

### 8.3 Error Reporting Protocol

**Builder Detects Error:**
```
Error: Undefined function 'foo'
    ↓
Builder: [Attempt auto-fix]
  ├─ Search for import
  ├─ Check if function defined elsewhere
  └─ Cannot determine fix
    ↓
Builder: [Return error to orchestrator]
```

**Orchestrator Handles Error:**
```
Orchestrator: [Receive error]
  ↓
Orchestrator: "Builder encountered an error:

**Error Type:** Lint failure
**Error Details:**
- File: lib/main.dart
- Line: 42
- Issue: Function 'foo' isn't defined

**Builder's Suggestions:**
1. Add import: import 'package:foo/foo.dart'
2. Or define function locally

Would you like me to:
A) Add the import
B) Define the function locally
C) Try a different approach?"
  ↓
User: "Add the import"
  ↓
Orchestrator: [Delegate to builder with fix instruction]
```

### 8.4 Interrupt Protocol

**User Interrupts Builder:**
```
[Builder working on task]
  ↓
User: "Wait, actually do Y instead"
  ↓
orchestrator: [Interrupt builder]
orchestrator: "Stopping current task.

Switching to new task: Y

Should I start with Y now?"
  ↓
User: "Yes"
  ↓
orchestrator: [Delegate Y to builder]
```

**Builder Interruption Handling:**
```json
{
  "type": "interrupt",
  "from": "orchestrator",
  "to": "builder",
  "timestamp": "2026-02-27T10:37:00Z",
  "reason": "User changed requirements",
  "new_task": {
    "description": "Y",
    "priority": "high"
  }
}
```

**Builder Response:**
```json
{
  "type": "acknowledgment",
  "from": "builder",
  "to": "orchestrator",
  "status": "interrupted",
  "task_cancelled": "task-001",
  "progress_saved": false,
  "ready_for_new_task": true
}
```

---

## 9. Implementation Details

### 9.1 File Structure

```
.opencode/
├── multi-agent/
│   ├── multi-agent.md              ← This file (full guide)
│   ├── multi-agent-quick.md         ← Quick reference
│   ├── architecture.md              ← Architecture overview
│   └── testing.md                  ← Testing protocol
├── agents/
│   ├── orchestrator.md              ← Root agent specification
│   └── builder.md                   ← Sub-agent specification
└── skills/
    ├── analyze-and-fix-cycle/
    │   └── SKILL.md
    ├── flutter-code-scanner/
    │   └── SKILL.md
    └── [other skills]/
        └── SKILL.md
```

### 9.2 Orchestrator Agent Specification

**File:** `.opencode/agents/orchestrator.md`

**Structure:**
```markdown
---
name: orchestrator
description: Root agent managing all interactions, enforces communication guidelines, delegates to builder for implementations.
---

# Orchestrator Agent

## Purpose
[As documented in section 3]

## Responsibilities
[As documented in section 3.2]

## Core Workflow
[As documented in section 3.3]

## Decision Tree
[As documented in section 3.4]

## Skills Integration
[As documented in section 3.5]

## Communication Protocol
[As documented in section 8]

## State Management
[As documented in section 6]

## Error Handling
- Handle builder errors gracefully
- Ask user for clarification when needed
- Never proceed without confirmation

## Best Practices
- Always classify message type first
- Check guidelines before delegating
- Ask clarifying questions
- Verify understanding
- Manage state carefully
```

### 9.3 Builder Agent Specification

**File:** `.opencode/agents/builder.md`

**Structure:**
```markdown
---
name: builder
description: Implementation sub-agent invoked by orchestrator for code changes. Always returns to orchestrator.
---

# Builder Agent

## Purpose
[As documented in section 4]

## Responsibilities
[As documented in section 4.2]

## When Invoked
[As documented in section 4.3]

## Core Workflow
[As documented in section 4.4]

## Return Protocol
[As documented in section 4.5]

## Skill Execution
[As documented in section 7]

## Error Handling
[As documented in section 4.6]

## Best Practices
- Always return to orchestrator
- Run analyze-and-fix-cycle
- Test and verify
- Report errors immediately
- Don't take initiative
```

### 9.4 Implementation Checklist

**Before Deployment:**
- [ ] orchestrator.md created with full specification
- [ ] builder.md created with full specification
- [ ] multi-agent.md complete
- [ ] multi-agent-quick.md created
- [ ] architecture.md created
- [ ] testing.md created
- [ ] All documentation reviewed
- [ ] File structure verified

**After Deployment:**
- [ ] Test orchestrator startup
- [ ] Test skill discovery
- [ ] Test question handling
- [ ] Test request clarification
- [ ] Test delegation to builder
- [ ] Test builder execution
- [ ] Test builder return
- [ ] Test error handling
- [ ] Test interrupt protocol
- [ ] Test state persistence

---

## 10. Usage Examples

### 10.1 Getting Started

**First Interaction:**
```
User: "Hello"

orchestrator: "Hello! I'm orchestrator, your primary agent for all interactions.

I can help you with:
- Answering questions (thorough explanations)
- Handling requests (clarify, then implement)
- Managing code changes (via builder sub-agent)
- Running skills (analyze, scan, fix)

What would you like help with today?"
```

### 10.2 Common Workflows

**Workflow 1: Question**
```
User: [Ask question]
  ↓
orchestrator: [Explain thoroughly]
  ↓
[No delegation]
```

**Workflow 2: Simple Request**
```
User: [Make request]
  ↓
orchestrator: [Verify understanding]
orchestrator: [Clarify if needed]
  ↓
orchestrator: "Ready to implement?"
  ↓
User: "Yes"
  ↓
orchestrator: [Delegate to builder]
  ↓
builder: [Implement]
builder: [Run skills]
builder: [Return]
  ↓
orchestrator: [Summarize]
orchestrator: "Questions?"
```

**Workflow 3: Complex Request**
```
User: [Make complex request]
  ↓
orchestrator: [Verify understanding]
orchestrator: [Clarify multiple points]
orchestrator: [Assess approach]
orchestrator: [Identify risks]
  ↓
orchestrator: "Proposed approach:
[Detailed explanation]

Risks:
[Detailed risks]

Alternatives:
[Other approaches]

Should I proceed?"
  ↓
User: [Confirm or suggest changes]
  ↓
orchestrator: [Delegate to builder]
  ↓
builder: [Implement]
builder: [Run skills]
builder: [Return]
  ↓
orchestrator: [Summarize]
orchestrator: "Questions?"
```

### 10.3 Edge Case Handling

**Edge Case 1: User Provides Code**
```
User: [Pastes code] "Fix this"
  ↓
orchestrator: [Classify as request]
orchestrator: "I can help. Quick clarifications:
- What should this code do?
- What language/framework?
- Any specific issues?"

User: [Answers]

orchestrator: [Delegate to builder]
```

**Edge Case 2: Multiple Simultaneous Requests**
```
User: "Fix A, B, and C"
  ↓
orchestrator: "I'll handle all three. Execution order:
1. Fix A
2. Fix B
3. Fix C

Should I proceed with this order?"
  ↓
User: "Yes"

orchestrator: [Delegate A to builder]
  ↓
builder: [Complete A]
  ↓
orchestrator: "A complete. Next: B. Ready?"
  ↓
User: "Yes"

orchestrator: [Delegate B to builder]
  ↓
[Continue for C]
```

**Edge Case 3: User Changes Mind**
```
User: "Add feature X"
  ↓
orchestrator: [Clarify]
  ↓
User: "Actually, add Y instead"
  ↓
orchestrator: "Understood. Switching from X to Y.

Clarify for Y:
[Questions for Y]"
```

### 10.4 Skill Usage Examples

**Example 1: Orchestrator Pre-Scan**
```
User: "Review this code" [Pastes code]
  ↓
orchestrator: [Run flutter-code-scanner]
orchestrator: "Code review findings:
[Summary]

Should I fix the issues?"
```

**Example 2: Builder Post-Fix**
```
User: "Fix the bug"
  ↓
orchestrator: [Delegate to builder]
  ↓
builder: [Fix bug]
builder: [Run analyze-and-fix-cycle]
builder: [Return]
  ↓
orchestrator: "Bug fixed! Code is clean."
```

---

## 11. Edge Cases

### 11.1 Ambiguous Messages

**Symptoms:**
- User says "It's broken"
- User says "Doesn't work"
- User provides minimal context

**Protocol:**
```
Ambiguous message received
    ↓
orchestrator: [Ask for clarification]
    ├─ What exactly is happening?
    ├─ Any error messages?
    ├─ When did this start?
    └─ What platform/environment?
    ↓
Wait for user response
```

### 11.2 Builder Failures

**Type 1: Unfixable Errors**
```
builder: [Encounters unfixable lint error]
  ↓
builder: [Return to orchestrator with error]
  ↓
orchestrator: "Builder encountered an error:

[Error details]

Suggested fixes:
[Builder's recommendations]

Would you like me to try a different approach?"
```

**Type 2: Test Failures**
```
builder: [Tests fail]
  ↓
builder: [Attempt to fix]
    ├─ Identify failing tests
    ├─ Fix issues
    └─ Re-run tests
  ↓
If fixed → Continue
If not fixed → Return to orchestrator
  ↓
orchestrator: "Tests are failing. Options:
A) Debug and fix
B) Update tests
C) Accept as known issue"
```

**Type 3: Build Failures**
```
builder: [Build fails]
  ↓
builder: [Analyze build error]
  ↓
If fixable → Fix and rebuild
If not fixable → Return to orchestrator
  ↓
orchestrator: "Build failed. Error:
[Build error]

Should I try a different approach?"
```

### 11.3 User Interruptions

**Scenario: Builder Executing**
```
[Builder working on task]
  ↓
User: "Stop! Do Y instead"
  ↓
orchestrator: [Interrupt builder]
orchestrator: "Stopping current task.

New task: Y

Ready to proceed?"
  ↓
builder: [Acknowledge interrupt]
builder: [Cancel current task]
builder: [Ready for new task]
  ↓
orchestrator: [Delegate Y to builder]
```

**Interruption Handling:**
```json
{
  "type": "interrupt",
  "from": "orchestrator",
  "to": "builder",
  "reason": "User changed requirements",
  "cancel_current": true
}
```

### 11.4 Multiple Related Tasks

**Scenario: Sequential Tasks**
```
User: "Fix A, then B, then C"
  ↓
orchestrator: "I'll handle these in order:

1. Fix A
2. Fix B
3. Fix C

Starting with A..."
  ↓
orchestrator: [Delegate A to builder]
  ↓
builder: [Complete A]
  ↓
orchestrator: "A complete. Next: B. Ready?"
  ↓
User: "Yes"
  ↓
orchestrator: [Delegate B to builder]
  ↓
[Continue for C]
```

### 11.5 Skill Execution Failures

**Skill Not Found:**
```
orchestrator: [Attempts to run non-existent skill]
  ↓
orchestrator: "Skill 'xyz' not found.

Available skills:
- analyze-and-fix-cycle
- flutter-code-scanner

Would you like me to use a different skill?"
```

**Skill Timeout:**
```
orchestrator: [Run skill]
  ↓
[Skill times out]
  ↓
orchestrator: "Skill 'analyze-and-fix-cycle' timed out.

Would you like me to:
A) Retry
B) Skip and continue
C) Debug the issue"
```

**Skill Returns Error:**
```
orchestrator: [Run skill]
  ↓
[Skill returns error]
  ↓
orchestrator: "Skill encountered an error:

[Error details]

Should I proceed anyway?"
```

### 11.6 State Corruption

**Symptoms:**
- Orchestrator thinks builder is active but builder is done
- Builder thinks it's delegated but orchestrator doesn't know
- Conversation history inconsistent

**Recovery Protocol:**
```
Detect state corruption
    ↓
orchestrator: [Reset to known state]
orchestrator: "I detected a state issue. Resetting...
State reset to: idle

Where should we continue from?"
  ↓
User: [Provide context]
  ↓
orchestrator: [Reconstruct state]
orchestrator: [Resume conversation]
```

---

## 12. Troubleshooting

### 12.1 Orchestrator Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| Orchestrator not responding | Not loaded | Check orchestrator.md exists in agents/ |
| Orchestrator classifying incorrectly | Guidelines not loaded | Verify COMMUNICATION_GUIDELINES.md path |
| Orchestrator not delegating | User confirmation missing | Ask user explicitly |
| Orchestrator stuck in loop | State corruption | Reset state, reload orchestrator |

### 12.2 Builder Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| Builder not invoked | Delegation criteria not met | Check delegation message format |
| Builder not returning | Error during execution | Check builder logs, error message |
| Builder returns immediately | Task misunderstood | Clarify requirements, redelegate |
| Builder runs wrong skills | Skill registry issue | Re-scan skills/, reload registry |

### 12.3 State Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| State lost on reload | Not persisted | Implement state persistence |
| Builder always shows active | State not updated | Fix state transition logic |
| Conversation history missing | Not tracking history | Enable history tracking |
| Skills not discovered | Scan failure | Debug skill discovery logic |

### 12.4 Communication Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| Delegation message not received | Format incorrect | Verify JSON format |
| Completion message lost | Network issue | Implement retry logic |
| Error not propagated | Not checking for errors | Add error checking |
| Interrupt not handled | No interrupt protocol | Implement interrupt handler |

### 12.5 Skill Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| Skills not discovered | Directory scan failed | Check permissions, paths |
| Wrong skill runs | Registry mismatch | Rebuild skill registry |
| Skill hangs | Infinite loop | Add timeout, kill process |
| Skill returns wrong format | API changed | Update skill integration code |

### 12.6 Debug Commands

**Force State Reset:**
```markdown
[Internal] Reset orchestrator state to idle
```

**Re-scan Skills:**
```markdown
[Internal] Rescan skills/ directory and rebuild registry
```

**Debug Delegation:**
```markdown
[Internal] Show last delegation message and status
```

**Debug Builder:**
```markdown
[Internal] Show builder current state and last task
```

**Debug State:**
```markdown
[Internal] Show full session state
```

---

## 13. Best Practices

### 13.1 For Orchestrator

**Always:**
- ✅ Classify message type first
- ✅ Load and follow communication guidelines
- ✅ Ask clarifying questions when ambiguous
- ✅ Verify understanding before delegating
- ✅ Check for risks and alternatives
- ✅ Get user confirmation
- ✅ Track state carefully
- ✅ Handle errors gracefully
- ✅ Remain active for follow-up

**Never:**
- ❌ Jump to implementation without clarification
- ❌ Assume user intent
- ❌ Skip question answering
- ❌ Delegate without confirmation
- ❌ Forget to update state
- ❌ Ignore errors
- ❌ Take actions for questions

### 13.2 For Builder

**Always:**
- ✅ Receive delegation before starting
- ✅ Follow task requirements exactly
- ✅ Run analyze-and-fix-cycle (mandatory)
- ✅ Test and verify changes
- ✅ Return to orchestrator
- ✅ Report errors immediately
- ✅ Provide clear summaries
- ✅ Don't deviate from requirements

**Never:**
- ❌ Start without delegation
- ❌ Skip mandatory skills
- ❌ Take initiative
- ❌ Make decisions
- ❌ Return incomplete tasks
- ❌ Hide errors
- ❌ Assume requirements

### 13.3 For Users

**Best Practices:**
- ✅ Be specific in requests
- ✅ Provide context when needed
- ✅ Confirm when asked
- ✅ Ask questions if unclear
- ✅ Provide feedback on results
- ✅ Report issues promptly

**Avoid:**
- ❌ Ambiguous messages
- ❌ Assuming automation
- ❌ Skipping confirmations
- ❌ Interrupting unnecessarily

### 13.4 For System

**Always:**
- ✅ Load orchestrator on startup
- ✅ Persist state between messages
- ✅ Track conversation history
- ✅ Validate message formats
- ✅ Handle errors gracefully
- ✅ Support interrupts
- ✅ Provide debug capabilities

**Never:**
- ❌ Start without agents
- ❌ Lose state
- ❌ Ignore errors
- ❌ Block interrupts
- ❌ Allow state corruption

---

## 14. Migration Path

### 14.1 From Current Architecture

**Current State:**
```
User Message
    ↓
Me: [Directly handles]
    ↓
[No guidelines enforcement]
[No agent routing]
[No state management]
[No skill integration]
```

**Issues:**
- ❌ Workflow violations common
- ❌ Inconsistent behavior
- ❌ No skill awareness
- ❌ No state tracking

### 14.2 To Multi-Agent Architecture

**Target State:**
```
User Message
    ↓
orchestrator: [Classifies]
orchestrator: [Enforces guidelines]
orchestrator: [Routes appropriately]
orchestrator: [Manages state]
orchestrator: [Integrates skills]
  ↓
[If question] → Explain
[If request] → Clarify → Delegate to builder
builder: [Implements] → [Runs skills] → [Returns]
orchestrator: [Summarizes] → [Questions?]
```

**Benefits:**
- ✅ Workflow always enforced
- ✅ Consistent behavior
- ✅ Skill-aware
- ✅ State managed
- ✅ Graceful error handling

### 14.3 Migration Steps

**Phase 1: Preparation**
1. Create `.opencode/multi-agent/` directory
2. Create `.opencode/agents/` directory
3. Create orchestrator.md
4. Create builder.md
5. Create documentation files

**Phase 2: Testing**
1. Test orchestrator startup
2. Test skill discovery
3. Test message classification
4. Test question handling
5. Test request clarification
6. Test delegation
7. Test builder execution
8. Test return handling
9. Test error handling
10. Test state management

**Phase 3: Deployment**
1. Deploy to production
2. Monitor for issues
3. Collect feedback
4. Fix bugs
5. Iterate

**Phase 4: Rollback Plan**
If issues occur:
1. Disable multi-agent routing
2. Restore direct handling
3. Preserve state
4. Investigate issues
5. Re-deploy when fixed

### 14.4 Verification Checklist

**Before Migration:**
- [ ] All documentation complete
- [ ] Agent specifications verified
- [ ] Testing protocol defined
- [ ] Rollback plan ready

**After Migration:**
- [ ] Orchestrator loads successfully
- [ ] Builder available
- [ ] Skills discoverable
- [ ] Question handling works
- [ ] Request handling works
- [ ] Delegation works
- [ ] Return handling works
- [ ] Error handling works
- [ ] State management works
- [ ] User experience smooth

---

## Appendix A: Reference Tables

### A.1 Agent Comparison

| Feature | orchestrator | builder |
|---------|-------------|---------|
| **Type** | Root agent | Sub-agent |
| **Always active?** | Yes | No (only when delegated) |
| **Primary role** | Communication management | Implementation |
| **Message handling** | All user messages | Only delegation messages |
| **Guidelines enforcement** | Yes | Yes (via orchestrator) |
| **Skill usage** | Pre-delegation (contextual) | Post-implementation (mandatory) |
| **Decision making** | High | None (follows instructions) |
| **State management** | Yes | Minimal |
| **Returns to** | N/A (always active) | Orchestrator |

### A.2 Skill Usage Matrix

| Skill | Orchestrator Use | Builder Use | When |
|-------|------------------|-------------|------|
| analyze-and-fix-cycle | Pre-delegation (optional) | Post-implementation (mandatory) | After code changes |
| flutter-code-scanner | Pre-delegation (contextual) | Post-implementation (contextual) | Flutter code involved |
| skill-maintainer | When creating SKILL.md | When managing skills | Skill management |
| [other] | Context-dependent | Task-dependent | As needed |

### A.3 Message Type Matrix

| Message Type | Orchestrator Action | Delegation? | Skill Usage? |
|-------------|-------------------|------------|--------------|
| Question | Explain only | No | No |
| Simple request | Clarify → Ask confirmation | Yes (after confirm) | No |
| Complex request | Clarify → Assess → Explain → Ask | Yes (after confirm) | Maybe (pre-scan) |
| Ambiguous | Ask for clarification | No | No |
| Code review request | Run scanner skill | Maybe (if fixes needed) | Yes (pre-scan) |

### A.4 State Transitions

| Current State | Trigger | Next State |
|--------------|--------|-----------|
| idle | User sends request and confirms | delegated |
| delegated | Builder completes task | post_builder |
| post_builder | User says "no questions" | idle |
| post_builder | User asks follow-up question | post_builder (orchestrator handles) |
| post_builder | User sends new request | delegated |

---

## Appendix B: Technical Specifications

### B.1 Delegation Message Schema

```json
{
  "type": "delegation",
  "from": "orchestrator",
  "to": "builder",
  "timestamp": "ISO-8601",
  "task": {
    "id": "string",
    "description": "string",
    "requirements": [
      {
        "type": "file_creation|file_modification|command",
        "path": "string (optional)",
        "content": "string (optional)",
        "command": "string (optional)"
      }
    ],
    "context": "string",
    "guidelines": "string",
    "priority": "high|medium|low",
    "deadline": "ISO-8601 (optional)"
  },
  "conversation_history": [
    {
      "role": "user|assistant|delegation|builder",
      "content": "string",
      "timestamp": "ISO-8601",
      "agent_active": "orchestrator|builder (optional)"
    }
  ],
  "skills_to_run": [
    {
      "name": "string",
      "mandatory": "boolean",
      "parameters": "object (optional)"
    }
  ]
}
```

### B.2 Completion Message Schema

```json
{
  "type": "completion",
  "from": "builder",
  "to": "orchestrator",
  "timestamp": "ISO-8601",
  "task_id": "string",
  "status": "complete|error|interrupted",
  "duration_seconds": "number",
  "changes": [
    {
      "file": "string",
      "action": "created|modified|deleted",
      "lines_added": "number (optional)",
      "lines_removed": "number (optional)",
      "lines_changed": "number (optional)",
      "changes": "string"
    }
  ],
  "issues": [
    {
      "severity": "error|warning|info",
      "message": "string",
      "file": "string",
      "line": "number",
      "code": "string"
    }
  ],
  "test_results": {
    "tests": {
      "total": "number",
      "passed": "number",
      "failed": "number",
      "skipped": "number"
    },
    "lint": {
      "errors": "number",
      "warnings": "number",
      "info": "number"
    },
    "build": {
      "platform": "string",
      "status": "success|failed",
      "duration_seconds": "number"
    }
  },
  "summary": "string",
  "recommendations": ["string"],
  "can_continue": "boolean"
}
```

### B.3 Session State Schema

```json
{
  "active_agent": "orchestrator",
  "delegated_agent": "orchestrator|builder|null",
  "conversation_history": [
    {
      "role": "user|assistant|delegation|builder",
      "content": "string",
      "timestamp": "ISO-8601",
      "agent_active": "orchestrator|builder|null"
    }
  ],
  "last_builder_task": {
    "task_id": "string|null",
    "description": "string|null",
    "delegated_at": "ISO-8601|null",
    "completed_at": "ISO-8601|null",
    "status": "in_progress|complete|error|null",
    "changes": "array|null",
    "issues": "array|null"
  },
  "workflow_state": "idle|delegated|post_builder",
  "skill_registry": {
    "skills": {
      "skill_name": {
        "name": "string",
        "description": "string",
        "file": "string",
        "when_to_use": ["string"],
        "last_used": "ISO-8601|null",
        "execution_count": "number"
      }
    },
    "last_updated": "ISO-8601"
  }
}
```

---

## Glossary

| Term | Definition |
|------|-----------|
| **orchestrator** | Root agent, always active, manages all interactions |
| **builder** | Sub-agent, invoked by orchestrator, implements changes |
| **Delegation** | Action of orchestrator passing task to builder |
| **Skill** | Specialized task tool (analyze, scan, fix) |
| **Question** | User message seeking knowledge or understanding |
| **Request** | User message wanting action or implementation |
| **Ambiguous** | User message unclear, needs clarification |
| **State** | Current condition of session, agents, tasks |
| **Workflow** | Sequence of steps for handling interactions |
| **Guidelines** | Communication patterns from COMMUNICATION_GUIDELINES.md |
| **Registry** | In-memory database of available skills |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-27 | Initial version - Complete multi-agent architecture documentation |

---

## Contact & Support

For questions or issues with the multi-agent architecture:
1. Check troubleshooting section (Section 12)
2. Review workflow examples (Section 5)
3. Consult best practices (Section 13)
4. Review technical specifications (Appendix B)

---

**End of Document**
