export const quizQuestions = [
  {
    id: "mood",
    title: "Como você se sentiu na maior parte do dia?",
    options: [
      ["😊", "Bem"],
      ["🙂", "Ok"],
      ["😐", "Neutro"],
      ["😟", "Difícil"],
    ],
  },
  {
    id: "energy",
    title: "Como esteve sua energia hoje?",
    options: [
      ["⚡", "Alta"],
      ["🌤️", "Boa"],
      ["🔋", "Baixa"],
      ["🌙", "Pouca"],
    ],
  },
  {
    id: "support",
    title: "O que seria mais útil agora?",
    options: [
      ["💬", "Conversar"],
      ["📚", "Ajuda"],
      ["🌿", "Descanso"],
      ["🤝", "Apoio"],
    ],
  },
];

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

/** Apply a completed self-report check-in without mutating the original student. */
export function applyCheckin(
  student,
  answers,
  { note = "", timestamp = new Date() } = {},
) {
  const ids = quizQuestions.map((question) => question.id);
  if (
    !student ||
    ids.some(
      (id) =>
        !Number.isInteger(answers?.[id]) || answers[id] < 0 || answers[id] > 3,
    )
  ) {
    throw new Error(
      "Complete as três perguntas antes de registrar o check-in.",
    );
  }
  const next = {
    ...student,
    pos: student.pos.map((value) => clamp(value, 10, 98)),
    neg: student.neg.map((value) => clamp(value, 8, 90)),
    history: [...student.history],
    checkins: [...student.checkins],
  };
  const mood = answers.mood,
    energy = answers.energy;
  const moodDelta = [4, 2, 0, -3][mood];
  next.pos[4] = clamp(next.pos[4] + moodDelta, 10, 98);
  next.pos[2] = clamp(next.pos[2] + (mood < 2 ? 1 : -1), 10, 98);
  next.neg[4] = clamp(
    next.neg[4] + (mood === 3 ? 3 : mood === 2 ? 1 : -2),
    8,
    90,
  );
  next.pos[3] = clamp(next.pos[3] + [3, 2, -2, -3][energy], 10, 98);
  next.focus = clamp(next.focus + [2, 1, -2, -3][energy], 20, 98);
  next.history.push(
    clamp(
      next.history.at(-1) +
        Math.round((moodDelta + [3, 2, -2, -3][energy]) / 2),
      20,
      98,
    ),
  );
  if (next.history.length > 8) next.history.shift();
  next.rewards += 25;
  next.checkins.unshift({
    date:
      timestamp instanceof Date
        ? timestamp.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : String(timestamp),
    mood: quizQuestions[0].options[mood][1],
    energy: quizQuestions[1].options[energy][1],
    support: quizQuestions[2].options[answers.support][1],
    note: note.trim() || "Sem observação adicional.",
  });
  return next;
}
