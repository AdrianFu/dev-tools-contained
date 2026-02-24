---
name: skill-maintainer
description: Creates, updates, and manages SKILL.md files ensuring all skills follow standard conventions with proper YAML frontmatter (name: and description: fields) and consistent formatting.
---

# Skill Maintainer

You are responsible for creating, updating, and managing SKILL.md files across projects. All skills must follow standard conventions.

## Standard SKILL.md Format

Every SKILL.md file MUST start with YAML frontmatter:

```yaml
---
name: skill-name
description: Brief description of what this skill does (1-2 sentences). Make sure to use concise language that clearly conveys the purpose of the skill.
---
```

Then include:
- A heading that matches the skill name (e.g., `# Skill Name`)
- Instructions section with numbered steps
- Clear, actionable guidance

## Workflow for Creating Skills

When asked to create a new SKILL.md:

1. **Search for existing skills** in the project:
   - Look in `.opencode/skills/*/SKILL.md`
   - Use `glob` tool to find all SKILL.md files

2. **Read at least 2-3 examples** to understand:
   - YAML frontmatter format
   - Section structure
   - Writing style
   - Naming conventions

3. **Match the format exactly**:
   - Use YAML frontmatter with `name:` and `description:`
   - Include a main heading
   - Use numbered lists for instructions
   - Keep descriptions concise

4. **Create the SKILL.md** in the appropriate location:
   - Project skills: `.opencode/skills/{skill-name}/SKILL.md`
   - Ensure directory exists before writing file

## Workflow for Updating Skills

When asked to update an existing SKILL.md:

1. **Read the current file** first
2. **Identify what needs to change**
3. **Preserve the standard format**:
   - Keep YAML frontmatter
   - Maintain section structure
   - Follow existing style
4. **Apply updates** using edit tool
5. **Verify format matches** other skills in the project

## Workflow for Deleting Skills

When asked to delete a skill:

1. **Confirm with user** before deleting (ask which specific skill)
2. **Check if skill exists**
3. **Remove the entire skill directory** (not just SKILL.md)
   - `.opencode/skills/{skill-name}/`

## Common Mistakes to Avoid

❌ **Don't** skip YAML frontmatter
❌ **Don't** guess the format - always check examples first
❌ **Don't** use inconsistent naming (kebab-case for skill names)
❌ **Don't** create SKILL.md in wrong location
❌ **Don't** mix markdown formats inconsistently

✅ **Do** search existing skills first
✅ **Do** read multiple examples
✅ **Do** use standard YAML frontmatter
✅ **Do** follow project conventions
✅ **Do** ask user if unsure about format

## Validation Checklist

Before completing any SKILL.md operation, verify:

- [ ] YAML frontmatter exists with `name:` and `description:`
- [ ] Skill name uses kebab-case
- [ ] File is in `.opencode/skills/{skill-name}/SKILL.md`
- [ ] Format matches other skills in the project
- [ ] Instructions are clear and actionable
- [ ] No ambiguous or missing details

## Example Standard SKILL.md

```yaml
---
name: flutter-code-scanner
description: Perform comprehensive scan of Flutter codebase to identify coding errors, style violations, and best practice breaches.
---

# Flutter Code Scanner

You are a Senior Software Engineer specializing in Flutter development. Your task is to perform comprehensive codebase scans.

## Instructions
1. Run `flutter analyze --no-pub`
2. Review output for errors, warnings, hints
3. Provide detailed explanations with file:line references
4. Suggest specific improvements
```

## Important Notes

- Always check existing skills first - never guess formats
- If unsure about the format, ask the user for clarification
- Keep skills focused and single-purpose
- Use clear, concise descriptions in YAML frontmatter
- Maintain consistency across all skills in the project
