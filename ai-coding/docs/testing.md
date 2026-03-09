# Multi-Agent Testing Protocol

Comprehensive testing protocol for verifying multi-agent system.

---

## Testing Overview

**Goal:** Ensure orchestrator-builder system works reliably.

**Scope:**
- Agent loading and activation
- Message classification
- Delegation workflow
- Builder execution
- Skill integration
- State management
- Error handling
- Edge cases

---

## Test Categories

| Category | Tests | Priority |
|-----------|-------|----------|
| **Agent Loading** | 3 | Critical |
| **Message Classification** | 5 | Critical |
| **Delegation** | 4 | Critical |
| **Builder Execution** | 4 | Critical |
| **Skills** | 3 | High |
| **State Management** | 4 | Critical |
| **Error Handling** | 5 | Critical |
| **Edge Cases** | 5 | High |

---

## Test Environment

**Setup:**
```
1. Fresh session
2. Clean state
3. All files present:
   - .opencode/agents/orchestrator.md
   - .opencode/agents/builder.md
   - .opencode/skills/analyze-and-fix-cycle/SKILL.md
   - .opencode/skills/flutter-code-scanner/SKILL.md
```

**Verification:**
```bash
# Check files exist
ls -la .opencode/agents/
ls -la .opencode/skills/

# Check skill content
cat .opencode/agents/orchestrator.md | head -20
cat .opencode/agents/builder.md | head -20
```

---

## Test Cases

### 1. Agent Loading Tests

#### Test 1.1: Orchestrator Loads

**Objective:** Verify orchestrator loads and activates.

**Steps:**
```
1. Start new session
2. Check orchestrator is active
3. Verify orchestrator state
```

**Expected Result:**
- ✅ orchestrator.md loaded
- ✅ orchestrator active
- ✅ State: idle
- ✅ No errors

**Failure Criteria:**
- ❌ orchestrator not found
- ❌ orchestrator not active
- ❌ State: null or error
- ❌ Loading errors

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 1.2: Builder Available

**Objective:** Verify builder can be invoked.

**Steps:**
```
1. Check builder.md exists
2. Verify builder in agent list
3. Test builder invocation (dry run)
```

**Expected Result:**
- ✅ builder.md loaded
- ✅ builder available
- ✅ builder accepts delegation
- ✅ No errors

**Failure Criteria:**
- ❌ builder not found
- ❌ builder cannot be invoked
- ❌ Delegation errors

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 1.3: Skill Discovery

**Objective:** Verify orchestrator discovers skills.

**Steps:**
```
1. Start orchestrator
2. Check skill registry
3. Verify skills found
```

**Expected Result:**
- ✅ Skills scanned
- ✅ analyze-and-fix-cycle in registry
- ✅ flutter-code-scanner in registry
- ✅ Skill metadata loaded
- ✅ No missing skills

**Failure Criteria:**
- ❌ Skills not found
- ❌ Registry empty
- ❌ Metadata missing
- ❌ Discovery errors

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

### 2. Message Classification Tests

#### Test 2.1: Question Pattern - "Why"

**Objective:** Verify "Why" messages classified as questions.

**Input:**
```
User: "Why didn't you use analyze-and-fix-cycle?"
```

**Expected Result:**
- ✅ Classified as: question
- ✅ Explains thoroughly
- ✅ NO actions taken
- ✅ NO delegation

**Failure Criteria:**
- ❌ Classified as request
- ❌ Actions taken
- ❌ Delegation attempted

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 2.2: Question Pattern - "How"

**Objective:** Verify "How" messages classified as questions.

**Input:**
```
User: "How do I fix this error?"
```

**Expected Result:**
- ✅ Classified as: question
- ✅ Explains thoroughly
- ✅ NO actions taken
- ✅ NO delegation

**Failure Criteria:**
- ❌ Classified as request
- ❌ Actions taken
- ❌ Delegation attempted

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 2.3: Question Pattern - "What"

**Objective:** Verify "What" messages classified as questions.

**Input:**
```
User: "What does this error mean?"
```

**Expected Result:**
- ✅ Classified as: question
- ✅ Explains thoroughly
- ✅ NO actions taken
- ✅ NO delegation

**Failure Criteria:**
- ❌ Classified as request
- ❌ Actions taken
- ❌ Delegation attempted

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 2.4: Request Pattern - "Fix"

**Objective:** Verify "Fix" messages classified as requests.

**Input:**
```
User: "Fix the FedCM error"
```

**Expected Result:**
- ✅ Classified as: request
- ✅ Asks for confirmation
- ✅ NO implementation without confirmation
- ✅ Waits for user

**Failure Criteria:**
- ❌ Classified as question
- ❌ Immediate implementation
- ❌ No confirmation asked

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 2.5: Request Pattern - "Add"

**Objective:** Verify "Add" messages classified as requests.

**Input:**
```
User: "Add dark mode"
```

**Expected Result:**
- ✅ Classified as: request
- ✅ Asks for clarification
- ✅ Asks for confirmation
- ✅ NO immediate implementation

**Failure Criteria:**
- ❌ Classified as question
- ❌ Immediate implementation
- ❌ No clarification

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 2.6: Ambiguous Pattern

**Objective:** Verify ambiguous messages trigger clarification.

**Input:**
```
User: "Auth is broken"
```

**Expected Result:**
- ✅ Classified as: ambiguous
- ✅ Asks for clarification
- ✅ Requests more context
- ✅ NO assumptions made

**Failure Criteria:**
- ❌ Classified as question
- ❌ Classified as request
- ❌ Assumptions made
- ❌ Immediate action

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

### 3. Delegation Tests

#### Test 3.1: Simple Delegation

**Objective:** Verify basic delegation workflow.

**Input:**
```
User: "Fix bug X"
orchestrator: "Ready to fix X. Confirm?"
User: "Yes"
```

**Expected Result:**
- ✅ Delegation message sent
- ✅ builder receives delegation
- ✅ builder starts task
- ✅ State: delegated

**Failure Criteria:**
- ❌ No delegation sent
- ❌ Builder doesn't receive
- ❌ State unchanged
- ❌ Delegation errors

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 3.2: Delegation with Context

**Objective:** Verify delegation includes conversation history.

**Input:**
```
User: "What's this error?"
orchestrator: [Explains error]
User: "Fix it"
orchestrator: [Clarifies]
User: "Yes, go ahead"
```

**Expected Result:**
- ✅ Delegation includes full history
- ✅ Builder has context
- ✅ Builder knows prior discussion
- ✅ Consistent with expectations

**Failure Criteria:**
- ❌ Delegation missing history
- ❌ Builder lacks context
- ❌ Inconsistent with discussion

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 3.3: Delegation with Skills

**Objective:** Verify delegation specifies skills to run.

**Input:**
```
User: "Fix Flutter code"
orchestrator: "Ready to fix. Will run analyze-and-fix-cycle and flutter-code-scanner. Confirm?"
User: "Yes"
```

**Expected Result:**
- ✅ Delegation includes skills
- ✅ analyze-and-fix-cycle specified
- ✅ flutter-code-scanner specified
- ✅ Builder runs both skills

**Failure Criteria:**
- ❌ Skills not in delegation
- ❌ Builder skips skills
- ❌ Incomplete skill execution

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

### 4. Builder Execution Tests

#### Test 4.1: Simple Implementation

**Objective:** Verify builder implements basic task.

**Input:**
```
Delegation: "Fix file X line Y"
```

**Expected Result:**
- ✅ Builder receives delegation
- ✅ Implements change
- ✅ Runs analyze-and-fix-cycle
- ✅ Returns completion
- ✅ State: post_builder

**Failure Criteria:**
- ❌ Implementation incorrect
- ❌ Skips skills
- ❌ Doesn't return
- ❌ State unchanged

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 4.2: Multiple Changes

**Objective:** Verify builder handles multiple file changes.

**Input:**
```
Delegation: "Fix files X, Y, and Z"
```

**Expected Result:**
- ✅ All files modified
- ✅ analyze-and-fix-cycle run
- ✅ All changes verified
- ✅ Complete summary returned

**Failure Criteria:**
- ❌ Not all files modified
- ❌ Changes incorrect
- ❌ Incomplete summary

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 4.3: Skill Execution

**Objective:** Verify builder runs mandatory skills.

**Input:**
```
Delegation: "Implement feature X"
```

**Expected Result:**
- ✅ analyze-and-fix-cycle run
- ✅ Tests passed
- ✅ Lint clean
- ✅ All skills completed

**Failure Criteria:**
- ❌ analyze-and-fix-cycle skipped
- ❌ Skills incomplete
- ❌ Lint errors remain
- ❌ Tests failing

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 4.4: Return to Orchestrator

**Objective:** Verify builder returns to orchestrator.

**Input:**
```
[Builder completes task]
```

**Expected Result:**
- ✅ Completion message sent
- ✅ Returns to orchestrator
- ✅ Orchestrator receives
- ✅ State: post_builder

**Failure Criteria:**
- ❌ No completion message
- ❌ Doesn't return
- ❌ State: delegated (stuck)

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

### 5. Skills Tests

#### Test 5.1: Mandatory Skill - analyze-and-fix-cycle

**Objective:** Verify analyze-and-fix-cycle always runs.

**Input:**
```
Delegation: "Make code change"
```

**Expected Result:**
- ✅ analyze-and-fix-cycle runs
- ✅ Issues found and fixed
- ✅ Tests pass
- ✅ Lint clean

**Failure Criteria:**
- ❌ analyze-and-fix-cycle skipped
- ❌ Issues not fixed
- ❌ Tests not run
- ❌ Lint errors remain

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 5.2: Contextual Skill - flutter-code-scanner

**Objective:** Verify flutter-code-scanner runs for Flutter code.

**Input:**
```
Delegation: "Modify Flutter widget"
```

**Expected Result:**
- ✅ flutter-code-scanner runs
- ✅ Flutter issues found
- ✅ Recommendations provided

**Failure Criteria:**
- ❌ flutter-code-scanner skipped
- ❌ Flutter issues not found

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 5.3: Skill Error Handling

**Objective:** Verify skill errors handled gracefully.

**Input:**
```
Delegation: "Run skill X (which doesn't exist)"
```

**Expected Result:**
- ✅ Skill not found error
- ✅ Orchestrator informed
- ✅ Alternative suggested
- ✅ System stable

**Failure Criteria:**
- ❌ Crash on skill error
- ❌ System unstable
- ❌ No error reporting

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

### 6. State Management Tests

#### Test 6.1: Initial State

**Objective:** Verify initial state is correct.

**Input:**
```
[Start session]
```

**Expected Result:**
- ✅ active_agent: orchestrator
- ✅ delegated_agent: null
- ✅ workflow_state: idle
- ✅ conversation_history: []
- ✅ skill_registry: loaded

**Failure Criteria:**
- ❌ active_agent: null/undefined
- ❌ workflow_state: null/undefined
- ❌ skill_registry: empty

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 6.2: Delegated State

**Objective:** Verify state updates during delegation.

**Input:**
```
[Delegate to builder]
```

**Expected Result:**
- ✅ active_agent: orchestrator
- ✅ delegated_agent: builder
- ✅ workflow_state: delegated
- ✅ last_builder_task: populated

**Failure Criteria:**
- ❌ delegated_agent: null
- ❌ workflow_state: idle
- ❌ last_builder_task: null

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 6.3: Post-Builder State

**Objective:** Verify state after builder completes.

**Input:**
```
[Builder returns]
```

**Expected Result:**
- ✅ active_agent: orchestrator
- ✅ delegated_agent: null
- ✅ workflow_state: post_builder
- ✅ last_builder_task: complete

**Failure Criteria:**
- ❌ delegated_agent: builder
- ❌ workflow_state: delegated
- ❌ last_builder_task: in_progress

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 6.4: State Reset

**Objective:** Verify state can be reset.

**Input:**
```
[Reset state command]
```

**Expected Result:**
- ✅ active_agent: orchestrator
- ✅ delegated_agent: null
- ✅ workflow_state: idle
- ✅ conversation_history: []
- ✅ last_builder_task: null

**Failure Criteria:**
- ❌ State not reset
- ❌ Corrupted state

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

### 7. Error Handling Tests

#### Test 7.1: Builder Error - Unfixable

**Objective:** Verify unfixable errors handled.

**Input:**
```
Delegation: "Fix unfixable error X"
Builder: [Cannot fix]
```

**Expected Result:**
- ✅ Builder returns error
- ✅ Orchestrator receives error
- ✅ User informed
- ✅ Alternative suggested
- ✅ System stable

**Failure Criteria:**
- ❌ Builder hangs
- ❌ Crash on error
- ❌ No error reporting

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 7.2: Test Failure

**Objective:** Verify test failures handled.

**Input:**
```
Delegation: "Make changes"
Builder: [Tests fail]
```

**Expected Result:**
- ✅ Builder detects failure
- ✅ Attempts fix
- ✅ Re-runs tests
- ✅ Returns with results
- ✅ If unfixable: return to orchestrator

**Failure Criteria:**
- ❌ Tests not run
- ❌ Failure not detected
- ❌ No recovery attempt

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 7.3: Lint Failure

**Objective:** Verify lint errors handled.

**Input:**
```
Delegation: "Make changes"
Builder: [Lint errors found]
```

**Expected Result:**
- ✅ Builder detects errors
- ✅ Attempts auto-fix
- ✅ Re-runs lint
- ✅ All fixed or reports
- ✅ Returns with summary

**Failure Criteria:**
- ❌ Lint not run
- ❌ Errors not fixed
- ❌ No reporting

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 7.4: Build Failure

**Objective:** Verify build failures handled.

**Input:**
```
Delegation: "Build project"
Builder: [Build fails]
```

**Expected Result:**
- ✅ Builder detects failure
- ✅ Reports error details
- ✅ Returns to orchestrator
- ✅ User informed
- ✅ Alternative suggested

**Failure Criteria:**
- ❌ Build not attempted
- ❌ Failure not detected
- ❌ Crash on error

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

### 8. Edge Case Tests

#### Test 8.1: User Interrupt

**Objective:** Verify user can interrupt builder.

**Input:**
```
[Builder working]
User: "Stop!"
```

**Expected Result:**
- ✅ Orchestrator interrupts builder
- ✅ Builder acknowledges
- ✅ Builder cancels task
- ✅ State reset
- ✅ System stable

**Failure Criteria:**
- ❌ Builder doesn't stop
- ❌ System hangs
- ❌ State corrupted

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 8.2: Follow-up Question

**Objective:** Verify follow-up questions handled by orchestrator.

**Input:**
```
[Builder just finished]
User: "What did you change?"
```

**Expected Result:**
- ✅ Orchestrator handles
- ✅ Explains builder's changes
- ✅ NO new delegation
- ✅ State: post_builder

**Failure Criteria:**
- ❌ New delegation triggered
- ❌ No explanation
- ❌ State: idle

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 8.3: Multiple Tasks

**Objective:** Verify sequential task handling.

**Input:**
```
User: "Fix A, then B, then C"
```

**Expected Result:**
- ✅ Orchestrator handles A
- ✅ Delegates to builder
- ✅ Builder completes A
- ✅ Orchestrator: "Next: B. Ready?"
- ✅ Continues for B, C
- ✅ All tasks completed

**Failure Criteria:**
- ❌ Tasks handled out of order
- ❌ Task skipped
- ❌ No confirmation between tasks

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 8.4: State Corruption Recovery

**Objective:** Verify system can recover from state corruption.

**Input:**
```
[Corrupt state]
```

**Expected Result:**
- ✅ Corruption detected
- ✅ State reset to idle
- ✅ User informed
- ✅ System stable

**Failure Criteria:**
- ❌ Corruption not detected
- ❌ Cannot recover
- ❌ System unstable

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

#### Test 8.5: Skill Timeout

**Objective:** Verify skill timeout handled.

**Input:**
```
[Skill takes too long]
```

**Expected Result:**
- ✅ Timeout detected
- ✅ Skill interrupted
- ✅ Error reported
- ✅ System stable

**Failure Criteria:**
- ❌ No timeout detection
- ❌ System hangs
- ❌ Crash

**Status:** ☐ Not Tested / ☑ Passed / ☒ Failed

---

## Test Execution

### Manual Testing

**Procedure:**
```
1. Start fresh session
2. Execute each test case
3. Record results
4. Verify expected vs actual
5. Mark status (☐/☑/☒)
```

**Documentation:**
```
Test: [Test Name]
Date: [Timestamp]
Expected: [Expected result]
Actual: [Actual result]
Status: ☑ Passed / ☒ Failed
Notes: [Any observations]
```

---

## Test Results

### Summary

| Category | Total | Passed | Failed | Pass Rate |
|-----------|-------|--------|---------|------------|
| Agent Loading | 3 | ☐ | ☐ | 0% |
| Message Classification | 5 | ☐ | ☐ | 0% |
| Delegation | 4 | ☐ | ☐ | 0% |
| Builder Execution | 4 | ☐ | ☐ | 0% |
| Skills | 3 | ☐ | ☐ | 0% |
| State Management | 4 | ☐ | ☐ | 0% |
| Error Handling | 5 | ☐ | ☐ | 0% |
| Edge Cases | 5 | ☐ | ☐ | 0% |
| **TOTAL** | **33** | **0** | **0** | **0%** |

---

## Rollback Criteria

If multiple critical failures occur:

1. **Disable multi-agent routing**
2. **Restore direct handling**
3. **Preserve conversation history**
4. **Investigate root cause**
5. **Fix and retest**

---

## Continuous Testing

**After Each Change:**
```
1. Run affected test cases
2. Verify no regression
3. Update test results
4. Document issues
```

**Regular Schedule:**
```
Weekly: Full test suite
Monthly: Comprehensive review
After deployment: Smoke tests
```

---

## Test Automation (Future)

**Planned Automated Tests:**
```python
# Pseudo-code for automated testing
for test in test_cases:
    result = execute_test(test)
    assert result.expected == result.actual
    log_test_result(result)
```

---

**End of Testing Protocol**
