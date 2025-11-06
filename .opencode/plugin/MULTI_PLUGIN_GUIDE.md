# Multi-Plugin Guide for OpenCode

This guide explains how to organize and manage multiple plugins in OpenCode.

## Plugin Directory Structure

Each plugin should be self-contained in its own subdirectory:

```
.opencode/plugin/
├── claude-code/              # Claude Code integration
│   ├── index.ts              # Plugin entry point
│   ├── commands/
│   ├── agents/
│   ├── skills/
│   └── README.md
│
├── my-custom-plugin/         # Your custom plugin
│   ├── index.ts
│   ├── config.ts
│   ├── tools/
│   └── README.md
│
└── team-standards/           # Team-specific plugin
    ├── index.ts
    ├── linters/
    └── templates/
```

## Benefits of Plugin Subdirectories

✅ **Isolation**: Each plugin loads only its own files
✅ **No Conflicts**: Plugins can have files with the same names
✅ **Clear Organization**: Easy to see what belongs to which plugin
✅ **Independent Updates**: Update one plugin without affecting others
✅ **Shareable**: Easy to share plugins as self-contained packages

## Configuration

Register multiple plugins in `.opencode/opencode.jsonc`:

```jsonc
{
  "plugin": [
    "file:///absolute/path/.opencode/plugin/claude-code/index.ts",
    "file:///absolute/path/.opencode/plugin/my-custom-plugin/index.ts",
    "file:///absolute/path/.opencode/plugin/team-standards/index.ts"
  ]
}
```

## Creating a New Plugin

### 1. Create Plugin Directory

```bash
mkdir -p .opencode/plugin/my-plugin
cd .opencode/plugin/my-plugin
```

### 2. Create index.ts

```typescript
import { type Plugin, tool } from "@opencode-ai/plugin"
import path from "path"

export const MyPlugin: Plugin = async (ctx) => {
  const { client, project, directory, worktree, $ } = ctx

  console.log("🔌 Loading My Plugin...")

  // 'directory' contains the path to this plugin's folder
  // Use it to load files relative to your plugin
  const configPath = path.join(directory, "config.json")

  return {
    // Define your tools
    tool: {
      my_custom_tool: tool({
        description: "My custom tool",
        args: {
          input: tool.schema.string().describe("Input parameter")
        },
        async execute(args, context) {
          return `Processed: ${args.input}`
        }
      })
    },

    // Modify OpenCode config
    config: async (config) => {
      // Add commands, agents, etc.
      config.command = config.command || {}
      config.command["my_command"] = {
        template: "Do something with ${args}",
        description: "My custom command"
      }
    },

    // React to events
    event: async ({ event }) => {
      if (event.type === "session.start") {
        console.log("✅ My Plugin active!")
      }
    }
  }
}

export default MyPlugin
```

### 3. Create Plugin Structure

```bash
# Create subdirectories for your plugin's files
mkdir -p commands agents tools

# Add your plugin files
touch commands/my-command.md
touch agents/my-agent.md
touch tools/my-tool.ts
```

### 4. Add Plugin to Config

Edit `.opencode/opencode.jsonc`:

```jsonc
{
  "plugin": [
    "file:///absolute/path/.opencode/plugin/claude-code/index.ts",
    "file:///absolute/path/.opencode/plugin/my-plugin/index.ts"  // Add this line
  ]
}
```

### 5. Test Your Plugin

```bash
opencode tui

# You should see: "🔌 Loading My Plugin..."
# and: "✅ My Plugin active!"
```

## Plugin Context

Every plugin receives a context object with useful properties:

```typescript
export const MyPlugin: Plugin = async (ctx) => {
  const {
    client,      // OpenCode API client
    project,     // Project metadata
    directory,   // THIS PLUGIN's directory (use for loading files!)
    worktree,    // Git worktree root
    $            // Shell executor
  } = ctx

  // Load files relative to YOUR plugin directory
  const myFile = path.join(directory, "myfile.txt")
}
```

**Key Point**: Always use `directory` (not `worktree`) to load your plugin's files!

## Loading Plugin Files

### Loading from Plugin Directory

```typescript
async function loadMyFiles(pluginDir: string) {
  // pluginDir is ctx.directory - where YOUR plugin is located

  const configPath = path.join(pluginDir, "config", "settings.json")
  const templatesDir = path.join(pluginDir, "templates")

  // Now load files relative to your plugin
  const config = JSON.parse(await fs.readFile(configPath, "utf-8"))
  const templates = await fs.readdir(templatesDir)

  return { config, templates }
}
```

### Example: Loading Commands

```typescript
async function loadCommands(pluginDir: string) {
  const commandsDir = path.join(pluginDir, "commands")
  const files = await fs.readdir(commandsDir)

  const commands = []
  for (const file of files) {
    if (file.endsWith(".md")) {
      const content = await fs.readFile(
        path.join(commandsDir, file),
        "utf-8"
      )
      commands.push({ name: file.replace(".md", ""), content })
    }
  }

  return commands
}
```

## Plugin Naming Conventions

### Tool Naming

Prefix tools with your plugin name to avoid conflicts:

```typescript
tool: {
  // Good: prefixed with plugin name
  "myplugin_mytool": tool({ ... }),
  "myplugin_anothertool": tool({ ... }),

  // Bad: generic names that might conflict
  "fetch": tool({ ... }),  // ❌ Too generic
  "format": tool({ ... }), // ❌ Might conflict
}
```

### Command Naming

Similar approach for commands:

```typescript
config.command["myplugin_mycommand"] = { ... }
```

### Agent Naming

And for agents:

```typescript
config.agent["myplugin_myagent"] = { ... }
```

## Plugin Hooks

Plugins can implement these hooks:

### tool

Register custom tools:

```typescript
tool: {
  my_tool: tool({
    description: "Description",
    args: { /* ... */ },
    async execute(args, ctx) { /* ... */ }
  })
}
```

### config

Modify OpenCode configuration:

```typescript
config: async (config) => {
  config.command["my_cmd"] = { /* ... */ }
  config.agent["my_agent"] = { /* ... */ }
}
```

### event

React to system events:

```typescript
event: async ({ event }) => {
  if (event.type === "session.start") {
    // Do something when session starts
  }
  if (event.type === "session.idle") {
    // Do something when session is idle
  }
}
```

### auth

Provide authentication methods:

```typescript
auth: {
  provider: "my-service",
  methods: [{
    type: "api",
    label: "Login with My Service",
    async authorize(inputs) {
      // Auth logic
      return { type: "success", key: "..." }
    }
  }]
}
```

### chat.message, chat.params, permission.ask, tool.execute.before, tool.execute.after

Intercept various operations - see OpenCode plugin docs.

## Example: Team Standards Plugin

```typescript
// .opencode/plugin/team-standards/index.ts
import { type Plugin, tool } from "@opencode-ai/plugin"
import path from "path"
import fs from "fs/promises"

export const TeamStandardsPlugin: Plugin = async (ctx) => {
  const { directory } = ctx

  // Load team coding standards
  const standardsPath = path.join(directory, "standards.json")
  const standards = JSON.parse(await fs.readFile(standardsPath, "utf-8"))

  return {
    tool: {
      check_standards: tool({
        description: "Check code against team standards",
        args: {
          file: tool.schema.string().describe("File to check")
        },
        async execute(args, context) {
          // Check code against standards
          return `Checking ${args.file} against team standards...`
        }
      })
    },

    config: async (config) => {
      // Add team-specific commands
      config.command["review_standards"] = {
        template: "Review ${args} for compliance with team standards",
        description: "Review code against team standards"
      }

      // Configure team-specific agent
      config.agent["standards_checker"] = {
        description: "Agent that enforces team coding standards",
        mode: "subagent",
        prompt: `You are a code reviewer focusing on team standards:\n\n${JSON.stringify(standards, null, 2)}`
      }
    }
  }
}

export default TeamStandardsPlugin
```

## Debugging Plugins

### Check Plugin Loading

```bash
# Start OpenCode with debug output
opencode tui --debug

# Look for plugin loading messages:
# 🔌 Initializing Claude Code Integration Plugin...
# 🔌 Loading My Plugin...
```

### Verify Plugin Path

Make sure the path in `opencode.jsonc` is absolute:

```jsonc
{
  "plugin": [
    // ✅ Correct: absolute path
    "file:///home/user/project/.opencode/plugin/my-plugin/index.ts",

    // ❌ Wrong: relative path
    ".opencode/plugin/my-plugin/index.ts"
  ]
}
```

### Check for Syntax Errors

```bash
bun check .opencode/plugin/my-plugin/index.ts
```

### Common Issues

1. **Plugin not loading**: Check absolute path in config
2. **Files not found**: Use `ctx.directory`, not `ctx.worktree`
3. **Tool conflicts**: Prefix tools with plugin name
4. **TypeScript errors**: Ensure `@opencode-ai/plugin` is installed

## Sharing Plugins

### As NPM Package

```bash
# In your plugin directory
cd .opencode/plugin/my-plugin

# Create package.json
npm init

# Publish
npm publish
```

Then users can install:

```bash
cd .opencode/plugin
npm install my-plugin
```

### As Git Submodule

```bash
cd .opencode/plugin
git submodule add https://github.com/user/my-plugin.git
```

### As File Copy

Just copy the entire plugin directory:

```bash
cp -r /path/to/source-plugin .opencode/plugin/my-plugin
```

## Best Practices

1. **Self-Contained**: Keep all plugin files in the plugin directory
2. **Use ctx.directory**: Always use `ctx.directory` for file paths
3. **Prefix Names**: Prefix tool/command/agent names with plugin name
4. **Document**: Include README.md in your plugin directory
5. **Version**: Include version in plugin metadata
6. **Test**: Test with multiple plugins installed
7. **Error Handling**: Handle missing files gracefully
8. **Logging**: Use clear console messages for debugging

## Resources

- [OpenCode Plugin Documentation](https://opencode.ai/docs/plugins)
- [Plugin API Reference](https://opencode.ai/docs/plugin-api)
- [Example Plugins](https://github.com/opencode-ai/plugins)

## Summary

✅ Each plugin in its own subdirectory
✅ Use `ctx.directory` for loading plugin files
✅ Prefix all tools/commands/agents with plugin name
✅ Register plugins in `.opencode/opencode.jsonc`
✅ Test with multiple plugins to ensure no conflicts

Now you can have as many plugins as you need, all working together! 🚀
