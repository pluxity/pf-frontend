# Project Configuration

## GitHub Information

- **Organization**: pluxity
- **Repository**: pf-dev
- **Project Number**: 17
- **Project ID**: PVT_kwDOC1m_S84BJx9K
- **Project URL**: https://github.com/orgs/pluxity/projects/17

## Project Field IDs

### Status Field
- **Field ID**: PVTSSF_lADOC1m_S84BJx9Kzg5177k
- **Options**:
  - Todo: `f75ad846`
  - In Progress: `47fc9ee4`
  - Done: `98236657`

### Date Fields
| Field Name | Field ID | Type |
|------------|----------|------|
| start-date | PVTF_lADOC1m_S84BJx9Kzg5187A | ProjectV2Field |
| due-date | PVTF_lADOC1m_S84BJx9Kzg5187E | ProjectV2Field |

### Other Fields
| Field Name | Field ID | Type |
|------------|----------|------|
| Title | PVTF_lADOC1m_S84BJx9Kzg5177c | ProjectV2Field |
| Assignees | PVTF_lADOC1m_S84BJx9Kzg5177g | ProjectV2Field |
| Labels | PVTF_lADOC1m_S84BJx9Kzg5177o | ProjectV2Field |
| Linked pull requests | PVTF_lADOC1m_S84BJx9Kzg5177s | ProjectV2Field |
| Milestone | PVTF_lADOC1m_S84BJx9Kzg5177w | ProjectV2Field |
| Repository | PVTF_lADOC1m_S84BJx9Kzg51770 | ProjectV2Field |
| Reviewers | PVTF_lADOC1m_S84BJx9Kzg51778 | ProjectV2Field |
| Parent issue | PVTF_lADOC1m_S84BJx9Kzg5178A | ProjectV2Field |
| Sub-issues progress | PVTF_lADOC1m_S84BJx9Kzg5178E | ProjectV2Field |

## Team Members

| Name | GitHub Handle | Role |
|------|---------------|------|
| TBD | @username | Developer |

## Labels

| Label | Color | Description |
|-------|-------|-------------|
| feature | `#0E8A16` | New feature |
| enhancement | `#a2eeef` | New feature or request |
| bug | `#d73a4a` | Something isn't working |
| docs | `#0075ca` | Documentation |
| discussion | `#5319E7` | Discussion |

## Issue Templates

Issue templates are defined in the github-project-manager skill.

## Commands

### Add issue to project
```bash
gh project item-add 17 --owner pluxity --url <ISSUE_URL>
```

### Update item status
```bash
gh project item-edit --project-id PVT_kwDOC1m_S84BJx9K --id <ITEM_ID> --field-id PVTSSF_lADOC1m_S84BJx9Kzg5177k --single-select-option-id <OPTION_ID>
```
