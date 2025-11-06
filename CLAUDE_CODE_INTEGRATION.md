# Claude Code Integration for OpenCode

This document provides a comprehensive guide to using Claude Code plugins, agents, skills, and commands within OpenCode.

## Overview

The Claude Code Integration Plugin bridges the gap between Claude Code and OpenCode, allowing you to use Claude Code's powerful features within OpenCode's environment. This integration provides:

- **Seamless Command Translation**: Use Claude Code slash commands as OpenCode commands
- **Agent Integration**: Access specialized Claude Code agents as OpenCode agents
- **Skills as Tools**: Execute Claude Code skills through OpenCode's tool system
- **Configuration Compatibility**: Maintain both `.claude/` and `.opencode/` directories

## Installation

The integration is already set up in this repository:

```
.opencode/
├── plugin/
│   └── claude-code-integration.ts    # The integration plugin
└── opencode.jsonc                     # Configuration file

.claude/
├── commands/                          # Claude Code commands
├── agents/                            # Claude Code agents
├── skills/                            # Claude Code skills
└── README.md                          # Detailed documentation
```

## Quick Start

### 1. Verify Installation

```bash
# Start OpenCode
opencode tui

# Check that the plugin loaded successfully
# You should see: "🔌 Initializing Claude Code Integration Plugin..."
```

### 2. List Available Commands

```bash
# In OpenCode TUI, press Ctrl+P to see commands
# All Claude Code commands will be prefixed with "claude_"
```

### 3. Try a Command

```bash
# Example: Explain code
/claude_explain-code src/index.ts

# Example: Review code
/claude_review-pr 123
```

### 4. Switch to a Claude Code Agent

```bash
# In TUI: Press <leader>a (default: Ctrl+X then A)
# Select one of the Claude Code agents:
# - claude_code-reviewer
# - claude_test-specialist
# - claude_architecture-advisor
# - claude_security-auditor
```

## Available Features

### Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/claude_review-pr` | Review a pull request | `/claude_review-pr 123` |
| `/claude_refactor` | Suggest refactoring | `/claude_refactor src/auth` |
| `/claude_explain-code` | Explain code | `/claude_explain-code src/index.ts` |
| `/claude_debug` | Debug an issue | `/claude_debug "API error"` |
| `/claude_optimize` | Optimize performance | `/claude_optimize src/queries` |

### Agents

| Agent | Specialization | Mode |
|-------|---------------|------|
| `claude_code-reviewer` | Code review, security, quality | Subagent |
| `claude_test-specialist` | Testing, TDD, test coverage | Subagent |
| `claude_architecture-advisor` | System design, architecture | Subagent |
| `claude_security-auditor` | Security, vulnerabilities | Subagent |
| `claude_general` | Research, code exploration | Subagent |
| `claude_explore` | Fast codebase navigation | Subagent |

### Skills (Tools)

| Skill | Description | Auto-invoked by Agents |
|-------|-------------|------------------------|
| `claude_skill_analyze-dependencies` | Analyze package.json | Yes |
| `claude_skill_code-metrics` | Calculate LOC, complexity | Yes |
| `claude_skill_git-insights` | Git history analysis | Yes |
| `claude_list_commands` | List all commands | Yes |
| `claude_list_agents` | List all agents | Yes |
| `claude_list_skills` | List all skills | Yes |

## Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                         OpenCode                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Claude Code Integration Plugin                      │   │
│  │  ┌──────────────┬───────────────┬─────────────────┐ │   │
│  │  │   Commands   │    Agents     │     Skills      │ │   │
│  │  │   Loader     │    Loader     │     Loader      │ │   │
│  │  └──────┬───────┴───────┬───────┴────────┬────────┘ │   │
│  │         │               │                │          │   │
│  │         ▼               ▼                ▼          │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │          Configuration Merger                │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐   │
│  │         OpenCode Core (Commands, Agents, Tools)     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

External Claude Code Configurations:
.claude/commands/*.md  ──┐
.claude/agents/*.md    ──┼──► Discovered & Converted
.claude/skills/*.ts    ──┘
```

### File Organization

```
Project Root
├── .opencode/
│   ├── plugin/
│   │   └── claude-code-integration.ts    # Plugin implementation
│   └── opencode.jsonc                     # OpenCode configuration
│
├── .claude/                                # Claude Code configurations
│   ├── commands/                          # Slash commands
│   │   ├── review-pr.md
│   │   ├── refactor.md
│   │   ├── explain-code.md
│   │   ├── debug.md
│   │   └── optimize.md
│   │
│   ├── agents/                            # Specialized agents
│   │   ├── code-reviewer.md
│   │   ├── test-specialist.md
│   │   ├── architecture-advisor.md
│   │   └── security-auditor.md
│   │
│   ├── skills/                            # Executable skills
│   │   ├── analyze-dependencies.ts
│   │   ├── code-metrics.ts
│   │   └── git-insights.ts
│   │
│   └── README.md                          # Claude Code docs
│
└── CLAUDE_CODE_INTEGRATION.md             # This file
```

## Use Cases

### Use Case 1: Code Review Workflow

**Scenario**: You want to review a pull request thoroughly.

```bash
# Step 1: Initial review
/claude_review-pr 456

# Step 2: Security audit
# Switch to claude_security-auditor agent (Ctrl+X, A)
# Then ask: "Perform a security audit on PR #456"

# Step 3: Test coverage check
# Switch to claude_test-specialist agent
# Then ask: "Check test coverage for the changes in PR #456"

# Step 4: Architecture review (if needed)
# Switch to claude_architecture-advisor agent
# Then ask: "Review the architectural impact of PR #456"
```

### Use Case 2: Debugging Complex Issue

**Scenario**: Production bug that's hard to reproduce.

```bash
# Step 1: Start with debug command
/claude_debug "Users getting 500 error on checkout"

# Step 2: Analyze recent changes
# Use git-insights skill
opencode run "use claude_skill_git-insights for the last 7 days"

# Step 3: Check for hotspots
# Agent will automatically suggest checking frequently changed files

# Step 4: Code review of suspect areas
/claude_review-pr <recent-pr>
```

### Use Case 3: Refactoring Large Module

**Scenario**: Need to refactor authentication module.

```bash
# Step 1: Get code metrics
opencode run "use claude_skill_code-metrics on auth module"

# Step 2: Get refactoring suggestions
/claude_refactor "auth module"

# Step 3: Architecture review
# Switch to claude_architecture-advisor
# Ask: "Review the auth module architecture and suggest improvements"

# Step 4: Test strategy
# Switch to claude_test-specialist
# Ask: "Create a test strategy for refactoring the auth module"
```

### Use Case 4: Performance Optimization

**Scenario**: API response times are slow.

```bash
# Step 1: Optimize command
/claude_optimize "API response handlers"

# Step 2: Code metrics baseline
opencode run "use claude_skill_code-metrics"

# Step 3: Git insights to find changes
opencode run "use claude_skill_git-insights for 30 days"

# Step 4: Implementation
# Agent will suggest specific optimizations
# Make changes with OpenCode's edit tools
```

## Creating Custom Extensions

### Custom Command

Create `.claude/commands/my-command.md`:

```markdown
---
description: What this command does
agent: build
---

Command template here.

Use ${args} for arguments.
```

### Custom Agent

Create `.claude/agents/my-agent.md`:

```markdown
---
description: When to use this agent
mode: subagent
tools:
  read: true
  write: true
  bash: true
---

System prompt defining agent behavior.
```

### Custom Skill

Create `.claude/skills/my-skill.ts`:

```typescript
async function mySkill(
  args: { param: string },
  context: { sessionID: string; agent: string }
): Promise<string> {
  // Implementation
  return "Result"
}

mySkill.description = "What this skill does"
export default mySkill
```

## Configuration Reference

### Plugin Configuration (`.opencode/opencode.jsonc`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  // Plugins to load
  "plugin": [
    "file:///path/to/.opencode/plugin/claude-code-integration.ts"
  ],

  // Agent configurations (auto-populated by plugin)
  "agent": {
    "claude_code-reviewer": { /* ... */ }
  },

  // Command configurations (auto-populated by plugin)
  "command": {
    "claude_review-pr": { /* ... */ }
  },

  // Tool permissions
  "tools": {
    "claude_skill_git-insights": true
  },

  // Permissions
  "permission": {
    "edit": "allow",
    "bash": { "*": "allow" },
    "webfetch": "allow"
  }
}
```

### Command Frontmatter

```yaml
---
description: Command description (required)
agent: agent-name (optional, default: build)
model: model-id (optional, inherits from agent)
subtask: false (optional, default: false)
---
```

### Agent Frontmatter

```yaml
---
description: Agent description (required)
mode: subagent | primary | all (required)
model: model-id (optional)
temperature: 0.7 (optional)
top_p: 0.95 (optional)
tools:
  read: true
  write: false
  edit: false
  bash: true
  grep: true
  glob: true
permission:
  edit: allow | deny | ask
  bash:
    "*": allow
  webfetch: allow
---
```

## Troubleshooting

### Issue: Plugin Not Loading

**Symptoms**: Commands and agents don't appear.

**Solutions**:
1. Check plugin path in `.opencode/opencode.jsonc`
2. Verify TypeScript syntax: `bun check .opencode/plugin/claude-code-integration.ts`
3. Check logs: `opencode tui --debug`
4. Ensure file permissions are correct

### Issue: Commands Not Found

**Symptoms**: `/claude_command` returns "Command not found".

**Solutions**:
1. Verify markdown files exist in `.claude/commands/`
2. Check YAML frontmatter syntax
3. Ensure filenames use lowercase and hyphens
4. Restart OpenCode: `Ctrl+X, Q` then restart

### Issue: Skills Not Executing

**Symptoms**: Skills fail or return errors.

**Solutions**:
1. Check TypeScript/JavaScript syntax
2. Verify default export exists
3. Ensure `.description` property is set
4. Install required dependencies: `cd .claude && npm install`

### Issue: Agent Not Available

**Symptoms**: Agent doesn't appear in agent list.

**Solutions**:
1. Verify file is in `.claude/agents/`
2. Check YAML frontmatter has required fields
3. Ensure `mode` is valid (subagent/primary/all)
4. Check agent naming (no special characters)

## Performance Considerations

### Lazy Loading

The plugin uses lazy loading for skills:
- Skills are only loaded when first used
- Reduces startup time
- Improves memory efficiency

### Caching

The plugin caches discovered configurations:
- Configurations are scanned on startup
- Changes require OpenCode restart
- Use `opencode tui` to reload

### Best Practices

1. **Keep Skills Lightweight**: Skills should complete quickly
2. **Use Appropriate Agents**: Match agent expertise to task
3. **Command Composition**: Break complex tasks into multiple commands
4. **Resource Management**: Skills should clean up resources

## Integration with External Tools

### Git Hooks

You can trigger Claude Code commands from git hooks:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run code review on staged files
opencode run "/claude_review-pr HEAD"
```

### CI/CD Integration

```yaml
# .github/workflows/review.yml
name: AI Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: opencode run "/claude_review-pr ${{ github.event.pull_request.number }}"
```

### Editor Integration

You can invoke commands from your editor:

**VSCode** (tasks.json):
```json
{
  "label": "Claude Review",
  "type": "shell",
  "command": "opencode run '/claude_review-pr ${input:pr}'"
}
```

## API Reference

### Plugin Interface

```typescript
interface PluginInput {
  client: OpencodeClient        // OpenCode API client
  project: Project              // Project information
  directory: string             // Project directory
  worktree: string             // Git worktree root
  $: BunShell                  // Shell executor
}

interface Hooks {
  tool?: Record<string, ToolDefinition>
  config?: (input: Config) => Promise<void>
  event?: (input: { event: Event }) => Promise<void>
  // ... other hooks
}
```

### Tool Definition

```typescript
tool({
  description: string,
  args: {
    [key: string]: ZodType
  },
  async execute(args, context): Promise<string> {
    // Implementation
  }
})
```

## Advanced Topics

### Multi-Agent Workflows

Chain multiple agents for complex tasks:

```typescript
// In a custom command
1. claude_general: Research the codebase
2. claude_architecture-advisor: Design solution
3. claude_test-specialist: Plan tests
4. build: Implement changes
```

### Skill Composition

Skills can call other skills:

```typescript
async function complexSkill(args, context) {
  const metrics = await codeMetrics({}, context)
  const insights = await gitInsights({}, context)

  return combineResults(metrics, insights)
}
```

### Dynamic Agent Generation

The plugin supports dynamic agent configuration:

```typescript
// Generated agents based on project structure
config.agent[`claude_${language}-specialist`] = {
  description: `${language} expert`,
  // ...
}
```

## Resources

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [OpenCode Documentation](https://opencode.ai/docs)
- [Plugin Development Guide](https://opencode.ai/docs/plugins)
- [Agent Configuration](https://opencode.ai/docs/agents)
- [Command Reference](https://opencode.ai/docs/commands)
- [Tool Development](https://opencode.ai/docs/tools)

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [`.claude/README.md`](.claude/README.md)
3. Open an issue on GitHub
4. Check OpenCode Discord community

## License

This integration is part of the OpenCode project and follows the same license.

---

**Version**: 1.0.0
**Last Updated**: 2025-11-06
**Maintainer**: OpenCode Team
