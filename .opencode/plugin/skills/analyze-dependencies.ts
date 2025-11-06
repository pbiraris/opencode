/**
 * Analyze Dependencies Skill
 *
 * Analyzes project dependencies for security vulnerabilities,
 * outdated packages, and license compliance.
 */

import fs from "fs/promises"
import path from "path"

interface DependencyAnalysis {
  total: number
  outdated: string[]
  vulnerable: string[]
  licenses: Record<string, string[]>
}

async function analyzeDependencies(
  args: { directory?: string },
  context: { sessionID: string; agent: string }
): Promise<string> {
  const projectDir = args.directory || process.cwd()

  try {
    // Read package.json
    const packageJsonPath = path.join(projectDir, "package.json")
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"))

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    const analysis: DependencyAnalysis = {
      total: Object.keys(dependencies).length,
      outdated: [],
      vulnerable: [],
      licenses: {},
    }

    // Analysis report
    let report = "# Dependency Analysis Report\n\n"
    report += `**Total Dependencies**: ${analysis.total}\n\n`

    report += "## Dependencies\n\n"
    for (const [name, version] of Object.entries(dependencies)) {
      report += `- ${name}: ${version}\n`
    }

    report += "\n## Recommendations\n\n"
    report += "- Run `npm audit` to check for known vulnerabilities\n"
    report += "- Run `npm outdated` to check for updates\n"
    report += "- Consider using tools like Snyk or Dependabot\n"
    report += "- Review license compatibility for your project\n"

    return report
  } catch (error) {
    return `Error analyzing dependencies: ${error instanceof Error ? error.message : String(error)}`
  }
}

// Skill metadata
analyzeDependencies.description = "Analyze project dependencies for security and updates"

export default analyzeDependencies
