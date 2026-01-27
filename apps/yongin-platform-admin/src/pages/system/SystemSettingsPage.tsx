import { AnnouncementSection, NoticeSection } from "./components";

export function SystemSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">시스템 설정</h1>
        <p className="text-muted-foreground">플랫폼 전체에 적용되는 설정을 관리합니다.</p>
      </div>

      <AnnouncementSection />
      <NoticeSection />
    </div>
  );
}
