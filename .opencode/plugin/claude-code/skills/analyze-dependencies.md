---
description: Analyze project dependencies for security vulnerabilities and updates
---

Analyze the project's dependencies for security, updates, and compatibility issues.

## Analysis Steps

1. **Read package.json**
   - Identify all dependencies and devDependencies
   - Note version constraints

2. **Check for Vulnerabilities**
   - Run `npm audit` or equivalent
   - Identify critical, high, medium, and low severity issues
   - Provide CVE details if available

3. **Check for Updates**
   - Run `npm outdated` or equivalent
   - List packages that have newer versions
   - Highlight major version updates vs minor/patch

4. **License Analysis**
   - Check license compatibility
   - Identify restrictive licenses (GPL, AGPL, etc.)
   - Flag potential license conflicts

5. **Dependency Health**
   - Check for deprecated packages
   - Identify packages with no recent updates
   - Look for abandoned dependencies

## Output Format

```markdown
# Dependency Analysis Report

## Summary
- Total Dependencies: X
- Vulnerabilities Found: Y (Z critical, W high)
- Outdated Packages: N

## Critical Issues
- [Package name]: [Issue description]

## Vulnerabilities
[List with severity and CVE]

## Outdated Packages
[List with current vs latest version]

## Recommendations
[Prioritized action items]
```

Provide actionable recommendations for addressing issues.
