import { FOOTER_TEXT } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-4">
      <p className="text-center text-xs leading-relaxed text-muted-foreground">{FOOTER_TEXT}</p>
    </footer>
  );
}
