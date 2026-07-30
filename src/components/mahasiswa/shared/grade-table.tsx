import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { GradeWithCourseOnly } from "@/lib/types/grade";

interface GradeTableProps {
  grades: GradeWithCourseOnly[];
}

export function GradeTable({ grades }: GradeTableProps) {
  if (grades.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Belum ada nilai untuk ditampilkan.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode</TableHead>
          <TableHead>Mata Kuliah</TableHead>
          <TableHead>SKS</TableHead>
          <TableHead>Nilai Angka</TableHead>
          <TableHead>Huruf</TableHead>
          <TableHead>Bobot</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grades.map((g) => (
          <TableRow key={g.id}>
            <TableCell className="font-mono text-xs">{g.course.kode}</TableCell>
            <TableCell className="font-medium text-foreground">{g.course.nama}</TableCell>
            <TableCell className="text-muted-foreground">{g.course.sks}</TableCell>
            <TableCell className="text-muted-foreground">{g.nilaiAngka}</TableCell>
            <TableCell>
              <Badge variant="outline">{g.nilaiHuruf}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{g.bobot.toFixed(1)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
