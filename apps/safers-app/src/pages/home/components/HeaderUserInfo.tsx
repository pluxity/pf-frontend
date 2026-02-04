export function HeaderUserInfo() {
  // TODO: 실제 사용자 정보 연동
  const user = {
    name: "김호반",
    role: "최고 관리자",
  };

  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <span className="font-medium">{user.role}</span>
      <span className="text-neutral-400">|</span>
      <span>{user.name}</span>
    </div>
  );
}
