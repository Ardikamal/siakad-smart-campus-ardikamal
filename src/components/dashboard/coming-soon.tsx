import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Construction className="h-6 w-6" />
          </div>
          <p className="font-medium text-foreground">Modul ini sedang dalam pengembangan</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Fondasi sistem (database, autentikasi, dashboard) sudah siap. Modul ini menyusul di
            tahap pengerjaan berikutnya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
