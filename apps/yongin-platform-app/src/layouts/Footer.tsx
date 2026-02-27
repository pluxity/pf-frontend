import { Announcement } from "../components/Announcement";

export function Footer() {
  return (
    <footer className="flex overflow-hidden items-center h-[var(--footer-height)] px-[1rem] bg-brand-secondary text-white">
      <Announcement />
    </footer>
  );
}
