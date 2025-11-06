/**
 * Claude Code Integration Plugin for OpenCode
 *
 * This plugin provides seamless integration of Claude Code's agents, skills, and commands
 * into the OpenCode environment. It automatically discovers and converts Claude Code
 * configurations from this plugin's subdirectories.
 *
 * Structure:
 * .opencode/plugin/claude-code/
 * ├── index.ts          # This file
 * ├── commands/         # Claude Code commands
 * ├── agents/           # Claude Code agents
 * ├── skills/           # Claude Code skills
 * └── README.md         # Documentation
 *
 * Features:
 * - Converts Claude Code commands to OpenCode commands
 * - Exposes Claude Code skills as OpenCode tools
 * - Provides Claude Code agent patterns as OpenCode agents
 * - Self-contained: all files relative to plugin directory
 *
 * @see https://docs.claude.com/en/docs/claude-code
 * @see https://opencode.ai/docs
 */

import { type Plugin, tool } from "@opencode-ai/plugin"
import path from "path"
import fs from "fs/promises"
import matter from "gray-matter"

/**
 * Claude Code configuration structure
 */
interface ClaudeCodeConfig {
  commands: Map<string, ClaudeCommand>
  skills: Map<string, ClaudeSkill>
  agents: Map<string, ClaudeAgent>
}

interface ClaudeCommand {
  name: string
  description?: string
  agent?: string
  content: string
  filePath: string
}

interface ClaudeSkill {
  name: string
  description?: string
  content: string
  filePath: string
}

interface ClaudeAgent {
  name: string
  description: string
  mode: "primary" | "subagent"
  prompt: string
  tools?: Record<string, boolean>
}

/**
 * Main plugin export
 */
export const ClaudeCodeIntegrationPlugin: Plugin = async (ctx) => {
  const { client, project, directory, worktree, $ } = ctx

  console.log("🔌 Initializing Claude Code Integration Plugin...")

  // Discover Claude Code configurations from this plugin's directory
  const claudeConfig = await discoverClaudeCode(directory)

  console.log(`📋 Found ${claudeConfig.commands.size} commands, ${claudeConfig.skills.size} skills, ${claudeConfig.agents.size} agents`)

  // Convert skills to OpenCode tools
  // Skills are markdown-based instructions that guide the AI
  const tools: Record<string, any> = {}

  for (const [name, skill] of claudeConfig.skills) {
    tools[`claude_skill_${name}`] = tool({
      description: skill.description || `Claude Code skill: ${name}`,
      args: {
        // Skills can accept arbitrary parameters as context
        params: tool.schema.string().optional().describe("Additional parameters or context"),
      },
      async execute(args, context) {
        // Return the skill content as instructions for the AI to follow
        let instructions = skill.content
        if (args.params) {
          instructions = `${instructions}\n\nContext: ${args.params}`
        }
        return instructions
      },
    })
  }

  // Add command execution tool
  tools.claude_command = tool({
    description: "Execute a Claude Code command (slash command)",
    args: {
      command: tool.schema.string().describe("Name of the command to execute"),
      arguments: tool.schema.string().optional().describe("Arguments for the command"),
    },
    async execute(args, context) {
      const cmd = claudeConfig.commands.get(args.command)
      if (!cmd) {
        return `Command "${args.command}" not found. Available commands: ${Array.from(claudeConfig.commands.keys()).join(", ")}`
      }

      // Replace argument placeholders in the command content
      let content = cmd.content
      if (args.arguments) {
        content = content.replace(/\$\{args\}/g, args.arguments)
      }

      return `Executing Claude Code command: ${cmd.name}\n\n${content}`
    },
  })

  // Add agent discovery tool
  tools.claude_list_agents = tool({
    description: "List all available Claude Code agents",
    args: {},
    async execute(args, context) {
      const agentList = Array.from(claudeConfig.agents.values())
        .map(agent => `- **${agent.name}**: ${agent.description} (mode: ${agent.mode})`)
        .join("\n")

      return `Available Claude Code Agents:\n\n${agentList}`
    },
  })

  // Add command discovery tool
  tools.claude_list_commands = tool({
    description: "List all available Claude Code commands",
    args: {},
    async execute(args, context) {
      const cmdList = Array.from(claudeConfig.commands.values())
        .map(cmd => `- **/${cmd.name}**: ${cmd.description || "No description"}`)
        .join("\n")

      return `Available Claude Code Commands:\n\n${cmdList}`
    },
  })

  // Add skill discovery tool
  tools.claude_list_skills = tool({
    description: "List all available Claude Code skills",
    args: {},
    async execute(args, context) {
      const skillList = Array.from(claudeConfig.skills.values())
        .map(skill => `- **${skill.name}**: ${skill.description}`)
        .join("\n")

      return `Available Claude Code Skills:\n\n${skillList}`
    },
  })

  return {
    // Register tools
    tool: tools,

    // Modify config to add Claude Code commands and agents
    config: async (config) => {
      // Add Claude Code commands to OpenCode command namespace
      config.command = config.command || {}
      for (const [name, cmd] of claudeConfig.commands) {
        config.command[`claude_${name}`] = {
          template: cmd.content,
          description: cmd.description || `Claude Code command: ${name}`,
          agent: cmd.agent,
        }
      }

      // Add Claude Code agents to OpenCode agent namespace
      config.agent = config.agent || {}
      for (const [name, agent] of claudeConfig.agents) {
        config.agent[`claude_${name}`] = {
          description: agent.description,
          mode: agent.mode,
          prompt: agent.prompt,
          tools: agent.tools,
        }
      }
    },

    // Event handler for logging
    event: async ({ event }) => {
      if (event.type === "session.start") {
        console.log("🚀 Claude Code Integration active for this session")
      }
    },
  }
}

/**
 * Discover Claude Code configurations from plugin directory
 * @param pluginDir - The directory where this plugin is located
 */
async function discoverClaudeCode(pluginDir: string): Promise<ClaudeCodeConfig> {
  const config: ClaudeCodeConfig = {
    commands: new Map(),
    skills: new Map(),
    agents: new Map(),
  }

  // Load commands from ./commands/ (relative to plugin directory)
  const commandsDir = path.join(pluginDir, "commands")
  if (await exists(commandsDir)) {
    const commands = await loadClaudeCommands(commandsDir)
    for (const cmd of commands) {
      config.commands.set(cmd.name, cmd)
    }
  }

  // Load skills from ./skills/ (relative to plugin directory)
  const skillsDir = path.join(pluginDir, "skills")
  if (await exists(skillsDir)) {
    const skills = await loadClaudeSkills(skillsDir)
    for (const skill of skills) {
      config.skills.set(skill.name, skill)
    }
  }

  // Load agents from ./agents/ (relative to plugin directory)
  const agentsDir = path.join(pluginDir, "agents")
  if (await exists(agentsDir)) {
    const agents = await loadClaudeAgents(agentsDir)
    for (const agent of agents) {
      config.agents.set(agent.name, agent)
    }
  }

  // Add built-in Claude Code skills
  registerBuiltInSkills(config.skills)

  // Add built-in Claude Code agents
  registerBuiltInAgents(config.agents)

  return config
}

/**
 * Load Claude Code commands from markdown files
 */
async function loadClaudeCommands(commandsDir: string): Promise<ClaudeCommand[]> {
  const commands: ClaudeCommand[] = []

  try {
    const files = await fs.readdir(commandsDir, { recursive: true })

    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(commandsDir, file)
        const content = await fs.readFile(filePath, "utf-8")

        try {
          const parsed = matter(content)
          const name = path.basename(file, ".md")

          commands.push({
            name,
            description: parsed.data.description,
            agent: parsed.data.agent,
            content: parsed.content.trim(),
            filePath,
          })
        } catch (err) {
          console.warn(`Failed to parse command file: ${filePath}`, err)
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to load commands from: ${commandsDir}`, err)
  }

  return commands
}

/**
 * Load Claude Code skills from markdown files
 */
async function loadClaudeSkills(skillsDir: string): Promise<ClaudeSkill[]> {
  const skills: ClaudeSkill[] = []

  try {
    const files = await fs.readdir(skillsDir, { recursive: true })

    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(skillsDir, file)
        const content = await fs.readFile(filePath, "utf-8")

        try {
          const parsed = matter(content)
          const name = path.basename(file, ".md")

          skills.push({
            name,
            description: parsed.data.description,
            content: parsed.content.trim(),
            filePath,
          })
        } catch (err) {
          console.warn(`Failed to parse skill file: ${filePath}`, err)
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to load skills from: ${skillsDir}`, err)
  }

  return skills
}

/**
 * Load Claude Code agents from markdown files
 */
async function loadClaudeAgents(agentsDir: string): Promise<ClaudeAgent[]> {
  const agents: ClaudeAgent[] = []

  try {
    const files = await fs.readdir(agentsDir)

    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(agentsDir, file)
        const content = await fs.readFile(filePath, "utf-8")

        try {
          const parsed = matter(content)
          const name = path.basename(file, ".md")

          agents.push({
            name,
            description: parsed.data.description || `Claude Code agent: ${name}`,
            mode: parsed.data.mode || "subagent",
            prompt: parsed.content.trim(),
            tools: parsed.data.tools,
          })
        } catch (err) {
          console.warn(`Failed to parse agent file: ${filePath}`, err)
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to load agents from: ${agentsDir}`, err)
  }

  return agents
}

/**
 * Register built-in Claude Code skills
 */
function registerBuiltInSkills(skills: Map<string, ClaudeSkill>) {
  // Example: PDF skill
  skills.set("pdf", {
    name: "pdf",
    description: "Process and extract information from PDF files",
    async execute(args: any, context: any) {
      return "PDF skill: This would process PDF files. Integration requires pdf-parse or similar library."
    },
  })

  // Example: XLSX skill
  skills.set("xlsx", {
    name: "xlsx",
    description: "Process and manipulate Excel spreadsheet files",
    async execute(args: any, context: any) {
      return "XLSX skill: This would process Excel files. Integration requires xlsx or similar library."
    },
  })

  // Example: Image analysis skill
  skills.set("image", {
    name: "image",
    description: "Analyze and process image files",
    async execute(args: any, context: any) {
      return "Image skill: This would analyze images. Integration requires sharp or similar library."
    },
  })
}

/**
 * Register built-in Claude Code agents
 */
function registerBuiltInAgents(agents: Map<string, ClaudeAgent>) {
  // General-purpose research agent
  agents.set("general", {
    name: "general",
    description: "General-purpose agent for researching complex questions and searching code",
    mode: "subagent",
    prompt: `You are a general-purpose research agent specialized in code exploration and analysis.

Your primary capabilities:
- Searching codebases for patterns and keywords
- Analyzing code structure and relationships
- Answering questions about implementation details
- Finding files and understanding project organization

Focus on thorough research and provide detailed, accurate information.`,
    tools: {
      read: true,
      glob: true,
      grep: true,
      bash: false,
      edit: false,
      write: false,
    },
  })

  // Explore agent for codebase discovery
  agents.set("explore", {
    name: "explore",
    description: "Fast agent specialized for exploring codebases with configurable thoroughness",
    mode: "subagent",
    prompt: `You are a codebase exploration agent optimized for quick discovery and analysis.

Your capabilities:
- Quick file pattern matching (glob)
- Efficient keyword searching (grep)
- Fast codebase navigation
- Understanding project structure

When exploring:
- Start with broad searches, then narrow down
- Use glob patterns efficiently (e.g., "src/**/*.ts")
- Search for keywords in relevant files
- Provide clear summaries of findings

Adjust your thoroughness based on the user's requested level: quick, medium, or very thorough.`,
    tools: {
      read: true,
      glob: true,
      grep: true,
      bash: true,
      edit: false,
      write: false,
    },
  })
}

/**
 * Check if a path exists
 */
async function exists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}

// Export as default for compatibility
export default ClaudeCodeIntegrationPlugin
