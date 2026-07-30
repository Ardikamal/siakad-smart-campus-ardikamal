import { getScheduleList, type ScheduleListParams } from "@/lib/queries/schedules";
import { getAllCoursesForSelect } from "@/lib/queries/courses";
import { JadwalPageClient } from "@/components/admin/jadwal/jadwal-page-client";

interface JadwalPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function JadwalPage({ searchParams }: JadwalPageProps) {
  const params = await searchParams;

  const listParams: ScheduleListParams = {
    hari: firstString(params.hari),
    page: params.page ? Number(firstString(params.page)) : 1,
  };

  const [result, courseOptions] = await Promise.all([getScheduleList(listParams), getAllCoursesForSelect()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Jadwal Kuliah</h1>
        <p className="mt-1 text-sm text-muted-foreground">Atur jadwal, ruangan, dan hari perkuliahan.</p>
      </div>

      <JadwalPageClient
        schedules={result.items}
        courseOptions={courseOptions}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
