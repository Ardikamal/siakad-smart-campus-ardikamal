import { describe, expect, it } from "vitest";
import { calculateGpa, getGradeInfo, getMaxSksByIps } from "@/lib/academic";

describe("getGradeInfo", () => {
  it("maps the top and bottom of each band correctly", () => {
    expect(getGradeInfo(100)).toEqual({ nilaiHuruf: "A", bobot: 4.0 });
    expect(getGradeInfo(85)).toEqual({ nilaiHuruf: "A", bobot: 4.0 });
    expect(getGradeInfo(84.99)).toEqual({ nilaiHuruf: "AB", bobot: 3.5 });
    expect(getGradeInfo(80)).toEqual({ nilaiHuruf: "AB", bobot: 3.5 });
    expect(getGradeInfo(79.99)).toEqual({ nilaiHuruf: "B", bobot: 3.0 });
    expect(getGradeInfo(75)).toEqual({ nilaiHuruf: "B", bobot: 3.0 });
    expect(getGradeInfo(74.99)).toEqual({ nilaiHuruf: "BC", bobot: 2.5 });
    expect(getGradeInfo(70)).toEqual({ nilaiHuruf: "BC", bobot: 2.5 });
    expect(getGradeInfo(69.99)).toEqual({ nilaiHuruf: "C", bobot: 2.0 });
    expect(getGradeInfo(65)).toEqual({ nilaiHuruf: "C", bobot: 2.0 });
    expect(getGradeInfo(64.99)).toEqual({ nilaiHuruf: "CD", bobot: 1.5 });
    expect(getGradeInfo(60)).toEqual({ nilaiHuruf: "CD", bobot: 1.5 });
    expect(getGradeInfo(59.99)).toEqual({ nilaiHuruf: "D", bobot: 1.0 });
    expect(getGradeInfo(55)).toEqual({ nilaiHuruf: "D", bobot: 1.0 });
    expect(getGradeInfo(54.99)).toEqual({ nilaiHuruf: "E", bobot: 0 });
    expect(getGradeInfo(0)).toEqual({ nilaiHuruf: "E", bobot: 0 });
  });
});

describe("calculateGpa", () => {
  it("returns zero for an empty grade list instead of dividing by zero", () => {
    expect(calculateGpa([])).toEqual({ gpa: 0, totalSks: 0 });
  });

  it("computes a straight average when every course has equal SKS", () => {
    const grades = [
      { bobot: 4.0, course: { sks: 3 } },
      { bobot: 3.0, course: { sks: 3 } },
    ];
    expect(calculateGpa(grades)).toEqual({ gpa: 3.5, totalSks: 6 });
  });

  it("weights by SKS rather than averaging bobot naively", () => {
    // (4.0*4 + 2.0*2) / (4+2) = 20/6 = 3.333... -> should NOT equal the naive
    // average of 4.0 and 2.0 (which would be 3.0).
    const grades = [
      { bobot: 4.0, course: { sks: 4 } },
      { bobot: 2.0, course: { sks: 2 } },
    ];
    const result = calculateGpa(grades);
    expect(result.totalSks).toBe(6);
    expect(result.gpa).toBeCloseTo(3.33, 2);
    expect(result.gpa).not.toBe(3.0);
  });

  it("rounds gpa to 2 decimal places", () => {
    const grades = [
      { bobot: 4.0, course: { sks: 1 } },
      { bobot: 3.5, course: { sks: 1 } },
      { bobot: 3.0, course: { sks: 1 } },
    ];
    // (4+3.5+3)/3 = 3.4999... -> rounds to 3.5
    expect(calculateGpa(grades).gpa).toBe(3.5);
  });
});

describe("getMaxSksByIps", () => {
  it("gives new students (no IPS yet) the standard first-semester allowance", () => {
    expect(getMaxSksByIps(null)).toBe(24);
  });

  it("respects each band boundary as inclusive on the lower bound", () => {
    expect(getMaxSksByIps(3.5)).toBe(24);
    expect(getMaxSksByIps(3.49)).toBe(21);
    expect(getMaxSksByIps(3.0)).toBe(21);
    expect(getMaxSksByIps(2.99)).toBe(18);
    expect(getMaxSksByIps(2.5)).toBe(18);
    expect(getMaxSksByIps(2.49)).toBe(15);
    expect(getMaxSksByIps(2.0)).toBe(15);
    expect(getMaxSksByIps(1.99)).toBe(12);
    expect(getMaxSksByIps(0)).toBe(12);
  });
});
