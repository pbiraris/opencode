# Adding Your Own Claude Code Plugins

The Claude Code integration **automatically discovers** all commands, agents, and skills in its directories. Just add your files and restart OpenCode!

## Quick Start

### ✅ What You Need to Do

1. **Add your file** to the appropriate directory
2. **Restart OpenCode** to load it
3. That's it! No code changes needed.

### ❌ What You DON'T Need to Do

- ❌ No need to modify `index.ts`
- ❌ No need to register files anywhere
- ❌ No need to update any configuration
- ❌ No need to rebuild or compile

## Dynamic Discovery

The plugin automatically scans these directories:

```
.opencode/plugin/claude-code/
├── commands/     # Scans for *.md files
├── agents/       # Scans for *.md files
└── skills/       # Scans for *.ts and *.js files
```

## Adding a New Command

### 1. Create Your Command File

```bash
# Create new command
touch .opencode/plugin/claude-code/commands/my-feature.md
```

### 2. Write Your Command

```markdown
---
description: Describe what your command does
agent: build
---

Your command template here.

You can use ${args} to pass arguments.

Example instructions for what the agent should do.
```

### 3. Restart OpenCode

```bash
# Exit OpenCode (Ctrl+X, Q)
# Start again
opencode tui
```

### 4. Use Your Command

```bash
# In OpenCode TUI:
/claude_my-feature argument here
```

**Example**: Let's add a "generate tests" command:

```bash
cat > .opencode/plugin/claude-code/commands/generate-tests.md << 'EOF'
---
description: Generate comprehensive tests for a file
agent: claude_test-specialist
---

Generate comprehensive tests for ${args}.

Include:
1. Unit tests covering all functions
2. Edge case tests
3. Integration tests if applicable
4. Mocking examples for dependencies
5. Clear test descriptions

Follow the project's existing test patterns and structure.
EOF

# Restart OpenCode
# Now available as: /claude_generate-tests src/myfile.ts
```

## Adding a New Agent

### 1. Create Your Agent File

```bash
touch .opencode/plugin/claude-code/agents/my-specialist.md
```

### 2. Write Your Agent

```markdown
---
description: When to use this agent (shown in agent list)
mode: subagent
tools:
  read: true
  write: false
  grep: true
  glob: true
  bash: false
---

You are a specialist in [your domain].

## Your Expertise
- [Skill 1]
- [Skill 2]
- [Skill 3]

## Your Approach
When asked to [do something]:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Always provide clear, actionable recommendations.
```

### 3. Restart OpenCode

### 4. Use Your Agent

```bash
# In TUI: Press Ctrl+X, then A
# Select: claude_my-specialist
```

**Example**: Let's add a "database expert" agent:

```bash
cat > .opencode/plugin/claude-code/agents/database-expert.md << 'EOF'
---
description: Database design and SQL optimization expert
mode: subagent
tools:
  read: true
  grep: true
  glob: true
  bash: true
  edit: false
  write: false
---

You are a database expert specializing in:

## Expertise Areas
- Database schema design and normalization
- SQL query optimization
- Index strategy and performance tuning
- Migration planning and execution
- Data modeling best practices

## Analysis Approach
When reviewing database code:
1. **Schema Review**: Check normalization, relationships, constraints
2. **Query Analysis**: Identify slow queries, missing indexes
3. **Performance**: Suggest optimizations and caching strategies
4. **Security**: Check for SQL injection vulnerabilities
5. **Scalability**: Recommend improvements for scale

Provide specific, actionable recommendations with examples.
EOF

# Restart OpenCode
# Now available as: claude_database-expert
```

## Adding a New Skill

### 1. Create Your Skill File

```bash
touch .opencode/plugin/claude-code/skills/my-skill.ts
```

### 2. Write Your Skill

```typescript
/**
 * Description of what your skill does
 */

async function mySkill(
  args: {
    // Your parameters
    param1: string
    param2?: number
  },
  context: {
    sessionID: string
    messageID: string
    agent: string
    abort: AbortSignal
  }
): Promise<string> {
  // Your implementation
  const result = `Processing: ${args.param1}`

  return result
}

// REQUIRED: Skill description
mySkill.description = "What this skill does"

// REQUIRED: Export as default
export default mySkill
```

### 3. Restart OpenCode

### 4. Use Your Skill

Agents will automatically invoke your skill when needed, or you can call it:

```bash
opencode run "use claude_skill_my-skill"
```

**Example**: Let's add a "check dependencies" skill:

```bash
cat > .opencode/plugin/claude-code/skills/check-updates.ts << 'EOF'
/**
 * Check for outdated npm packages
 */

import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function checkUpdates(
  args: { directory?: string },
  context: { sessionID: string; agent: string }
): Promise<string> {
  const dir = args.directory || process.cwd()

  try {
    const { stdout } = await execAsync("npm outdated --json", { cwd: dir })

    if (!stdout) {
      return "✅ All packages are up to date!"
    }

    const outdated = JSON.parse(stdout)
    let report = "# Outdated Packages\n\n"

    for (const [pkg, info] of Object.entries(outdated)) {
      const data = info as any
      report += `- **${pkg}**: ${data.current} → ${data.latest}\n`
    }

    return report
  } catch (error) {
    return `Error checking updates: ${error instanceof Error ? error.message : String(error)}`
  }
}

checkUpdates.description = "Check for outdated npm packages"

export default checkUpdates
EOF

# Restart OpenCode
# Now available as: claude_skill_check-updates
```

## Testing Your Additions

### Test a Command

```bash
opencode tui
# Type: /claude_your-command test-argument
```

### Test an Agent

```bash
opencode tui
# Press: Ctrl+X, then A
# Select: claude_your-agent
# Ask: "help me with something"
```

### Test a Skill

```bash
opencode run "use claude_skill_your-skill with some params"
```

## Verification

After restarting, check that your additions loaded:

```bash
# Start OpenCode
opencode tui

# Check console output for:
# 📋 Found X commands, Y skills, Z agents

# List commands
# Press: Ctrl+P
# Look for: /claude_your-command

# List agents
# Press: Ctrl+X, then A
# Look for: claude_your-agent

# List skills
opencode run "list all claude skills"
```

## File Naming Rules

### Commands
- **Format**: `command-name.md` (lowercase, hyphen-separated)
- **Available as**: `/claude_command-name`
- **Example**: `generate-docs.md` → `/claude_generate-docs`

### Agents
- **Format**: `agent-name.md` (lowercase, hyphen-separated)
- **Available as**: `claude_agent-name`
- **Example**: `api-expert.md` → `claude_api-expert`

### Skills
- **Format**: `skill-name.ts` (lowercase, hyphen-separated)
- **Available as**: `claude_skill_skill-name`
- **Example**: `run-tests.ts` → `claude_skill_run-tests`

## Common Patterns

### Command with Multiple Steps

```markdown
---
description: Complete workflow command
agent: build
---

Execute the following workflow for ${args}:

## Step 1: Analysis
- Analyze the current state
- Identify requirements

## Step 2: Implementation
- Make necessary changes
- Follow best practices

## Step 3: Verification
- Run tests
- Check for issues

## Step 4: Documentation
- Update relevant docs
- Add comments
```

### Agent with Tool Restrictions

```markdown
---
description: Read-only analysis agent
mode: subagent
tools:
  read: true
  grep: true
  glob: true
  bash: false  # No bash commands
  edit: false  # No file edits
  write: false # No file creation
---

You are a read-only code analyst...
```

### Skill with Dependencies

```typescript
/**
 * Skill that uses external libraries
 */

// Install dependencies in the plugin directory:
// cd .opencode/plugin/claude-code
// npm install axios

import axios from "axios"

async function fetchData(
  args: { url: string },
  context: any
): Promise<string> {
  try {
    const response = await axios.get(args.url)
    return JSON.stringify(response.data, null, 2)
  } catch (error) {
    return `Error: ${error}`
  }
}

fetchData.description = "Fetch data from a URL"

export default fetchData
```

## Installing Skill Dependencies

If your skills need npm packages:

```bash
# Navigate to plugin directory
cd .opencode/plugin/claude-code

# Initialize package.json (if not exists)
npm init -y

# Install dependencies
npm install axios cheerio date-fns

# Your skills can now import these packages
```

## Troubleshooting

### Command Not Found

1. Check file is in `commands/` directory
2. Check file extension is `.md`
3. Verify YAML frontmatter is valid
4. Restart OpenCode

### Agent Not Listed

1. Check file is in `agents/` directory
2. Check file extension is `.md`
3. Verify `mode` is set (subagent/primary/all)
4. Restart OpenCode

### Skill Not Working

1. Check file is in `skills/` directory
2. Check file extension is `.ts` or `.js`
3. Verify default export exists
4. Verify `.description` property is set
5. Check for TypeScript errors: `bun check .opencode/plugin/claude-code/skills/your-skill.ts`
6. Restart OpenCode

### Still Not Working?

Check OpenCode logs:

```bash
opencode tui --debug

# Look for:
# - "🔌 Initializing Claude Code Integration Plugin..."
# - "📋 Found X commands, Y skills, Z agents"
# - Any error messages
```

## Examples Repository

Check the existing files for examples:

- **Commands**: `.opencode/plugin/claude-code/commands/`
  - `review-pr.md` - Complex command with multiple steps
  - `debug.md` - Systematic debugging approach
  - `optimize.md` - Performance optimization workflow

- **Agents**: `.opencode/plugin/claude-code/agents/`
  - `code-reviewer.md` - Comprehensive agent with multiple capabilities
  - `security-auditor.md` - Specialized security agent
  - `test-specialist.md` - Testing expert agent

- **Skills**: `.opencode/plugin/claude-code/skills/`
  - `code-metrics.ts` - File system operations
  - `git-insights.ts` - Shell command execution
  - `analyze-dependencies.ts` - JSON parsing and analysis

## Summary

✅ **Dynamic Discovery**: Just add files and restart
✅ **No Code Changes**: Plugin automatically finds new files
✅ **No Registration**: No need to update any lists
✅ **Instant Availability**: Available immediately after restart

**Workflow**:
1. Add your `.md` or `.ts` file
2. Restart OpenCode
3. Use your command/agent/skill!

That's it! 🚀
