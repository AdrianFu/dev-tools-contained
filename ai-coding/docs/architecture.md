# Multi-Agent Architecture

High-level architecture overview with diagrams.

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                                                     │
│              Multi-Agent System                      │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │                                             │ │
│  │            orchestrator (Root Agent)           │ │
│  │                                             │ │
│  │  ┌───────────────────────────────────────┐   │ │
│  │  │ Message Classification               │   │ │
│  │  │                                    │   │ │
│  │  │ User message ──→ Classify type     │   │ │
│  │  │                    │               │   │ │
│  │  │         ┌──────────────────┐     │   │ │
│  │  │         │ Question?        │     │   │ │
│  │  │         │                  │     │   │ │
│  │  │         └─→ Explain only │     │   │ │
│  │  │                          │     │   │ │
│  │  │         ┌──────────────────┐     │   │ │
│  │  │         │ Request?         │     │   │ │
│  │  │         │                  │     │   │ │
│  │  │         ├─→ Clarify       │     │   │ │
│  │  │         ├─→ Assess        │     │   │ │
│  │  │         ├─→ Confirm?      │     │   │ │
│  │  │         │      │          │     │   │ │
│  │  │         │    ┌─Yes─→ Delegate───┼───┼─┼──┐
│  │  │         │    │              │   │ │  │  │
│  │  │         │    └─No→ Clarify   │   │ │  │  │
│  │  │         └──────────────────┘     │   │ │  │
│  │  │                          │     │   │  │
│  │  │         ┌──────────────────┐     │   │ │  │
│  │  │         │ Ambiguous?       │     │   │ │  │
│  │  │         │                  │     │   │ │  │
│  │  │         └─→ Ask for info  │     │   │ │  │
│  │  └──────────────────────────────────────┘   │ │  │
│  │                                        │   │  │
│  │                                        │   │  │
│  │                                        │   │  │ Delegation
│  │                                        │   │  │
│  │                                        │   │  ▼
│  │                     ┌────────────────────┐   │  │
│  │                     │ builder (Sub-Agent)│◄──┘  │
│  │                     │                    │       │
│  │                     │  ┌──────────────┐  │       │
│  │                     │  │ 1. Receive   │  │       │
│  │                     │  │    delegation │  │       │
│  │                     │  └──────────────┘  │       │
│  │                     │                    │       │
│  │                     │  ┌──────────────┐  │       │
│  │                     │  │ 2. Implement │  │       │
│  │                     │  │    changes   │  │       │
│  │                     │  └──────────────┘  │       │
│  │                     │                    │       │
│  │                     │  ┌──────────────┐  │       │
│  │                     │  │ 3. Run       │  │       │
│  │                     │  │    skills    │  │       │
│  │                     │  └──────────────┘  │       │
│  │                     │                    │       │
│  │                     │  ┌──────────────┐  │       │
│  │                     │  │ 4. Test/     │  │       │
│  │                     │  │    verify    │  │       │
│  │                     │  └──────────────┘  │       │
│  │                     │                    │       │
│  │                     │  ┌──────────────┐  │       │
│  │                     │  │ 5. Return    │  │       │
│  │                     │  │    status    │  │       │
│  │                     │  └──────────────┘  │       │
│  │                     └────────────────────┘       │
│  │                                          │
│  │                                          │ Return
│  │                                          │
│  │                                          ▼
│  │  ┌────────────────────────────────┐         │
│  │  │ Re-Entry from Builder      │         │
│  │  │                             │         │
│  │  │ • Acknowledge completion     │         │
│  │  │ • Explain changes          │         │
│  │  │ • Ask for questions       │         │
│  │  │ • Remain active           │         │
│  │  └────────────────────────────────┘         │
│  │                                             │
│  └─────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
Multi-Agent System
├── orchestrator (Root Agent)
│   └── Always Active
│       ├── Message Classification
│       ├── Guideline Enforcement
│       ├── Skill Discovery & Routing
│       └── Delegation Management
│
└── builder (Sub-Agent)
    └── On-Demand (Only when delegated)
        ├── Task Execution
        ├── Mandatory Skills
        │   └── analyze-and-fix-cycle
        ├── Contextual Skills
        │   ├── flutter-code-scanner
        │   └── [other skills]
        ├── Testing & Verification
        └── Return to orchestrator
```

---

## Communication Flow

```
User → orchestrator → [Explain] → User
        ↓
        ↓
    [Delegate]
        ↓
        → builder → [Implement]
        ↓
                  → [Run Skills]
        ↓
                  → [Test]
        ↓
                  → [Return] → orchestrator → [Summary] → User
```

---

## State Transitions

```
┌──────────────┐
│   idle      │ orchestrator active, no builder
└──────────────┘
       ↓
[User sends request and confirms]
       ↓
┌──────────────┐
│  delegated   │ orchestrator active, builder working
└──────────────┘
       ↓
[Builder completes]
       ↓
┌──────────────┐
│post_builder  │ orchestrator active, builder complete
└──────────────┘
       ↓
[User: No questions]
       ↓
┌──────────────┐
│   idle      │ Ready for next interaction
└──────────────┘
```

---

## Decision Tree

```
User Message
    ↓
┌─ Is it a Question? ─────────────────────────┐
│  │                                   │
│  ├─ Yes → Provide thorough explanation   │
│  │        [NO actions]               │
│  │        [NO delegation]              │
│  │                                   │
│  └─ No → Next classification           │
│                                   │
├─ Is it a Request? ─────────────────────┤
│  │                                   │
│  ├─ Yes → Verify understanding          │
│  │        Ask clarifying questions      │
│  │        Assess approach              │
│  │        Identify risks               │
│  │           ↓                       │
│  │        User confirms? ──┐           │
│  │        ├─ Yes → [Delegate to builder]│
│  │        └─ No  → Continue clarification│
│  │                                   │
│  └─ No → Next classification           │
│                                   │
└─ Is it Ambiguous? ─────────────────────┤
                                     │
                                     ├─ Ask for clarification
                                     ├─ Request more context
                                     └─ Don't assume intent
```

---

## Skill Integration

```
┌─────────────────────────────────────────┐
│      orchestrator                     │
│  ┌───────────────────────────────┐   │
│  │ Skill Discovery            │   │
│  │                            │   │
│  │ Scan skills/               │   │
│  │ ↓                          │   │
│  │ Build registry             │   │
│  │                            │   │
│  │ ┌───────────────────────┐   │   │
│  │ │ Pre-delegation?     │   │   │
│  │ │                    │   │   │
│  │ │ ┌─Yes─→ Run skill ─┼───┼─┐│
│  │ │└─No → Continue     │   │ ││
│  │ └───────────────────────┘   │ ││
│  └───────────────────────────────┘ ││
└─────────────────────────────────────────┘│
                                        │
        [Delegation]                     │
                                        ▼
┌─────────────────────────────────────────┐│
│      builder                       ││
│  ┌───────────────────────────────┐   ││
│  │ Mandatory Skills          │   ││
│  │                            │   ││
│  │ analyze-and-fix-cycle     │   ││
│  │ (ALWAYS RUN)             │   ││
│  └───────────────────────────────┘   ││
│  ┌───────────────────────────────┐   ││
│  │ Contextual Skills         │   ││
│  │                            │   ││
│  │ flutter-code-scanner      │   ││
│  │ (if Flutter code)        │   ││
│  │                            │   ││
│  │ [other skills]          │   ││
│  └───────────────────────────────┘   ││
└─────────────────────────────────────────┘│
                                        │
                                    [Return]
                                        │
┌─────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│      orchestrator                     │
│                                     │
│  ┌───────────────────────────────┐   │
│  │ Receive builder completion │   │
│  │                            │   │
│  │ Status: complete/error?  │   │
│  │ ↓                          │   │
│  │ Complete ─→ Explain     │   │
│  │   changes                  │   │
│  │   Ask: "Questions?"       │   │
│  │                            │   │
│  │ Error ─→ Present       │   │
│  │   error details            │   │
│  │   Suggest fixes           │   │
│  │   Ask: "Try different?"  │   │
│  └───────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Interrupt Flow

```
[Builder working]
    ↓
User: "Stop! Do Y instead"
    ↓
┌─────────────────────────────────────────┐
│      orchestrator                     │
│                                     │
│  ┌───────────────────────────────┐   │
│  │ Interrupt builder          │   │
│  │                            │   │
│  │ Send interrupt message     │   │
│  │                            │   │
│  │ Builder acknowledges      │   │
│  │ Cancels task             │   │
│  │                            │   │
│  │ Ask: "Ready for Y?"      │   │
│  └───────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Data Flow

```
User Input
    ↓
┌─────────────────────────────────────────┐
│      orchestrator                     │
│  ├─ Load COMMUNICATION_GUIDELINES.md │
│  ├─ Classify message               │
│  ├─ Apply rules                  │
│  ├─ Discover skills               │
│  ├─ Make delegation decision      │
│  └─ Send delegation (if needed)  │
└─────────────────────────────────────────┘
    ↓
[Delegation message]
    ↓
┌─────────────────────────────────────────┐
│      builder                       │
│  ├─ Receive delegation            │
│  ├─ Implement changes            │
│  ├─ Run mandatory skills         │
│  ├─ Run contextual skills        │
│  ├─ Test & verify               │
│  └─ Return completion           │
└─────────────────────────────────────────┘
    ↓
[Completion message]
    ↓
┌─────────────────────────────────────────┐
│      orchestrator                     │
│  ├─ Receive completion           │
│  ├─ Explain changes              │
│  ├─ Ask for questions           │
│  └─ Update state                │
└─────────────────────────────────────────┘
    ↓
Response to User
```

---

## Session State

```
{
  "active_agent": "orchestrator",
  "delegated_agent": null,
  "workflow_state": "idle|delegated|post_builder",
  "conversation_history": [...],
  "last_builder_task": {...},
  "skill_registry": {...}
}
```

**State Lifecycle:**
```
idle → delegated → post_builder → idle
```

---

## Key Principles

| Principle | Agent | Description |
|-----------|--------|-------------|
| **Single Entry Point** | orchestrator | All interactions start here |
| **Always Enforce Guidelines** | orchestrator | Never skip rules |
| **Delegate, Don't Implement** | orchestrator | builder handles implementation |
| **Always Return** | builder | Never stay active |
| **Run Mandatory Skills** | builder | analyze-and-fix-cycle always |
| **Manage State** | orchestrator | Track session state |
| **Handle Errors Gracefully** | Both | Report, don't crash |

---

## File Structure

```
.opencode/
├── multi-agent/
│   ├── multi-agent.md          ← Full documentation
│   ├── multi-agent-quick.md     ← Quick reference
│   ├── architecture.md           ← This file
│   └── testing.md               ← Testing protocol
├── agents/
│   ├── orchestrator.md           ← Root agent spec
│   └── builder.md                ← Sub-agent spec
└── skills/
    ├── analyze-and-fix-cycle/
    │   └── SKILL.md
    ├── flutter-code-scanner/
    │   └── SKILL.md
    └── [other skills]/
        └── SKILL.md
```

---

## Comparison: Before vs After

### Before (No Multi-Agent)

```
User: "Fix the bug"
    ↓
Me: [Directly implements]
    ↓
[May skip guidelines]
[May not run skills]
[May not test]
[May have inconsistent behavior]
```

**Issues:**
- ❌ Workflow violations
- ❌ Inconsistent behavior
- ❌ No skill awareness
- ❌ No state management
- ❌ Manual agent switching (if implemented)

### After (Multi-Agent)

```
User: "Fix the bug"
    ↓
orchestrator: [Classify] → [Clarify] → [Confirm]
    ↓
orchestrator: [Delegate to builder]
    ↓
builder: [Implement] → [Run skills] → [Test] → [Return]
    ↓
orchestrator: [Explain] → [Ask: "Questions?"]
```

**Benefits:**
- ✅ Workflow always enforced
- ✅ Consistent behavior
- ✅ Skill-aware
- ✅ State managed
- ✅ Automatic routing
- ✅ Single entry point

---

**For full details:** See [multi-agent.md](multi-agent.md)
