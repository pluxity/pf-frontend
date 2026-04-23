import { useAuthStore, selectUser } from "@pf-dev/services";

export function HeaderUserInfo() {
  const user = useAuthStore(selectUser);

  if (!user) return null;

  const roleName = user.roles[0]?.name ?? "";

  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      {roleName && <span className="font-medium">{roleName}</span>}
      {roleName && <span className="text-neutral-400">|</span>}
      <span>{user.name}</span>
    </div>
  );
}
