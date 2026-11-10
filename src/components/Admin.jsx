import React, { useMemo, useState } from "react";
import { Building2, GraduationCap, Users, School, BriefcaseBusiness, Plus, Search, Trash2, CheckCircle2 } from "lucide-react";

const modules = [
  { id: "companies", label: "Empresas e escolas", icon: Building2, singular: "empresa" },
  { id: "students", label: "Alunos", icon: GraduationCap, singular: "aluno" },
  { id: "classes", label: "Turmas", icon: School, singular: "turma" },
  { id: "teachers", label: "Professores", icon: BriefcaseBusiness, singular: "professor" },
  { id: "guardians", label: "Responsáveis", icon: Users, singular: "responsável" },
];

const fields = {
  companies: [
    ["cnpj", "CNPJ", "text", "00.000.000/0000-00"],
    ["legalName", "Razão social", "text", "Razão social da instituição"],
    ["tradeName", "Nome fantasia", "text", "Nome de divulgação"],
    ["address", "Endereço completo", "text", "Rua, número, bairro, cidade e UF"],
    ["companyType", "Tipo de empresa", "select", ["Escola", "Tecnologia", "Reforço escolar", "Consultoria educacional", "Outro"]],
    ["contact", "E-mail ou telefone institucional", "text", "contato@instituicao.com.br"],
  ],
  students: [
    ["name", "Nome completo do aluno", "text", "Nome do estudante"],
    ["birthDate", "Data de nascimento", "date", ""],
    ["guardianNames", "Nome(s) do(s) responsável(is)", "text", "Responsável legal"],
    ["school", "Nome da escola", "text", "Instituição de ensino"],
    ["className", "Turma", "text", "Ex.: 8º ano A"],
    ["status", "Situação", "select", ["Ativo", "Inativo", "Aguardando matrícula"]],
  ],
  classes: [
    ["name", "Nome da turma", "text", "Ex.: 8º ano A"],
    ["school", "Nome da escola", "text", "Instituição de ensino"],
    ["teacher", "Nome do professor responsável", "text", "Professor titular"],
    ["grade", "Etapa / série", "text", "Ex.: Ensino Fundamental II"],
    ["shift", "Turno", "select", ["Matutino", "Vespertino", "Noturno", "Integral"]],
    ["year", "Ano letivo", "number", "2026"],
  ],
  teachers: [
    ["name", "Nome completo", "text", "Nome do professor"],
    ["email", "E-mail profissional", "email", "professor@escola.com.br"],
    ["phone", "Telefone", "tel", "(00) 00000-0000"],
    ["school", "Escola / instituição", "text", "Instituição vinculada"],
    ["subjects", "Disciplinas / área", "text", "Ex.: Matemática, Ciências"],
  ],
  guardians: [
    ["name", "Nome completo do responsável", "text", "Nome do responsável"],
    ["relationship", "Vínculo com o aluno", "select", ["Mãe", "Pai", "Avó/Avô", "Tutor(a) legal", "Outro"]],
    ["email", "E-mail", "email", "responsavel@email.com"],
    ["phone", "Telefone", "tel", "(00) 00000-0000"],
    ["student", "Aluno(s) vinculado(s)", "text", "Nome do(s) aluno(s)"],
  ],
};

const emptyRecord = (keys) => Object.fromEntries(keys.map((key) => [key, ""]));

export default function Admin() {
  const [active, setActive] = useState("companies");
  const [records, setRecords] = useState({ companies: [], students: [], classes: [], teachers: [], guardians: [] });
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const current = modules.find((item) => item.id === active);
  const currentFields = fields[active];
  const visibleRecords = useMemo(() => records[active].filter((record) =>
    Object.values(record).join(" ").toLowerCase().includes(search.toLowerCase())
  ), [records, active, search]);

  const selectModule = (id) => {
    setActive(id);
    setForm(emptyRecord(fields[id].map(([key]) => key)));
    setSearch("");
    setNotice("");
  };
  const save = (event) => {
    event.preventDefault();
    const required = currentFields.filter(([key]) => !String(form[key] || "").trim());
    if (required.length) {
      setNotice("Preencha os campos antes de salvar.");
      return;
    }
    setRecords((previous) => ({
      ...previous,
      [active]: [...previous[active], { ...form, id: `${active}-${Date.now()}` }],
    }));
    setForm(emptyRecord(currentFields.map(([key]) => key)));
    setNotice(`${current.singular[0].toUpperCase() + current.singular.slice(1)} cadastrado(a) nesta demonstração.`);
  };
  const remove = (id) => setRecords((previous) => ({
    ...previous,
    [active]: previous[active].filter((record) => record.id !== id),
  }));

  return (
    <section className="admin-area">
      <div className="admin-intro">
        <div>
          <span className="admin-kicker">PAINEL DE CONTROLE · DEMONSTRAÇÃO</span>
          <h2>Gestão Administrativa</h2>
          <p>Organize instituições, estudantes, equipes e turmas em um único ambiente.</p>
        </div>
        <div className="admin-status"><CheckCircle2 size={16} /> Ambiente de demonstração</div>
      </div>
      <div className="admin-layout">
        <aside className="admin-menu" aria-label="Módulos administrativos">
          {modules.map(({ id, label, icon: Icon }) => (
            <button key={id} className={active === id ? "admin-menu-item active" : "admin-menu-item"} onClick={() => selectModule(id)}>
              <Icon size={18} /><span>{label}</span><b>{records[id].length}</b>
            </button>
          ))}
        </aside>
        <div className="admin-workspace">
          <div className="admin-module-heading">
            <div><span>CADASTROS</span><h3>{current.label}</h3><p>Adicione e consulte registros do módulo selecionado.</p></div>
            <div className="admin-count">{records[active].length} registro(s)</div>
          </div>
          <div className="admin-columns">
            <form className="panel admin-form" onSubmit={save}>
              <div className="admin-card-title"><Plus size={18} /><h4>Novo cadastro</h4></div>
              <div className="admin-fields">
                {currentFields.map(([key, label, type, option]) => (
                  <label key={key} className={type === "text" && key === "address" ? "wide" : ""}>
                    <span>{label} <i>*</i></span>
                    {type === "select" ? (
                      <select value={form[key] || ""} onChange={(event) => setForm((old) => ({ ...old, [key]: event.target.value }))}>
                        <option value="">Selecione</option>
                        {option.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={form[key] || ""} placeholder={option} onChange={(event) => setForm((old) => ({ ...old, [key]: event.target.value }))} />
                    )}
                  </label>
                ))}
              </div>
              <p className="admin-required-note">* Campos obrigatórios nesta demonstração.</p>
              <button className="primary-button admin-submit" type="submit">Salvar cadastro <Plus size={16} /></button>
              {notice && <p className="admin-notice" role="status">{notice}</p>}
            </form>
            <div className="panel admin-records">
              <div className="admin-card-title"><Users size={18} /><h4>Registros cadastrados</h4></div>
              <label className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar ${current.singular}...`} /></label>
              {visibleRecords.length ? (
                <div className="admin-record-list">
                  {visibleRecords.map((record) => {
                    const primary = record.name || record.legalName || record.name;
                    const secondary = record.school || record.companyType || record.email || record.address;
                    return <article className="admin-record" key={record.id}>
                      <div><b>{primary || record.tradeName || "Registro"}</b><small>{secondary || "Dados cadastrados"}</small></div>
                      <button type="button" aria-label="Excluir registro demonstrativo" onClick={() => remove(record.id)}><Trash2 size={16} /></button>
                    </article>;
                  })}
                </div>
              ) : <div className="admin-empty"><span>▤</span><b>Nenhum registro por aqui</b><p>Os cadastros adicionados aparecerão nesta lista.</p></div>}
            </div>
          </div>
          <div className="admin-privacy-note"><b>Privacidade e segurança:</b> os dados ficam somente no estado temporário desta página e são perdidos ao recarregar. Não cadastre informações reais de crianças, responsáveis ou escolas. Para uso real, será necessário backend protegido, autenticação, perfis de acesso, consentimentos e controles alinhados à LGPD.</div>
        </div>
      </div>
    </section>
  );
}
