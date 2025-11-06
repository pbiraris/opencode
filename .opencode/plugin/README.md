# Claude Code Integration for OpenCode

This directory contains the integration layer between Claude Code and OpenCode, enabling seamless use of Claude Code's agents, skills, and commands within the OpenCode environment.

## Overview

The Claude Code Integration Plugin automatically discovers and converts Claude Code configurations into OpenCode-compatible formats, allowing you to use both systems together.

### Features

- ✅ **Commands**: Convert Claude Code slash commands to OpenCode commands
- ✅ **Agents**: Use specialized Claude Code agents within OpenCode
- ✅ **Skills**: Execute Claude Code skills as OpenCode tools
- ✅ **Compatibility**: Maintain compatibility with both ecosystems

## Directory Structure

```
.opencode/plugin/
├── claude-code-integration.ts  # Main plugin file
├── commands/          # Slash commands (converted to OpenCode commands)
│   ├── review-pr.md
│   ├── refactor.md
│   ├── explain-code.md
│   ├── debug.md
│   └── optimize.md
├── agents/           # Specialized AI agents (converted to OpenCode agents)
│   ├── code-reviewer.md
│   ├── test-specialist.md
│   ├── architecture-advisor.md
│   └── security-auditor.md
├── skills/           # Reusable capabilities (converted to OpenCode tools)
│   ├── analyze-dependencies.ts
│   ├── code-metrics.ts
│   └── git-insights.ts
└── README.md         # This file
```

## Usage

### Commands

Commands are slash commands that execute specific tasks. They're defined as markdown files with YAML frontmatter.

**Available Commands:**

- `/claude_review-pr <PR-number>` - Review a pull request
- `/claude_refactor <target>` - Suggest refactoring improvements
- `/claude_explain-code <path>` - Explain how code works
- `/claude_debug <issue>` - Debug an issue systematically
- `/claude_optimize <target>` - Optimize code for performance

**Example Usage:**
```bash
# In OpenCode TUI
/claude_review-pr 123
/claude_explain-code src/index.ts
/claude_debug "API returns 500 error"
```

### Agents

Agents are specialized AI assistants with specific expertise. They're defined as markdown files with custom system prompts.

**Available Agents:**

- `claude_code-reviewer` - Code review specialist
- `claude_test-specialist` - Testing expert
- `claude_architecture-advisor` - System architecture consultant
- `claude_security-auditor` - Security vulnerability analyst

**Example Usage:**
```bash
# List available agents
opencode agent list

# Switch to a specific agent
# In TUI: Use <leader>a to list agents, then select
```

### Skills

Skills are executable TypeScript/JavaScript functions that provide specific capabilities.

**Available Skills:**

- `claude_skill_analyze-dependencies` - Analyze project dependencies
- `claude_skill_code-metrics` - Calculate code metrics
- `claude_skill_git-insights` - Git repository analysis

**Using Skills:**

Skills are automatically registered as OpenCode tools and can be invoked by agents:

```typescript
// Agents can use skills in their responses
// For example, the agent might use:
use claude_skill_code-metrics to analyze the codebase
```

**List Skills:**
```bash
# Use the discovery tool
opencode run "list all claude skills"
```

## Creating Your Own

### Creating a Command

Create a markdown file in `.opencode/plugin/commands/`:

```markdown
---
description: Brief description of what this command does
agent: build  # Optional: which agent to use
---

Your command template here.

You can use ${args} to reference command arguments.
```

### Creating an Agent

Create a markdown file in `.opencode/plugin/agents/`:

```markdown
---
description: When to use this agent
mode: subagent  # or "primary" for top-level agents
tools:
  read: true
  write: false
  bash: true
---

Your agent's system prompt here.

Define the agent's:
- Expertise areas
- Methodology
- Output format
- Best practices
```

### Creating a Skill

Create a TypeScript file in `.opencode/plugin/skills/`:

```typescript
/**
 * Skill Description
 */

async function mySkill(
  args: { /* your parameters */ },
  context: { sessionID: string; agent: string }
): Promise<string> {
  // Your skill implementation
  return "Skill result"
}

// Required: Skill description
mySkill.description = "What this skill does"

export default mySkill
```

## Configuration

The plugin is loaded via `.opencode/plugin/claude-code-integration.ts`.

To enable/disable the plugin, edit `.opencode/opencode.jsonc`:

```jsonc
{
  "plugin": [
    "file:///absolute/path/to/.opencode/plugin/claude-code-integration.ts"
  ]
}
```

## Integration Details

### Command Conversion

Claude Code commands (`.opencode/plugin/commands/*.md`) are automatically converted to OpenCode commands with the prefix `claude_`:

- `.opencode/plugin/commands/review-pr.md` → `/claude_review-pr`

### Agent Conversion

Claude Code agents (`.opencode/plugin/agents/*.md`) are converted to OpenCode agents with the prefix `claude_`:

- `.opencode/plugin/agents/code-reviewer.md` → `claude_code-reviewer` agent

### Skill Conversion

Claude Code skills (`.opencode/plugin/skills/*.ts`) are converted to OpenCode tools with the prefix `claude_skill_`:

- `.opencode/plugin/skills/git-insights.ts` → `claude_skill_git-insights` tool

## Built-in Skills (Placeholders)

The plugin includes placeholder implementations for common Claude Code skills:

- `pdf` - PDF processing (requires pdf-parse library)
- `xlsx` - Excel file handling (requires xlsx library)
- `image` - Image analysis (requires sharp library)

To fully implement these, install the required dependencies:

```bash
cd .opencode/plugin
npm install pdf-parse xlsx sharp
```

## Troubleshooting

### Plugin Not Loading

1. Check that the plugin path is correct in `.opencode/opencode.jsonc`
2. Ensure the plugin file has no syntax errors: `bun check .opencode/plugin/claude-code-integration.ts`
3. Check OpenCode logs for error messages

### Commands Not Appearing

1. Ensure command files are in `.opencode/plugin/commands/`
2. Verify YAML frontmatter is valid
3. Restart OpenCode to reload configuration

### Skills Not Working

1. Check TypeScript syntax in skill files
2. Ensure skills export a default function
3. Add `.description` property to the function
4. Install any required npm packages in `.opencode/plugin/`

### Agent Not Available

1. Verify agent markdown file is in `.opencode/plugin/agents/`
2. Check YAML frontmatter for required fields
3. Ensure `mode` is set to "subagent" or "primary"

## Advanced Configuration

### Custom Skill Parameters

Skills can accept complex parameters:

```typescript
async function mySkill(
  args: {
    option1: string
    option2?: number
    config?: Record<string, any>
  },
  context: { sessionID: string; agent: string }
): Promise<string> {
  // Implementation
}
```

### Agent Tool Permissions

Control which tools an agent can use:

```yaml
---
tools:
  read: true      # Can read files
  write: false    # Cannot write files
  edit: false     # Cannot edit files
  bash: true      # Can run bash commands
  grep: true      # Can search files
  glob: true      # Can find files
---
```

### Command with Custom Agent

Specify which agent should handle a command:

```yaml
---
description: Review code for security issues
agent: claude_security-auditor
---

Review ${args} for security vulnerabilities.
```

## API Reference

### Plugin Hooks

The integration plugin implements these OpenCode hooks:

- `tool` - Registers Claude Code skills as tools
- `config` - Modifies config to add commands and agents
- `event` - Logs integration status

### Available Tools

All registered tools follow this pattern:

```typescript
tool({
  description: "Tool description",
  args: {
    param: tool.schema.string().describe("Parameter description")
  },
  async execute(args, context) {
    return "Tool result"
  }
})
```

## Examples

### Example 1: Code Review Workflow

```bash
# 1. Review a PR
/claude_review-pr 456

# 2. Run security audit
# Switch to claude_security-auditor agent
# Ask: "Audit the changes in this PR"

# 3. Check test coverage
# Switch to claude_test-specialist agent
# Ask: "Analyze test coverage for the changes"
```

### Example 2: Codebase Analysis

```bash
# 1. Get code metrics
opencode run "use claude_skill_code-metrics to analyze the codebase"

# 2. Analyze dependencies
opencode run "use claude_skill_analyze-dependencies"

# 3. Review git insights
opencode run "use claude_skill_git-insights with last 60 days"
```

### Example 3: Architecture Review

```bash
# 1. Switch to architecture advisor
# Use <leader>a, select claude_architecture-advisor

# 2. Ask for review
"Review the architecture of the authentication system"

# 3. Get specific guidance
/claude_refactor "auth module for better separation of concerns"
```

## Resources

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [OpenCode Documentation](https://opencode.ai/docs)
- [OpenCode Plugin Development](https://opencode.ai/docs/plugins)
- [Creating Custom Agents](https://opencode.ai/docs/agents)
- [Writing Commands](https://opencode.ai/docs/commands)

## Contributing

To add new commands, agents, or skills:

1. Create the file in the appropriate directory
2. Follow the format guidelines above
3. Test with OpenCode
4. Document any new dependencies

## License

This integration layer is provided as part of the OpenCode project.
