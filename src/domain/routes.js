const tabPaths = {
  home: "visao-geral",
  emotions: "filhos/emocoes",
  grades: "notas",
  quiz: "quiz-emocional",
  insights: "graficos",
  chat: "mensagens",
};
const pathTabs = Object.fromEntries(
  Object.entries(tabPaths).map(([tab, path]) => [path, tab]),
);
const studentSlugs = { 1: "isabela", 2: "gabriel", 3: "manuela" };
const slugStudents = Object.fromEntries(
  Object.entries(studentSlugs).map(([id, slug]) => [slug, Number(id)]),
);

function cleanBase(base) {
  const segments = String(base || "/")
    .split("/")
    .filter(Boolean);
  return segments.length ? `/${segments.join("/")}/` : "/";
}

function versionPrefix(path) {
  return /(?:^|\/)att1\.1(?:\/|$)/.test(path) ? "att1.1/" : "";
}

export function appUrl(tab, studentId = 1, base = "/", version = "") {
  const route = tabPaths[tab] || tabPaths.home;
  const prefix = cleanBase(base);
  const url = `${prefix}${version === "att1.1" ? "att1.1/" : ""}${route}`;
  const slug = studentSlugs[studentId];
  return slug && studentId !== 1 ? `${url}?filho=${slug}` : url;
}

export function parseAppUrl(pathname, search = "", base = "/") {
  const prefix = cleanBase(base);
  let relative = String(pathname || "/");
  if (relative.startsWith(prefix)) relative = relative.slice(prefix.length);
  else relative = relative.replace(/^\/+/, "");
  const version = versionPrefix(relative) ? "att1.1" : "current";
  relative = relative.replace(/^att1\.1\/?/, "").replace(/\/+$/, "");
  const tab = pathTabs[relative] || "home";
  const params = new URLSearchParams(search);
  const studentId = slugStudents[params.get("filho")?.toLowerCase()] || 1;
  return { tab, studentId, version };
}
