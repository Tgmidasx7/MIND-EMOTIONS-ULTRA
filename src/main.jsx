import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Heart,
  BookOpen,
  Brain,
  BarChart3,
  MessageCircle,
  CalendarDays,
  Bell,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Send,
  Check,
  Menu,
  Sun,
  Moon,
  Flower2,
} from "lucide-react";
import { seedStudents } from "./data/students.js";
import {
  positiveEmotions as positive,
  negativeEmotions as negative,
} from "./data/emotions.js";
import {
  average,
  wellbeing as well,
  focusScore as focus,
  engagement,
  familySummary,
} from "./domain/metrics.js";
import { quizQuestions, applyCheckin } from "./domain/checkin.js";
import { appUrl, parseAppUrl } from "./domain/routes.js";
import { Metric, EmotionRow, Subnav } from "./components/ui.jsx";
import "./styles/index.css";

const tabs = [
  ["home", "Visão geral", LayoutDashboard],
  ["emotions", "Emocional", Heart],
  ["grades", "Notas", BookOpen],
  ["quiz", "Quiz emocional", Brain],
  ["insights", "Gráficos", BarChart3],
  ["chat", "Mensagens", MessageCircle],
];
function App() {
  const [initialRoute] = useState(() =>
    parseAppUrl(
      window.location.pathname,
      window.location.search,
      import.meta.env.BASE_URL,
    ),
  );
  const [students, setStudents] = useState(seedStudents),
    [selected, setSelected] = useState(initialRoute.studentId),
    [tab, setTab] = useState(initialRoute.tab),
    [quizAnswers, setQuizAnswers] = useState({}),
    [quizDone, setQuizDone] = useState(false),
    [message, setMessage] = useState(""),
    [theme, setTheme] = useState(
      () => localStorage.getItem("mind-theme") || "dark",
    ),
    [subTab, setSubTab] = useState("mapa"),
    [gradeFilter, setGradeFilter] = useState("all"),
    [quizNote, setQuizNote] = useState(""),
    [sortMode, setSortMode] = useState("default"),
    [rsvp, setRsvp] = useState(false),
    [compareOpen, setCompareOpen] = useState(false),
    [themeOpen, setThemeOpen] = useState(false);
  React.useEffect(() => {
    const syncRoute = () => {
      const route = parseAppUrl(
        window.location.pathname,
        window.location.search,
        import.meta.env.BASE_URL,
      );
      setTab(route.tab);
      setSelected(route.studentId);
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);
  React.useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("mind-theme", theme);
  }, [theme]);
  React.useEffect(() => {
    setSubTab(
      {
        emotions: "mapa",
        grades: "boletim",
        quiz: "checkin",
        insights: "visao",
        chat: "mensagens",
      }[tab] || "mapa",
    );
  }, [tab]);
  const sortedStudents = [...students].sort((a, b) =>
    sortMode === "engagement"
      ? engagement(b) - engagement(a)
      : sortMode === "wellbeing"
        ? well(b) - well(a)
        : a.id - b.id,
  );
  const family = familySummary(students),
    familyEng = family.engagement,
    familyWell = family.wellbeing,
    familyAttendance = family.attendance;
  const student = students.find((s) => s.id === selected);
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());
  const navigateTab = (nextTab, studentId = selected) => {
    setTab(nextTab);
    const url = appUrl(nextTab, studentId, import.meta.env.BASE_URL);
    if (`${window.location.pathname}${window.location.search}` !== url)
      window.history.pushState({}, "", url);
  };
  const changeStudent = (id) => {
    setSelected(id);
    navigateTab("home", id);
    setQuizDone(false);
    setQuizAnswers({});
    setQuizNote("");
  };
  const update = (s) =>
    setStudents((prev) => prev.map((x) => (x.id === s.id ? s : x)));
  const simulateStudentScenario = (scenario) => {
    const next = {
      ...student,
      pos: [...student.pos],
      neg: [...student.neg],
      grades: student.grades.map(([subject, grade]) => [subject, grade]),
      history: [...student.history],
    };
    const raise = (values, index, amount) => {
      values[index] = Math.min(100, Math.max(0, values[index] + amount));
    };
    if (scenario === "project") {
      next.focus = Math.min(100, next.focus + 4);
      raise(next.pos, 0, 5);
      raise(next.pos, 3, 4);
      raise(next.pos, 4, 4);
      raise(next.neg, 4, -4);
      const lowest = next.grades.reduce(
        (min, grade, index, all) => (grade[1] < all[min][1] ? index : min),
        0,
      );
      next.grades[lowest][1] = Math.min(
        10,
        +(next.grades[lowest][1] + 0.3).toFixed(1),
      );
    } else if (scenario === "exam") {
      next.attendance = Math.min(100, next.attendance + 1);
      next.focus = Math.min(100, next.focus + 3);
      raise(next.pos, 1, 3);
      raise(next.neg, 4, 5);
    } else {
      next.focus = Math.min(100, next.focus + 2);
      raise(next.pos, 2, 4);
      raise(next.pos, 4, 5);
      raise(next.neg, 0, -4);
      raise(next.neg, 3, -4);
      raise(next.neg, 4, -6);
    }
    next.history = [...next.history.slice(1), engagement(next)];
    update(next);
  };
  const submitQuiz = () => {
    if (Object.keys(quizAnswers).length !== quizQuestions.length) return;
    try {
      update(applyCheckin(student, quizAnswers, { note: quizNote }));
      setQuizAnswers({});
      setQuizNote("");
      setQuizDone(true);
    } catch (error) {
      console.error(error);
    }
  };
  const send = () => {
    const text = message.trim();
    if (!text) return;
    const userMsg = {
      from: "you",
      text,
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selected
          ? { ...s, messages: [...(s.messages || []), userMsg] }
          : s,
      ),
    );
    setMessage("");
    window.setTimeout(
      () =>
        setStudents((prev) =>
          prev.map((s) =>
            s.id === selected
              ? {
                  ...s,
                  messages: [
                    ...(s.messages || []),
                    {
                      from: "teacher",
                      text: "Mensagem recebida. Este protótipo não envia mensagens reais; em uma versão conectada, a equipe responderá por este canal.",
                      time: new Date().toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    },
                  ],
                }
              : s,
          ),
        ),
      700,
    );
  };
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Brain size={21} />
          </div>
          <div>
            <b>
              mind<span>emotions</span>
            </b>
            <small>ÁREA DA FAMÍLIA</small>
          </div>
        </div>
        <div className="family">
          <div className="family-avatar">A</div>
          <div>
            <b>Família Albuquerque</b>
            <small>Plano família · 3 alunos</small>
          </div>
          <ChevronRight size={16} />
        </div>
        <div className="nav-label">MENU PRINCIPAL</div>
        <nav>
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              className={tab === id ? "nav-item active" : "nav-item"}
              onClick={() => navigateTab(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "chat" && <i className="unread" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-icon">?</div>
          <div>
            <b>Precisa de ajuda?</b>
            <small>Fale com nosso suporte</small>
          </div>
          <ChevronRight size={15} />
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="mobile-menu">
            <Menu />
          </button>
          <div className="crumb">
            Área da família <ChevronRight size={15} />
            <b>{tabs.find((x) => x[0] === tab)?.[1]}</b>
          </div>
          <div
            className="theme-corner-wrapper"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setThemeOpen(false);
            }}
          >
            <button
              className="theme-circle-trigger"
              type="button"
              aria-label={`Tema atual: ${{ dark: "Escuro Profundo", light: "Claro Cristal", rose: "Rosé Pastel" }[theme] || "Escuro Profundo"}`}
              aria-haspopup="menu"
              aria-expanded={themeOpen}
              onClick={() => setThemeOpen((open) => !open)}
            >
              {theme === "dark" ? (
                <Moon size={17} />
              ) : theme === "light" ? (
                <Sun size={17} />
              ) : (
                <Flower2 size={17} />
              )}
            </button>
            {themeOpen && (
              <div
                className="theme-sidebar-popover"
                role="menu"
                aria-label="Escolha um tema"
              >
                <b className="theme-popover-title">Aparência</b>
                {[
                  ["dark", Moon, "Escuro Profundo"],
                  ["light", Sun, "Claro Cristal"],
                  ["rose", Flower2, "Rosé Pastel"],
                ].map(([id, Icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={theme === id}
                    className={`theme-option ${theme === id ? "active" : ""}`}
                    onClick={() => {
                      setTheme(id);
                      setThemeOpen(false);
                    }}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                    {theme === id && <Check size={15} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notificações">
              <Bell size={18} />
              <i />
            </button>
            <div className="user">
              <div className="user-avatar">MA</div>
              <span>
                <b>Mariana Albuquerque</b>
                <small>Responsável</small>
              </span>
              <ChevronRight size={15} />
            </div>
          </div>
        </header>
        <div className="content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">
                {dateLabel.toLocaleUpperCase("pt-BR")} · DADOS DEMONSTRATIVOS
              </div>
              <h1>
                {tab === "home" ? "Um ótimo dia, Mariana!" : "Olá, Mariana!"}{" "}
                <span>✦</span>
              </h1>
              <p>Acompanhe de perto o desenvolvimento dos seus filhos.</p>
            </div>
            <button className="date-pill">
              <CalendarDays size={16} /> Este mês <ChevronRight size={14} />
            </button>
          </div>
          {tab === "home" && (
            <section className="family-kpis">
              <div>
                <span>👨‍👩‍👧‍👦</span>
                <small>PERFIS</small>
                <b>
                  3 <i>estudantes</i>
                </b>
              </div>
              <div>
                <span>⚡</span>
                <small>ENGAJAMENTO MÉDIO</small>
                <b>{familyEng}%</b>
              </div>
              <div>
                <span>💚</span>
                <small>BEM-ESTAR MÉDIO</small>
                <b>{familyWell}%</b>
              </div>
              <div>
                <span>🎓</span>
                <small>FREQUÊNCIA MÉDIA</small>
                <b>{familyAttendance}%</b>
              </div>
            </section>
          )}
          <section className="student-switcher">
            <div className="switch-title">
              <div>
                <b>Seus filhos</b>
                <span>Selecione um perfil para acompanhar</span>
              </div>
              <div className="family-actions">
                <button
                  className={
                    sortMode === "default"
                      ? "family-action active"
                      : "family-action"
                  }
                  onClick={() => setSortMode("default")}
                >
                  Todos
                </button>
                <button
                  className={
                    sortMode === "engagement"
                      ? "family-action active"
                      : "family-action"
                  }
                  onClick={() => setSortMode("engagement")}
                >
                  ⚡ Engajamento
                </button>
                <button
                  className={
                    sortMode === "wellbeing"
                      ? "family-action active"
                      : "family-action"
                  }
                  onClick={() => setSortMode("wellbeing")}
                >
                  💚 Bem-estar
                </button>
                <button
                  className="family-action"
                  onClick={() => setCompareOpen(true)}
                >
                  ⇄ Comparar
                </button>
              </div>
            </div>
            <div className="student-list">
              {sortedStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => changeStudent(s.id)}
                  className={`student-chip ${selected === s.id ? "chosen" : ""}`}
                >
                  <div className={`face ${s.color}`}>{s.emoji}</div>
                  <span>
                    <b>{s.name}</b>
                    <small>
                      {s.age} anos · {s.grade}
                    </small>
                  </span>
                  {selected === s.id && (
                    <Check className="selected-check" size={17} />
                  )}
                </button>
              ))}
            </div>
          </section>
          {tab !== "home" && (
            <section className="student-profile-summary">
              <div className={`profile-face ${student.color}`}>
                {student.emoji}
              </div>
              <div className="profile-person">
                <div className="profile-badges">
                  <span>{student.grade}</span>
                  <span>🔥 {student.streak} dias seguidos</span>
                </div>
                <h2>{student.full}</h2>
                <p>
                  {student.age} anos · Mentoria: {student.teacher}
                </p>
              </div>
              <div className="profile-score">
                <b>{engagement(student)}</b>
                <small>ENGAJAMENTO</small>
              </div>
              <div className="profile-score wellbeing">
                <b>{well(student)}%</b>
                <small>BEM-ESTAR</small>
              </div>
              <div className="profile-progress">
                {[
                  ["Média geral", Math.round(average(student) * 10), "#60c5ff"],
                  ["Bem-estar", well(student), "#3ef0cf"],
                  ["Frequência", student.attendance, "#ffca57"],
                  ["Foco & criatividade", focus(student), "#c49bff"],
                ].map(([label, value, color]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{value}%</b>
                    <i>
                      <em style={{ width: `${value}%`, background: color }} />
                    </i>
                  </div>
                ))}
              </div>
              <div
                className="routine-simulations"
                aria-label="Simulações demonstrativas"
              >
                <span>Simular rotina</span>
                <button
                  type="button"
                  onClick={() => simulateStudentScenario("project")}
                  title="Simular avanço em projeto criativo"
                >
                  🎨 Projeto
                </button>
                <button
                  type="button"
                  onClick={() => simulateStudentScenario("exam")}
                  title="Simular semana de avaliações"
                >
                  📝 Avaliações
                </button>
                <button
                  type="button"
                  onClick={() => simulateStudentScenario("rest")}
                  title="Simular rotina com mais descanso"
                >
                  🌿 Descanso
                </button>
                <small>
                  Atualiza apenas estes dados demonstrativos nesta sessão.
                </small>
              </div>
            </section>
          )}
          {tab === "home" && (
            <>
              <div className="section-heading">
                <div>
                  <h2>
                    Visão geral{" "}
                    <small>Resumo ilustrativo · atualização local</small>
                  </h2>
                  <p>
                    Resumo do desenvolvimento de {student.name} nesta semana.
                  </p>
                </div>
                <button className="soft-button">Últimos 7 dias⌄</button>
              </div>
              <section className="stats-grid">
                <Metric
                  icon="📘"
                  name="Média escolar"
                  value={average(student).toFixed(1)}
                  suffix="/ 10"
                  color="purple"
                  hint="Média das disciplinas cadastradas"
                />
                <Metric
                  icon="💚"
                  name="Bem-estar"
                  value={well(student)}
                  suffix="%"
                  color="green"
                  hint="Índice estimado pelos check-ins"
                />
                <Metric
                  icon="⚡"
                  name="Engajamento"
                  value={engagement(student)}
                  suffix="%"
                  color="orange"
                  hint="Muito bom · acima da média"
                />
                <Metric
                  icon="🎯"
                  name="Frequência"
                  value={student.attendance}
                  suffix="%"
                  color="blue"
                  hint="Frequência demonstrativa do período"
                />
              </section>
              <section className="dashboard-grid">
                <div className="panel emotion-panel">
                  <div className="panel-title">
                    <div>
                      <h3>Como está se sentindo?</h3>
                      <p>Check-in emocional recente</p>
                    </div>
                    <button className="dots">···</button>
                  </div>
                  <div className="mood-summary">
                    <div className="mood-face">
                      {student.checkins.length ? "📝" : "🌿"}
                    </div>
                    <div>
                      <b>
                        {student.checkins.length
                          ? `Check-in: ${student.checkins[0].mood}`
                          : "Nenhum check-in recente"}
                      </b>
                      <small>
                        {student.checkins.length
                          ? `${student.checkins[0].date} · Energia ${student.checkins[0].energy}`
                          : "Convide seu filho a responder ao quiz emocional"}
                      </small>
                    </div>
                    <span className="mood-tag">
                      {student.checkins.length ? "REGISTRADO" : "SEM REGISTRO"}
                    </span>
                  </div>
                  <div className="emotion-bars">
                    {[
                      ["Felicidade", student.pos[4], "#f2af56"],
                      ["Motivação", student.pos[3], "#8c71e8"],
                      ["Ansiedade", student.neg[4], "#ef8d9c"],
                    ].map(([n, v, c]) => (
                      <div className="emotion-line" key={n}>
                        <span>{n}</span>
                        <div className="track">
                          <div style={{ width: `${v}%`, background: c }} />
                        </div>
                        <b>{v}%</b>
                      </div>
                    ))}
                  </div>
                  <button
                    className="inline-link"
                    onClick={() => navigateTab("emotions")}
                  >
                    Ver perfil emocional <ChevronRight size={15} />
                  </button>
                </div>
                <div className="panel grades-panel">
                  <div className="panel-title">
                    <div>
                      <h3>Desempenho escolar</h3>
                      <p>Notas mais recentes</p>
                    </div>
                    <button className="dots">···</button>
                  </div>
                  <div className="grade-overview">
                    <strong>{average(student).toFixed(1)}</strong>
                    <span>/ 10</span>
                    <small>
                      média geral <b>↑ 0,4</b>
                    </small>
                  </div>
                  <div className="grade-lines">
                    {student.grades.slice(0, 4).map(([n, v], i) => (
                      <div className="grade-line" key={n}>
                        <span>{n}</span>
                        <div className="track">
                          <div
                            style={{
                              width: `${v * 10}%`,
                              background: [
                                "#8871e8",
                                "#55bb9b",
                                "#f3ae59",
                                "#76a9ef",
                              ][i],
                            }}
                          />
                        </div>
                        <b>{v.toFixed(1)}</b>
                      </div>
                    ))}
                  </div>
                  <button
                    className="inline-link"
                    onClick={() => navigateTab("grades")}
                  >
                    Acessar boletim completo <ChevronRight size={15} />
                  </button>
                </div>
                <div className="panel insight-panel">
                  <div className="insight-icon">
                    <Sparkles size={19} />
                  </div>
                  <div className="insight-copy">
                    <span className="eyebrow">INSIGHT DA SEMANA</span>
                    <h3>Uma semana de boas descobertas</h3>
                    <p>
                      O bem-estar exibido vem de autorrelatos simulados; as
                      notas são uma amostra separada. Os dados não demonstram
                      causa ou correlação. Use o check-in para iniciar uma
                      conversa acolhedora.
                    </p>
                    <button
                      className="inline-link"
                      onClick={() => navigateTab("insights")}
                    >
                      Explorar insights <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="insight-art">✦</div>
                </div>
                <div className="panel activity-panel">
                  <div className="panel-title">
                    <div>
                      <h3>Próximos momentos</h3>
                      <p>Eventos demonstrativos · confirme com a escola</p>
                    </div>
                    <button className="inline-link">
                      Ver agenda <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="event">
                    <div className="event-date">
                      <b>12</b>
                      <small>NOV</small>
                    </div>
                    <div>
                      <b>Conversa com a professora</b>
                      <small>12 nov · 16:30 · evento demonstrativo</small>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                  <div className="event">
                    <div className="event-date peach-date">
                      <b>18</b>
                      <small>NOV</small>
                    </div>
                    <div>
                      <b>Mostra de projetos escolares</b>
                      <small>18 nov · 14:00 · evento demonstrativo</small>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                  <button
                    className={rsvp ? "rsvp-button confirmed" : "rsvp-button"}
                    onClick={() => setRsvp((v) => !v)}
                  >
                    {rsvp
                      ? "✓ Presença sinalizada (local)"
                      : "Confirmar interesse · demonstração"}
                  </button>
                </div>
              </section>
            </>
          )}
          {tab === "emotions" && (
            <section>
              <Subnav
                active={subTab}
                onSelect={setSubTab}
                items={[
                  ["mapa", "💚 Mapa emocional"],
                  ["gatilhos", "🔍 Contexto & gatilhos"],
                  ["acolhimento", "🧭 Plano de acolhimento"],
                ]}
              />
              {subTab === "mapa" && (
                <div className="emotion-pro-grid">
                  <div className="panel emotion-pro-card positive-card">
                    <div className="emotion-card-heading">
                      <div>
                        <h3>✨ Potências & emoções positivas</h3>
                        <p>
                          Forças que estão florescendo · autorrelato simulado
                        </p>
                      </div>
                      <span className="emotion-total">
                        {Math.round(student.pos.reduce((a, b) => a + b, 0) / 5)}
                        % média
                      </span>
                    </div>
                    {positive.map((x, i) => (
                      <EmotionRow
                        key={x}
                        name={x}
                        value={student.pos[i]}
                        positive
                      />
                    ))}
                  </div>
                  <div className="panel emotion-pro-card attention-card">
                    <div className="emotion-card-heading">
                      <div>
                        <h3>🌧 Emoções para acolher</h3>
                        <p>Não são diagnóstico; convide à conversa</p>
                      </div>
                      <span className="emotion-total rose-total">
                        {Math.round(student.neg.reduce((a, b) => a + b, 0) / 5)}
                        % média
                      </span>
                    </div>
                    {negative.map((x, i) => (
                      <EmotionRow key={x} name={x} value={student.neg[i]} />
                    ))}
                  </div>
                  <div className="panel family-guidance">
                    <span className="guidance-icon">✧</span>
                    <div>
                      <h3>Como ler estes indicadores</h3>
                      <p>
                        As escalas são exemplos de autorrelato e não definem a
                        personalidade nem medem saúde clínica. Use-as como
                        convite para escutar, não como rótulo.
                      </p>
                    </div>
                    <button
                      className="primary-button"
                      onClick={() => navigateTab("quiz")}
                    >
                      Fazer check-in <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
              {subTab === "gatilhos" && (
                <div className="trigger-grid">
                  {student.triggers.map(
                    ([title, type, description, metric], i) => (
                      <article className="panel trigger-card" key={title}>
                        <span
                          className={
                            i ? "trigger-tag caution" : "trigger-tag positive"
                          }
                        >
                          {type}
                        </span>
                        <h3>{title}</h3>
                        <p>{description}</p>
                        <small>
                          Possível tema para conversa: {metric}. Exemplo
                          demonstrativo, não causa comprovada.
                        </small>
                      </article>
                    ),
                  )}
                </div>
              )}
              {subTab === "acolhimento" && (
                <div className="panel family-plan">
                  <div className="plan-heading">
                    <span>🧭</span>
                    <div>
                      <h3>Plano familiar de apoio · {student.name}</h3>
                      <p>
                        Sugestões para diálogo; adaptem à rotina e à vontade do
                        estudante.
                      </p>
                    </div>
                  </div>
                  {student.plan.map((item, i) => (
                    <div className="plan-step" key={item}>
                      <b>{String(i + 1).padStart(2, "0")}</b>
                      <span>{item}</span>
                    </div>
                  ))}
                  <p className="gentle-note">
                    Se surgir sofrimento persistente ou risco, procure um
                    profissional qualificado ou serviço de saúde. Este app não
                    substitui avaliação.
                  </p>
                </div>
              )}
            </section>
          )}
          {tab === "grades" && (
            <section>
              <Subnav
                active={subTab}
                onSelect={setSubTab}
                items={[
                  ["boletim", "📚 Boletim comparativo"],
                  ["metas", "🎯 Plano de estudo"],
                  ["competencias", "🧠 Competências"],
                ]}
              />
              {subTab === "boletim" && (
                <>
                  <div className="grade-summary-grid">
                    <div className="panel grade-summary">
                      <small>MÉDIA ATUAL</small>
                      <b>
                        {average(student).toFixed(1)}
                        <i>/10</i>
                      </b>
                      <span>calculada pelas 8 notas de exemplo</span>
                    </div>
                    <div className="panel grade-summary">
                      <small>ASSIDUIDADE (SIMULADA)</small>
                      <b>
                        {student.attendance}
                        <i>%</i>
                      </b>
                      <span>não é dado oficial da escola</span>
                    </div>
                    <div className="panel grade-summary">
                      <small>MATÉRIA PARA REVISAR</small>
                      <b>
                        {
                          student.grades.reduce((a, b) =>
                            a[1] < b[1] ? a : b,
                          )[0]
                        }
                      </b>
                      <span>menor nota nesta amostra</span>
                    </div>
                  </div>
                  <div className="panel full-panel">
                    <div className="grade-panel-heading">
                      <div>
                        <h3>Notas por disciplina</h3>
                        <p>
                          Comparação ilustrativa com o período anterior · sem
                          boletim oficial
                        </p>
                      </div>
                      <div className="grade-filters">
                        {[
                          ["all", "Todas"],
                          ["high", "Destaques"],
                          ["attention", "Revisar"],
                        ].map(([id, label]) => (
                          <button
                            className={
                              gradeFilter === id
                                ? "filter-btn active"
                                : "filter-btn"
                            }
                            onClick={() => setGradeFilter(id)}
                            key={id}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {[...student.grades]
                      .sort((a, b) => b[1] - a[1])
                      .filter(([, grade]) =>
                        gradeFilter === "high"
                          ? grade >= 8.5
                          : gradeFilter === "attention"
                            ? grade < 8.3
                            : true,
                      )
                      .map(([subject, grade]) => {
                        const previous =
                          student.previousGrades[
                            student.grades.findIndex((x) => x[0] === subject)
                          ];
                        const diff = grade - previous;
                        return (
                          <div className="subject" key={subject}>
                            <span>{subject}</span>
                            <div className="track">
                              <div style={{ width: `${grade * 10}%` }} />
                            </div>
                            <b>{grade.toFixed(1)}</b>
                            <small>
                              anterior {previous.toFixed(1)} ·{" "}
                              {diff >= 0 ? "+" : ""}
                              {diff.toFixed(1)}
                            </small>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
              {subTab === "metas" && (
                <div className="panel family-plan">
                  <div className="plan-heading">
                    <span>🎯</span>
                    <div>
                      <h3>Meta de estudo — {student.name}</h3>
                      <p>
                        Objetivo proposto para organização pessoal, sem promessa
                        de resultado.
                      </p>
                    </div>
                  </div>
                  <div className="goal-callout">{student.goal}</div>
                  <div className="study-routine">
                    {[
                      [
                        "SEG / QUA",
                        "Revisão de base",
                        "25–30 min de exercícios, com pausa.",
                      ],
                      [
                        "TER / QUI",
                        "Prática aplicada",
                        "Resolver questões e registrar dúvidas.",
                      ],
                      [
                        "SEX / FIM DE SEMANA",
                        "Revisão leve e descanso",
                        "Planejar a próxima semana sem abrir mão do lazer.",
                      ],
                    ].map(([day, title, description]) => (
                      <article className="routine-card" key={day}>
                        <small>{day}</small>
                        <b>{title}</b>
                        <p>{description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
              {subTab === "competencias" && (
                <div className="panel full-panel">
                  <h3>Competências em desenvolvimento</h3>
                  <p>
                    Rubrica demonstrativa inspirada em competências escolares.
                    Não é avaliação oficial da BNCC.
                  </p>
                  {student.skills.map(([name, value]) => (
                    <div className="skill-row" key={name}>
                      <div>
                        <b>{name}</b>
                        <span>
                          {value >= 90
                            ? "Destaque"
                            : value >= 80
                              ? "Em consolidação"
                              : "Meta de prática"}
                        </span>
                      </div>
                      <strong>{value}%</strong>
                      <div className="track">
                        <div style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {tab === "quiz" && (
            <section>
              <Subnav
                active={subTab}
                onSelect={setSubTab}
                items={[
                  ["checkin", "🧩 Check-in de hoje"],
                  ["historico", "🕒 Diário de check-ins"],
                ]}
              />
              {subTab === "checkin" && (
                <div className="quiz-pro">
                  <div className="quiz-card">
                    <div className="quiz-kicker">
                      <Brain size={15} /> CHECK-IN SOCIOEMOCIONAL · 1 MINUTO
                    </div>
                    <h2>Como foi seu dia, {student.name}?</h2>
                    <p>
                      Responda às três perguntas. É um registro de percepção
                      pessoal, não uma avaliação clínica.
                    </p>
                    <div className="quiz-question-list">
                      {quizQuestions.map((q, index) => (
                        <fieldset className="quiz-question" key={q.id}>
                          <legend>
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            {q.title}
                          </legend>
                          <div className="quiz-options">
                            {q.options.map(([emoji, label], choice) => (
                              <button
                                type="button"
                                key={label}
                                className={
                                  quizAnswers[q.id] === choice
                                    ? "quiz-answer chosen"
                                    : "quiz-answer"
                                }
                                aria-pressed={quizAnswers[q.id] === choice}
                                onClick={() => {
                                  setQuizAnswers((v) => ({
                                    ...v,
                                    [q.id]: choice,
                                  }));
                                  setQuizDone(false);
                                }}
                              >
                                <span className="quiz-emoji">{emoji}</span>
                                <small>{label}</small>
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      ))}
                    </div>
                    <label className="quiz-note-label">
                      Observação rápida (opcional)
                      <input
                        value={quizNote}
                        onChange={(e) => setQuizNote(e.target.value)}
                        maxLength={180}
                        placeholder="Uma conquista, dúvida ou algo que queira compartilhar…"
                      />
                    </label>
                    {quizDone ? (
                      <div className="quiz-feedback">
                        <Check size={16} /> Check-in salvo. Indicadores
                        atualizados e +25 pontos demonstrativos.
                      </div>
                    ) : (
                      <button
                        className="primary-button submit-quiz"
                        disabled={
                          Object.keys(quizAnswers).length !==
                          quizQuestions.length
                        }
                        onClick={submitQuiz}
                      >
                        Registrar check-in <ChevronRight size={15} />
                      </button>
                    )}
                    <div className="quiz-disclaimer">
                      🔒 Respostas simuladas neste protótipo e mantidas apenas
                      durante esta sessão. Elas não são diagnóstico nem
                      substituem conversa com a família ou apoio profissional.
                    </div>
                  </div>
                  <aside className="quiz-history panel">
                    <span className="history-mark">✧</span>
                    <h3>Registro recente</h3>
                    {student.checkins.length ? (
                      student.checkins.slice(0, 3).map((c, i) => (
                        <div className="checkin-entry" key={i}>
                          <b>{c.date}</b>
                          <p>
                            Humor: {c.mood} · Energia: {c.energy}
                          </p>
                          <small>Precisava de: {c.support}</small>
                        </div>
                      ))
                    ) : (
                      <p>
                        Ainda não há check-ins registrados. Este espaço guarda
                        os registros feitos nesta sessão.
                      </p>
                    )}
                    <div className="quiet-note">
                      Um dia difícil também faz parte. O importante é poder
                      falar sobre isso com segurança.
                    </div>
                  </aside>
                </div>
              )}
              {subTab === "historico" && (
                <div className="panel full-panel">
                  <h3>Diário emocional · {student.name}</h3>
                  <p>
                    Registros feitos nesta sessão neste protótipo; não são
                    armazenados em servidor.
                  </p>
                  {student.checkins.length ? (
                    student.checkins.map((c, i) => (
                      <article className="checkin-entry" key={i}>
                        <b>{c.date}</b>
                        <p>
                          Humor: {c.mood} · Energia: {c.energy} · Apoio:{" "}
                          {c.support}
                        </p>
                        {c.note && <small>{c.note}</small>}
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">
                      Nenhum check-in registrado ainda. Os registros aparecerão
                      aqui depois de responder às três perguntas.
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
          {tab === "insights" && (
            <section>
              <Subnav
                active={subTab}
                onSelect={setSubTab}
                items={[
                  ["visao", "📈 Painel gráfico"],
                  ["matriz", "🔬 Hábitos & contexto"],
                ]}
              />
              {subTab === "visao" && (
                <>
                  <section
                    className="rings-grid"
                    aria-label="Indicadores circulares"
                  >
                    {[
                      {
                        label: "Bem-estar",
                        value: well(student),
                        color: "#35dfc0",
                      },
                      { label: "Foco", value: student.focus, color: "#63c8ff" },
                      {
                        label: "Desempenho",
                        value: Math.round(average(student) * 10),
                        color: "#aa82ff",
                      },
                      {
                        label: "Frequência",
                        value: student.attendance,
                        color: "#ffbd59",
                      },
                    ].map(({ label, value, color }) => (
                      <article className="ring-card" key={label}>
                        <div
                          className="ring-visual"
                          role="progressbar"
                          aria-label={`${label}, dado demonstrativo`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={value}
                          style={{
                            "--ring-color": color,
                            "--ring-progress": `${Math.max(0, Math.min(100, value)) * 3.6}deg`,
                          }}
                        >
                          <span>{value}%</span>
                        </div>
                        <div className="ring-copy">
                          <b>{label}</b>
                          <small>Indicador demonstrativo</small>
                        </div>
                      </article>
                    ))}
                  </section>
                  <div className="charts-pro-grid">
                    <div className="panel chart-pro-card">
                      <div className="chart-heading">
                        <div>
                          <h3>Indicador semanal</h3>
                          <p>Série ilustrativa atualizada após check-in</p>
                        </div>
                        <span>8 SEM.</span>
                      </div>
                      <div className="chart-bars">
                        {student.history.map((v, i) => (
                          <div
                            className="bar-group"
                            key={i}
                            title={`Semana ${i + 1}: ${v}`}
                          >
                            <b>{v}</b>
                            <div className="bar" style={{ height: `${v}%` }} />
                            <small>S{i + 1}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="panel chart-pro-card">
                      <div className="chart-heading">
                        <div>
                          <h3>Notas por disciplina</h3>
                          <p>Média atual: {average(student).toFixed(1)} / 10</p>
                        </div>
                        <span>SIMULADO</span>
                      </div>
                      <div className="grade-chart">
                        {student.grades.map(([name, value]) => (
                          <div key={name} title={`${name}: ${value}`}>
                            <span>{name.slice(0, 4)}</span>
                            <i>
                              <em style={{ width: `${value * 10}%` }} />
                            </i>
                            <b>{value.toFixed(1)}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="panel chart-pro-card">
                      <div className="chart-heading">
                        <div>
                          <h3>Radar emocional</h3>
                          <p>5 forças · autorrelato ilustrativo</p>
                        </div>
                        <span>{well(student)}%</span>
                      </div>
                      <div className="radar-list">
                        {positive.map((name, i) => (
                          <div key={name}>
                            <span>{name}</span>
                            <i>
                              <em style={{ width: `${student.pos[i]}%` }} />
                            </i>
                            <b>{student.pos[i]}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="panel chart-footnote">
                      <Sparkles size={18} />
                      <p>
                        Os gráficos descrevem apenas a amostra simulada desta
                        demonstração. Não permitem concluir relações de causa e
                        efeito entre bem-estar e notas.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {subTab === "matriz" && (
                <div className="context-grid">
                  <div className="panel context-intro">
                    <span>🔬</span>
                    <div>
                      <h3>Hábitos e contexto escolar</h3>
                      <p>
                        Uma organização para apoiar conversas, não um
                        diagnóstico nem uma correlação validada. Sono e foco
                        abaixo são valores fictícios de demonstração.
                      </p>
                    </div>
                  </div>
                  <div className="panel context-card">
                    <small>ROTINA · SIMULADA</small>
                    <b>
                      {student.sleep} <i>de sono ilustrativo</i>
                    </b>
                    <p>
                      Converse com {student.name} sobre descanso e rotina; não
                      trate este número como medição real.
                    </p>
                  </div>
                  <div className="panel context-card">
                    <small>ASSIDUIDADE · SIMULADA</small>
                    <b>{student.attendance}%</b>
                    <p>
                      Exemplo de frequência para demonstrar o painel. Confirme
                      dados oficiais diretamente com a escola.
                    </p>
                  </div>
                  <div className="panel context-card">
                    <small>OBJETIVO ACADÊMICO · SUGESTÃO</small>
                    <b>
                      {
                        student.grades.reduce((a, b) =>
                          a[1] < b[1] ? a : b,
                        )[0]
                      }
                    </b>
                    <p>{student.goal}</p>
                  </div>
                </div>
              )}
            </section>
          )}
          {tab === "chat" && (
            <section>
              <Subnav
                active={subTab}
                onSelect={setSubTab}
                items={[
                  ["mensagens", "💬 Mensagens"],
                  ["pareceres", `📋 Pareceres (${student.reports.length})`],
                ]}
              />
              {subTab === "mensagens" && (
                <div className="chat-panel panel">
                  <div className="chat-head">
                    <div className="teacher-avatar">👩🏻‍🏫</div>
                    <div>
                      <b>{student.teacher}</b>
                      <small>
                        Protótipo demonstrativo · mensagens não são enviadas à
                        escola
                      </small>
                    </div>
                    <span className="online">● Canal demonstrativo</span>
                  </div>
                  <div className="chat-messages">
                    {(student.messages || []).map((m, i) => (
                      <div
                        className={`message ${m.from === "you" ? "mine" : ""}`}
                        key={i}
                      >
                        {m.text}
                        <small>{m.time || "Registro demonstrativo"}</small>
                      </div>
                    ))}
                  </div>
                  <div className="chat-compose">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Escreva uma mensagem para a professora..."
                    />
                    <button onClick={send}>
                      <Send size={17} />
                    </button>
                  </div>
                </div>
              )}
              {subTab === "pareceres" && (
                <div className="reports-grid">
                  {student.reports.map(([author, date, badge, text]) => (
                    <article className="panel report-card" key={author}>
                      <div className="report-meta">
                        <b>{author}</b>
                        <span>{date}</span>
                      </div>
                      <small>{badge} · relato demonstrativo</small>
                      <p>{text}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      {compareOpen && (
        <div
          className="compare-overlay"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setCompareOpen(false)
          }
        >
          <section
            className="compare-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-title"
          >
            <div className="compare-head">
              <h2 id="compare-title">Comparativo familiar</h2>
              <button
                className="compare-close"
                onClick={() => setCompareOpen(false)}
              >
                Fechar ×
              </button>
            </div>
            <p className="compare-legend">
              Amostras fictícias para comparação visual · não representam
              avaliação escolar oficial.
            </p>
            <div className="compare-row">
              <span>Estudante</span>
              <b>Média</b>
              <b>Bem-estar</b>
              <b>Engaj.</b>
            </div>
            {students.map((s) => (
              <div className="compare-row" key={s.id}>
                <span>
                  {s.emoji} {s.name}
                </span>
                <b>{average(s).toFixed(1)}</b>
                <b>{well(s)}%</b>
                <b>{engagement(s)}%</b>
              </div>
            ))}
          </section>
        </div>
      )}
      <nav className="mobile-tabs">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            className={tab === id ? "on" : ""}
            onClick={() => navigateTab(id)}
          >
            <Icon size={19} />
            <small>{label === "Quiz emocional" ? "Quiz" : label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
