import test from "node:test";
import assert from "node:assert/strict";
import { seedStudents } from "../src/data/students.js";
import { positiveEmotions, negativeEmotions } from "../src/data/emotions.js";
import {
  average,
  wellbeing,
  focusScore,
  engagement,
  familySummary,
} from "../src/domain/metrics.js";
import { applyCheckin, quizQuestions } from "../src/domain/checkin.js";

const [isabela, gabriel, manuela] = seedStudents;

test("demo profiles have complete, bounded sample data", () => {
  assert.equal(seedStudents.length, 3);
  assert.equal(positiveEmotions.length, 5);
  assert.equal(negativeEmotions.length, 5);
  for (const student of seedStudents) {
    assert.equal(student.grades.length, 8);
    assert.ok(student.grades.every(([, grade]) => grade >= 0 && grade <= 10));
    assert.equal(student.pos.length, 5);
    assert.equal(student.neg.length, 5);
  }
});

test("metrics use consistent source values and handle missing data safely", () => {
  assert.ok(Math.abs(average(isabela) - 8.575) < 1e-10);
  assert.equal(wellbeing(isabela), 74);
  assert.equal(focusScore(gabriel), 84);
  assert.equal(
    engagement(gabriel),
    Math.round(
      average(gabriel) * 10 * 0.4 +
        wellbeing(gabriel) * 0.25 +
        98 * 0.2 +
        84 * 0.15,
    ),
  );
  assert.deepEqual(familySummary([]), {
    engagement: 0,
    wellbeing: 0,
    attendance: 0,
  });
  assert.equal(familySummary(seedStudents).attendance, 97);
});

test("check-in requires answers to all three questions", () => {
  assert.equal(quizQuestions.length, 3);
  assert.throws(
    () => applyCheckin(isabela, { mood: 0, energy: 0 }),
    /três perguntas/,
  );
});

test("check-in is immutable, records the self-report and updates related demo indicators", () => {
  const before = structuredClone(gabriel);
  const after = applyCheckin(
    gabriel,
    { mood: 0, energy: 0, support: 2 },
    { note: "Dia produtivo", timestamp: "06 nov · 09:30" },
  );
  assert.deepEqual(gabriel, before);
  assert.equal(after.pos[4], before.pos[4] + 4);
  assert.equal(after.pos[3], before.pos[3] + 3);
  assert.equal(after.focus, before.focus + 2);
  assert.equal(after.rewards, before.rewards + 25);
  assert.equal(after.checkins[0].mood, "Bem");
  assert.equal(after.checkins[0].energy, "Alta");
  assert.equal(after.checkins[0].support, "Descanso");
  assert.equal(after.checkins[0].note, "Dia produtivo");
  assert.equal(after.history.length, 8);
});

test("check-in clamps scores at their supported bounds", () => {
  const high = {
    ...isabela,
    pos: [100, 100, 100, 100, 98],
    neg: [...isabela.neg],
    history: [...isabela.history],
    checkins: [...isabela.checkins],
  };
  const low = {
    ...isabela,
    pos: [10, 10, 10, 10, 10],
    neg: [...isabela.neg],
    history: [...isabela.history],
    checkins: [...isabela.checkins],
  };
  const highResult = applyCheckin(
    high,
    { mood: 0, energy: 0, support: 0 },
    { timestamp: "sample" },
  );
  const lowResult = applyCheckin(
    low,
    { mood: 3, energy: 3, support: 0 },
    { timestamp: "sample" },
  );
  assert.ok(highResult.pos.every((value) => value <= 98));
  assert.ok(lowResult.pos.every((value) => value >= 10));
  assert.ok(lowResult.focus >= 20);
});
