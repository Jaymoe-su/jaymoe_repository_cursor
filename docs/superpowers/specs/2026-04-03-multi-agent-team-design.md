# Multi-Agent Team Design Spec

**Date:** 2026-04-03
**Author:** Jaymoe + Claude
**Status:** Draft — awaiting user review

---

## Objective

Build a multi-agent system in Claude Code that functions as a complete product ops and engineering team. The system operates like an optimized military staff adapted for software development: it monitors, evaluates, briefs the commander (Jaymoe) with recommendations, executes on approval, and learns from every cycle. It covers the full spectrum of Jaymoe's role — PM work, product ops, stakeholder comms, research synthesis, Linear/Notion management, and software engineering.

## Design Principles

1. **Agents own outcomes, not tasks.** The commander gives intent. The project-lead decomposes. Specialists execute. Nobody gets micromanaged.
2. **Trust is earned, not configured.** Every external write (Linear, Notion, git push) goes through an approval checkpoint. As the system proves reliable, checkpoints can be relaxed.
3. **Handoffs are compact.** Agents communicate through structured handoff objects (what I did, what you need to know, what's unresolved). The project-lead routes only relevant slices to each specialist. No agent sees full context unless it needs to.
4. **Every cycle makes the system smarter.** After each completion, agents write insights to persistent memory. The project-lead maintains team-level memory. Learning happens after delivery, not during — zero overhead on output.
5. **Security and guardrails are platform-level.** Auto mode rules, scoped permissions, and approval checkpoints are structural, not per-agent decisions.
6. **Right model for the right job.** Judgment-heavy agents (project-lead, ops-coordinator, product-manager) run on Opus. Execution agents (engineers, researcher) can run on Sonnet for speed. Plugin agents manage their own model selection.

---

## The Team

### Command

| Agent | Model | Function |
|---|---|---|
| **project-lead** | Opus | Translates commander's intent into tasking. Coordinates the full team. Runs the decision cycle (monitor → evaluate → brief → direct). Maintains team-level memory. Only agent that talks to the commander by default. |

### Operations Core

| Agent | Model | Function |
|---|---|---|
| **product-manager** | Opus | Defines requirements, writes user stories, prioritizes scope, makes trade-off recommendations. Owns "what to build and why." |
| **ops-coordinator** | Opus | Ingests transcripts and feedback. Reads subtext and intent, not just literal text. Parses into actionable items. Presents structured recommendations for approval. Executes writes to Linear and Notion within explicitly scoped boundaries. Two modes: Parse & Recommend, then Execute after approval. |
| **technical-writer** | Sonnet | Drafts docs, changelogs, release notes, status updates, launch coordination materials. Liaison function with Bob (product marketing). Writes in Onebrief's voice — ownership, directness, accuracy. |
| **comms** | Sonnet | External-facing copy — launch announcements, social posts, positioning statements. Different audience and tone than technical-writer. |

### Research & Design

| Agent | Model | Function |
|---|---|---|
| **researcher** | Sonnet | Deep exploration — codebases, problem spaces, competitive analysis, product research. Feeds the monitor/evaluate phases. Can synthesize research into Notion pages on command. |
| **architect** | Opus | Technical design, system structure, interface definitions, pattern selection. Thinks ahead of execution. Identifies risks and constraints before engineers start. |
| **ux-design-engineer** | Opus | (Existing agent, kept as-is) UI/UX design, visual polish, interaction design, usability review. Psychology-informed design principles. |

### Engineering

| Agent | Model | Function |
|---|---|---|
| **frontend-engineer** | Opus | (Evolved from nextjs-frontend-engineer) Builds UI — components, pages, layouts, interactions, styling. Knows jaymoe_repository_cursor and SickassProject conventions. |
| **backend-engineer** | Opus | (Evolved from backend-infra-engineer) Builds server-side — APIs, data models, logic, integrations. Database management, infrastructure, MCP tool integration. |

### Quality (Plugin Agents — used directly as team members)

| Agent | Function |
|---|---|
| **pr-review-toolkit:code-reviewer** | Code quality, style, patterns, best practices |
| **pr-review-toolkit:code-simplifier** | Simplification pass after implementation |
| **pr-review-toolkit:silent-failure-hunter** | Error handling, silent failure detection |
| **pr-review-toolkit:pr-test-analyzer** | Test coverage gap analysis |
| **pr-review-toolkit:type-design-analyzer** | Type design quality review |
| **pr-review-toolkit:comment-analyzer** | Comment accuracy and maintainability |

---

## Decision Cycle

Every task flows through four phases:

### Monitor
Researcher and ops-coordinator process inputs (transcripts, feedback, codebase state, project status). These inputs are manually fed by the commander due to work environment constraints (Zscaler, no Slack integration).

### Evaluate
Project-lead synthesizes monitoring data. Identifies what needs attention, what's on track, what needs a decision.

### Decide
Project-lead briefs the commander with:
- What's happening (situation)
- What I recommend (recommendation)
- Why (brief rationale — enough context for the commander to make an informed call without deep domain expertise)
- What you'd be trading off (alternatives considered)

Commander approves, modifies, or rejects.

### Direct
Project-lead translates the decision into tasking and delegates to appropriate agents. Engineering work flows: architect → engineers → plugin QA agents. Ops work flows: ops-coordinator → technical-writer. Launch work flows: comms with technical-writer coordinating with Bob.

---

## Inter-Agent Communication

### Handoff Protocol

Every agent produces a structured handoff when completing work:

```
HANDOFF:
  completed: [one sentence — what was delivered]
  next_agent_context: [only facts that affect the next agent's work]
  unresolved: [open questions, risks, unvalidated assumptions]
```

The project-lead is the router. It reads each handoff, extracts the relevant slice, and passes only that slice to the next agent. No agent receives full project context unless its task requires it.

### Context Efficiency Rules

- Handoff fields are capped at 1-2 sentences each
- Project-lead is the only agent that holds the full picture
- Specialists receive only their slice of context
- Persistent memory stores learnings so they don't need re-derivation each cycle
- Background context (project conventions, tech stack, user preferences) lives in agent memory and CLAUDE.md, not in handoffs

---

## Ops-Coordinator: Detailed Design

The ops-coordinator is the highest-risk agent on the team because it writes to external systems. Its design reflects that.

### Mode 1: Parse & Recommend

**Input:** Manually pasted transcript, Reforge MCP feedback notes, or product research question.

**Processing:**
- Reads for intent, not just literal content
- Detects sarcasm, frustration, hedging, passive disagreement, dropped threads
- Translates subtext into explicit actionable items
- Flags ambiguous items rather than guessing

**Output:** A structured list of recommended actions, each with:
- What to do (specific Linear update, Notion page creation, etc.)
- Why (what in the transcript drove this recommendation)
- Where (exact Linear project/issue or Notion page — must be explicitly scoped)
- Confidence level (high/medium/low — low means "I'm reading between lines here, verify my interpretation")

**Gate:** Commander reviews and approves/modifies/rejects each item individually.

### Mode 2: Execute

Only runs after commander approval. Writes to the specific Linear issues and Notion pages that were approved. Produces a completion report: what was updated, links to the changes, anything that couldn't be completed and why.

### Guardrails

- Never writes to Linear or Notion without prior approval in Mode 1
- Scoped to specific projects/issues/pages per invocation — no standing permissions
- Cannot create new Linear projects or Notion workspaces — only updates within existing ones
- All writes are logged in the handoff so project-lead has an audit trail

---

## Learning Loop

### Per-Agent Learning (after every task completion)

Each agent answers three questions and writes to its persistent memory:
1. **What happened** — task and deliverable summary
2. **What was surprising** — anything that didn't match expectations
3. **What to remember** — patterns, preferences, gotchas for next time

Written as concise, actionable insights — not logs. Only saved if genuinely useful for future cycles.

### Team-Level Learning (maintained by project-lead)

Project-lead maintains cross-agent observations:
- Coordination patterns: "architect's designs tend to underestimate frontend complexity"
- Process improvements: "always include speaker names when feeding transcripts to ops-coordinator"
- Commander preferences: "prefers client-side filtering over API changes for dashboard features"

### How Learning Compounds Without Burning Context

- Learning writes happen after delivery, not during — zero impact on output quality
- Persistent memory is loaded into agent system prompts automatically
- Each agent starts every session with accumulated wisdom from all prior cycles
- Project-lead includes relevant lessons in handoffs to specialists: "Last time we built a filter component, the empty state was missed — flag to frontend-engineer upfront"
- Memory is pruned when insights become outdated or are superseded

---

## Existing Agent Disposition

| Current Agent | Action | New Identity |
|---|---|---|
| research-project-planner | Evolve | project-lead |
| nextjs-frontend-engineer | Rename + tweak | frontend-engineer |
| backend-infra-engineer | Rename + tweak | backend-engineer |
| ux-design-engineer | Keep as-is | ux-design-engineer |
| code-review-bug-fixer | Retire | Replaced by plugin agents |

### What "Evolve" Means for project-lead

The research-project-planner already does intake, clarification, research, planning, delegation, and has a learning loop. To become the project-lead, it needs:
- Decision cycle framework (monitor/evaluate/brief/direct)
- Team roster awareness (knows every agent and when to call each)
- Handoff routing logic (extract relevant slices for each specialist)
- Team-level memory (cross-agent observations)
- Briefing standard ("here's why" alongside every recommendation)
- Model selection awareness (route to Opus vs Sonnet based on task complexity)

### What "Rename + tweak" Means for Engineers

- Rename to match team naming convention
- Add handoff protocol to output standards
- Add "here's why" briefing standard for decisions
- Remove redundant context that now lives in CLAUDE.md or project-lead's routing

---

## Auto Mode Configuration

The team runs under `--permission-mode auto` with worktree isolation for engineering tasks.

### Side Projects (jaymoe_repository_cursor, SickassProject)
- Full auto mode — minimal interruptions for local operations
- Soft deny on: internet downloads, package installs not in manifest, git push
- Worktrees for every engineering session (rewind capability)

### Onebrief Work (~/Projects/bc)
- Default permission mode — more conservative
- Ops-coordinator has its own approval gate regardless of auto mode setting

### Universal Rules
- Reads are always allowed
- Writes within project scope are allowed
- Writes to external systems (Linear, Notion, git remote) require approval
- No downloading and executing code from the internet without approval

---

## First Project: Build the Team Itself

The multi-agent team's first task is to build its own agent definitions. This serves as both the initial deliverable and a validation that the system works.

### Execution Sequence

1. **project-lead** is built first (evolved from research-project-planner) — it coordinates everything else
2. **product-manager** is built second — it defines requirements for remaining agents
3. **architect** is built third — it designs the handoff protocol and memory structure
4. **ops-coordinator** is built fourth — highest complexity, needs the most tuning
5. **technical-writer** and **comms** are built fifth — lower complexity, can be parallelized
6. **frontend-engineer** and **backend-engineer** are evolved from existing agents sixth
7. Plugin agents are validated as team members seventh — no build needed, just integration testing
8. End-to-end test: run a real task through the full decision cycle

### Success Criteria

- All custom agents have well-tuned prompts with clear mandates, handoff protocols, and learning loops
- Project-lead can decompose a task and route to the correct agents
- Ops-coordinator can parse a transcript, recommend actions, and execute after approval
- Handoffs are compact and carry only essential context
- At least one full decision cycle completes successfully on a real task
- Learning loop produces at least one useful insight per agent after the first cycle

---

## File Structure

All custom agent definitions live in `~/.claude/agents/` as markdown files:

```
~/.claude/agents/
  project-lead.md          # Evolved from research-project-planner.md
  product-manager.md       # New
  ops-coordinator.md       # New
  architect.md             # New
  technical-writer.md      # New
  comms.md                 # New
  frontend-engineer.md     # Renamed from nextjs-frontend-engineer.md
  backend-engineer.md      # Renamed from backend-infra-engineer.md
  ux-design-engineer.md    # Unchanged
```

Retired agents:
- `research-project-planner.md` — replaced by project-lead.md
- `code-review-bug-fixer.md` — replaced by plugin agents
- `nextjs-frontend-engineer.md` — replaced by frontend-engineer.md
- `backend-infra-engineer.md` — replaced by backend-engineer.md

Agent memory directories follow the same naming convention under `~/.claude/agent-memory/`.

---

## Open Questions

1. **Reforge MCP integration** — needs testing to confirm what data is accessible and in what format
2. **Linear MCP** — verify current plugin capabilities and scoping options
3. **Notion MCP** — verify write access and page targeting
4. **Comms agent scope** — may be too thin for a standalone agent; could merge with technical-writer if the workload doesn't justify separation
5. **Model cost** — running 5 agents on Opus gets expensive; monitor usage and adjust model assignments based on actual quality requirements
