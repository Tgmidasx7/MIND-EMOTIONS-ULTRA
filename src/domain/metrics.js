const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** Arithmetic mean of the student's current illustrative subject grades. */
export function average(student) {
  const grades = student?.grades ?? [];
  if (grades.length === 0) return 0;
  return grades.reduce((sum, [, grade]) => sum + grade, 0) / grades.length;
}

/** Positive share of the configured emotional indicators (demo index, not diagnosis). */
export function wellbeing(student) {
  const positive = student?.pos ?? [];
  const negative = student?.neg ?? [];
  const positiveTotal = positive.reduce((sum, value) => sum + value, 0);
  const total = positiveTotal + negative.reduce((sum, value) => sum + value, 0);
  return total > 0 ? Math.round((positiveTotal / total) * 100) : 0;
}

/** Demo focus indicator; derive from motivation and creativity only if absent. */
export function focusScore(student) {
  if (Number.isFinite(student?.focus))
    return clamp(Math.round(student.focus), 0, 100);
  const values = student?.pos ?? [];
  return values.length > 3 ? Math.round((values[0] + values[3]) / 2) : 0;
}

/** Shared weighted engagement score used by cards, comparison and profile. */
export function engagement(student) {
  const academic = average(student) * 10;
  const attendance = Number.isFinite(student?.attendance)
    ? student.attendance
    : 0;
  return Math.round(
    academic * 0.4 +
      wellbeing(student) * 0.25 +
      attendance * 0.2 +
      focusScore(student) * 0.15,
  );
}

export function familySummary(students) {
  if (!students?.length) return { engagement: 0, wellbeing: 0, attendance: 0 };
  const mean = (values) =>
    Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  return {
    engagement: mean(students.map(engagement)),
    wellbeing: mean(students.map(wellbeing)),
    attendance: mean(students.map((student) => student.attendance ?? 0)),
  };
}
