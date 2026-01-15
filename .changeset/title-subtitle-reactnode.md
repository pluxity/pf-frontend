---
"@pf-dev/ui": patch
---

title/subtitle props 타입을 ReactNode로 확장 (#200)

### 변경된 컴포넌트

**title prop:**

- Sidebar
- LoginCard
- PasswordChangeCard
- Form (FormContainer, FormSection)
- EmptyState
- ErrorPage
- Sheet (SheetSection)
- Timeline
- NotificationCenter
- Stepper
- StatisticsCard
- FileUpload / ImageUpload / UploadZone
- Footer
- Toast

**subtitle prop:**

- LoginCard
- PasswordChangeCard

기존 string 값은 그대로 동작하므로 breaking change 없음.
