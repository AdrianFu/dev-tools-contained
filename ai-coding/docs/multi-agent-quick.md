# Multi-Agent Quick Reference

Fast reference guide for orchestrator-builder multi-agent system.

---

## Quick Start

**Key Concept:**
- **orchestrator** = Always active, manages everything
- **builder** = Sub-agent, only when implementing
- **Skills** = Tools (analyze, scan, fix)

**Basic Flow:**
```
User → orchestrator → [classify] → [question|request]
                          ↓                   ↓
                    [explain]          [clarify]
                          ↓                   ↓
                      [done]          [delegate] → builder → [implement] → return → orchestrator
```

---

## Message Types

### Questions (No Action)

**Patterns:**
- Why...?
- How...?
- What...?
- Should I...?
- Can you explain...?

**orchestrator Action:**
- Explain thoroughly
- NO actions
- NO delegation

### Requests (Implementation)

**Patterns:**
- Fix...
- Add...
- Implement...
- Change...
- Update...

**orchestrator Action:**
1. Verify understanding
2. Ask clarifying questions
3. Get user confirmation
4. Delegate to builder

---

## Workflow Cheat Sheet

### Simple Question
```
User: "How does auth work?"
orchestrator: [Explain auth flow]
[Done]
```

### Simple Request
```
User: "Fix bug X"
orchestrator: "Ready to fix X. Confirm?"
User: "Yes"
orchestrator: [Delegate to builder]
builder: [Fix, test, return]
orchestrator: "Done! Questions?"
```

### Complex Request
```
User: "Add dark mode"
orchestrator: "Clarifications needed:
- System or user toggle?
- Persist preference?
- All screens or just some?"
User: [Answers]
orchestrator: "Approach: [explain]. Risks: [list]. Proceed?"
User: "Yes"
orchestrator: [Delegate to builder]
[...]
orchestrator: "Done! Questions?"
```

### Follow-up Question
```
[Builder just finished]
User: "What did you change?"
orchestrator: [Explains builder's changes]
[No delegation]
```

---

## Decision Tree

```
User Message
  ↓
┌─ Question? ──────────┐
│  ├─ Yes → Explain    │
│  └─ No → Next        │
│  ↓                  │
├─ Request? ──────────┤
│  ├─ Yes → Clarify    │
│  │      ↓           │
│  │      Confirm? ──┐ │
│  │      ├─ Yes → [Delegate to builder]
│  │      └─ No  → Clarify more
│  └─ No → Next        │
│  ↓                  │
└─ Ambiguous? ────────┤
      Ask clarification
```

---

## Agent Roles

| Task | Who Handles |
|------|--------------|
| All user messages | orchestrator |
| Message classification | orchestrator |
| Guideline enforcement | orchestrator |
| Clarifying questions | orchestrator |
| Delegation decisions | orchestrator |
| Implementation | builder |
| Running skills | builder (mandatory), orchestrator (contextual) |
| Testing | builder |
| Returning results | builder → orchestrator |

---

## Skills Usage

| Skill | Who Runs | When |
|-------|-----------|------|
| analyze-and-fix-cycle | builder (mandatory) | After any code changes |
| analyze-and-fix-cycle | orchestrator (optional) | Before delegating (if needed) |
| flutter-code-scanner | Both | Flutter code involved |
| skill-maintainer | Both | Creating/updating SKILL.md |

---

## State Management

**States:**
1. **idle** - orchestrator active, no builder
2. **delegated** - orchestrator active, builder working
3. **post_builder** - orchestrator active, builder done

**Transitions:**
```
idle → delegated → post_builder → idle
```

**Never:**
- ❌ builder active without orchestrator
- ❌ orchestrator inactive
- ❌ State corruption

---

## Common Commands

### For Users
```
"Explain [topic]"                    → Question flow
"Fix [issue]"                         → Request flow
"What did you change?"                  → Follow-up question
"Stop!"                                → Interrupt builder
"Help with [task]"                     → orchestrator clarifies
```

### Internal (Debug)
```
[Reset state]                           → Force idle
[Re-scan skills]                        → Refresh registry
[Show state]                            → Debug state
[Show last delegation]                   → Debug delegation
[Show builder status]                    → Debug builder
```

---

## Error Handling

| Error | Who Handles | How |
|-------|--------------|-----|
| Ambiguous message | orchestrator | Ask for clarification |
| Builder fails | orchestrator | Present options to user |
| Skill fails | agent that ran it | Report error, suggest fix |
| State corruption | orchestrator | Reset state |
| Interrupt | orchestrator | Stop builder, ask new direction |

---

## Best Practices

### orchestrator
✅ Classify message first
✅ Check guidelines before acting
✅ Ask clarifying questions
✅ Get confirmation before delegating
✅ Manage state carefully
✅ Handle errors gracefully

❌ Don't jump to action
❌ Don't assume user intent
❌ Don't skip clarification
❌ Don't forget state updates

### builder
✅ Receive delegation first
✅ Follow task exactly
✅ Run analyze-and-fix-cycle
✅ Test and verify
✅ Return to orchestrator
✅ Report errors immediately

❌ Don't start without delegation
❌ Don't skip mandatory skills
❌ Don't deviate from requirements
❌ Don't make decisions
❌ Don't stay active (always return)

### Users
✅ Be specific in requests
✅ Provide context when needed
✅ Confirm when asked
✅ Report issues promptly

❌ Don't send ambiguous messages
❌ Don't assume automation
❌ Don't skip confirmations

---

## Quick Reference: Message Classification

| Message | Type | Action |
|---------|------|--------|
| "Why is X happening?" | Question | Explain |
| "How do I do Y?" | Question | Explain |
| "What does Z mean?" | Question | Explain |
| "Fix bug A" | Request | Clarify → Delegate |
| "Add feature B" | Request | Clarify → Delegate |
| "Change setting C" | Request | Clarify → Delegate |
| "It's broken" | Ambiguous | Ask clarification |
| "Doesn't work" | Ambiguous | Ask clarification |
| "What did you change?" | Follow-up | Explain (no delegate) |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| orchestrator not responding | Check orchestrator.md exists |
| Builder not invoked | Check delegation format |
| State corrupted | Reset to idle |
| Skills not found | Re-scan skills/ |
| Wrong behavior | Check COMMUNICATION_GUIDELINES.md |

---

## File Structure

```
.opencode/
├── multi-agent/
│   ├── multi-agent.md          ← Full documentation
│   ├── multi-agent-quick.md     ← This file
│   ├── architecture.md           ← Diagrams & overview
│   └── testing.md               ← Testing protocol
├── agents/
│   ├── orchestrator.md           ← Root agent
│   └── builder.md                ← Sub-agent
└── skills/
    ├── analyze-and-fix-cycle/
    │   └── SKILL.md
    └── [other skills]/
        └── SKILL.md
```

---

**For full documentation:** See [multi-agent.md](multi-agent.md)
