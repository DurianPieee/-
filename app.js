const competitions = Array.isArray(window.LCU_COMPETITIONS) ? window.LCU_COMPETITIONS : [];
const trainingPlans = Array.isArray(window.LCU_TRAINING_PLANS) ? window.LCU_TRAINING_PLANS : [];
const app = document.getElementById("app");
const levelOrder = ["A+", "A", "B", "C", "D"];
const gradeText = {
  "A+": "学校认定的具有重大影响力的综合类国际、全国性竞赛项目。",
  A: "学校认定的有影响力的国际、全国性竞赛项目。",
  B: "学校认定的全国性、行业性等学科竞赛项目。",
  C: "学校认定的省级竞赛或符合规定的其他赛事。",
  D: "学校主办的全校性学科竞赛项目。"
};
const recommendedSubjects = ["物理与力学类", "电子与电气类", "计算机与信息技术类", "机器人与智能类", "信息安全类", "数学与统计类"];
const state = {
  news: Array.isArray(window.LCU_NEWS_SEED) ? window.LCU_NEWS_SEED : [],
  newsUpdatedAt: "初始资料",
  catalogMode: "level",
  levelFilter: "全部",
  subjectFilter: "全部",
  search: "",
  policyTab: "plans"
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[character]));
}

function safeHref(value) {
  if (String(value).startsWith("assets/") && !String(value).includes("..")) return escapeHtml(value);
  try {
    const url = new URL(value, location.href);
    return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : "#";
  } catch {
    return "#";
  }
}

function levelPill(level) {
  return `<span class="level-pill ${level === "A+" || level === "A" ? "high" : ""}">${escapeHtml(level)}</span>`;
}

function sectionHeading(index, label, title, description, link = "") {
  return `<div class="section-heading"><div><span class="eyebrow">${escapeHtml(index)} / ${escapeHtml(label)}</span><h2>${title}</h2></div><div>${description ? `<p>${escapeHtml(description)}</p>` : ""}${link}</div></div>`;
}

function pageHead(index, label, title, description) {
  return `<section class="page-head blueprint"><div class="eyebrow">${escapeHtml(index)} / ${escapeHtml(label)}</div><div class="head-line"><h1>${title}</h1><span class="head-index">LCU / COMPETITION ATLAS</span></div><p>${escapeHtml(description)}</p></section>`;
}

function newsRow(item, index) {
  return `<a class="news-row" href="${safeHref(item.url)}" target="_blank" rel="noopener noreferrer"><span class="news-date">${escapeHtml(item.date)}</span><span class="news-title"><span class="news-no">NEWS / ${String(index + 1).padStart(2, "0")}</span>${escapeHtml(item.title)}</span><span class="news-arrow">↗</span></a>`;
}

function renderHome() {
  const featuredIds = [34, 6, 46, 33, 5, 44];
  const cards = featuredIds.map((id, index) => {
    const item = competitions.find(competition => competition.id === id);
    if (!item) return "";
    return `<a class="feature-card" href="#/competition/${item.id}"><div class="card-top"><span class="card-index">FEATURED / ${String(index + 1).padStart(2, "0")}</span>${levelPill(item.level)}</div><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.subject)}</p></div><span class="card-arrow">↗</span></a>`;
  }).join("");
  return `<section class="hero blueprint"><div class="hero-copy"><span class="eyebrow">FIND YOUR NEXT COMPETITION</span><h1>下一场竞赛，<br>从这里<em>出发。</em></h1><p>把赛事级别、报名入口、备赛资料和学院动态放在同一个地方。找到方向，点开官网，然后开始准备。</p><div class="hero-actions"><a class="button accent" href="#/competitions">查找竞赛 <span>↗</span></a><a class="button" href="#/news">浏览最新消息 <span>↗</span></a></div></div><div class="hero-visual"><span class="index-no">FIG. 01 — PATHWAYS</span><div class="orbit"><div class="orbit-center"></div></div><span class="orbit-label one">DISCOVER / 发现</span><span class="orbit-label two">BUILD / 实践</span><div class="visual-bottom"><span>PHYSICS · ELECTRONICS · IC</span><span>01 / 03</span></div></div></section>
  <section class="data-strip"><div class="metric"><strong>${competitions.length}<small>项</small></strong><span>竞赛目录收录</span></div><div class="metric"><strong>${new Set(competitions.map(item => item.subject)).size}<small>类</small></strong><span>学科方向</span></div><div class="metric"><strong>15<small>条</small></strong><span>学院最新消息</span></div><div class="metric"><strong>08<small>份</small></strong><span>官方培养方案</span></div></section>
  <section class="section-pad">${sectionHeading("01", "FOCUS COMPETITIONS", "从专业出发，找到赛道。", "以下是与物理、光电、电子信息和集成电路等方向密切相关的赛事。", `<a class="text-link" href="#/competitions">查看全部竞赛 ↗</a>`)}<div class="feature-grid">${cards}</div></section>
  <section class="news-preview"><div class="news-preview-copy"><span class="eyebrow">02 / CAMPUS NEWS</span><h2>赛场之外，<br>消息也要快一步。</h2><p>同步学院官网“学生工作—学科竞赛”栏目，及时查看院内赛事、成绩与活动动态。</p><a class="button" href="#/news">查看全部消息 <span>↗</span></a></div><div class="news-preview-list">${state.news.slice(0, 3).map(newsRow).join("")}</div></section>`;
}

function filteredCompetitions() {
  const query = state.search.trim().toLowerCase();
  return competitions.filter(item => {
    const levelMatches = state.catalogMode !== "level" || state.levelFilter === "全部" || item.level === state.levelFilter;
    const subjectMatches = state.catalogMode !== "subject" || state.subjectFilter === "全部" || item.subject === state.subjectFilter;
    const textMatches = !query || [item.name, item.subject, item.organizer].some(text => String(text).toLowerCase().includes(query));
    return levelMatches && subjectMatches && textMatches;
  }).sort((left, right) => levelOrder.indexOf(left.level) - levelOrder.indexOf(right.level) || left.id - right.id);
}

function renderCatalogList() {
  const found = filteredCompetitions();
  const meta = document.getElementById("catalog-count");
  const list = document.getElementById("catalog-list");
  if (!meta || !list) return;
  meta.textContent = `共找到 ${found.length} 项竞赛`;
  list.innerHTML = found.length ? found.map(item => `<a class="catalog-item" href="#/competition/${item.id}"><span class="no">${String(item.id).padStart(3, "0")}</span><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.organizer || "学校竞赛目录")}</small></span><span class="subject">${escapeHtml(item.subject)}</span>${levelPill(item.level)}<span class="arrow">↗</span></a>`).join("") : `<div class="empty-state">没有找到符合条件的竞赛，请调整关键词或分类。</div>`;
}

function renderCompetitions() {
  const subjects = [...new Set(competitions.map(item => item.subject))].sort((left, right) => left.localeCompare(right, "zh-CN"));
  const mode = state.catalogMode;
  return `${pageHead("01", "COMPETITION DIRECTORY", "竞赛详情", "按学校认定级别或学科方向筛选，进入赛事详情后可直达官网。")}
  <section class="catalog-tools"><div class="segmented" role="group" aria-label="分类方式"><button data-mode="level" class="${mode === "level" ? "active" : ""}" aria-pressed="${mode === "level"}">按竞赛级别分类</button><button data-mode="subject" class="${mode === "subject" ? "active" : ""}" aria-pressed="${mode === "subject"}">按专业科目分类</button></div><div class="tool-row"><label class="search-wrap"><input id="catalog-search" type="search" autocomplete="off" placeholder="搜索竞赛名称、方向或主办单位" value="${escapeHtml(state.search)}" aria-label="搜索竞赛"></label>${mode === "subject" ? `<select id="subject-select" aria-label="选择学科方向"><option value="全部">全部学科方向</option>${subjects.map(subject => `<option value="${escapeHtml(subject)}" ${state.subjectFilter === subject ? "selected" : ""}>${escapeHtml(subject)}</option>`).join("")}</select>` : ""}</div><div class="filter-chips">${mode === "level" ? ["全部", ...levelOrder.filter(level => competitions.some(item => item.level === level))].map(level => `<button data-level="${escapeHtml(level)}" class="${state.levelFilter === level ? "active" : ""}">${level === "全部" ? "全部级别" : `${escapeHtml(level)} 类`}</button>`).join("") : ["全部", ...recommendedSubjects].map(subject => `<button data-subject="${escapeHtml(subject)}" class="${state.subjectFilter === subject ? "active" : ""}">${subject === "全部" ? "全部方向" : escapeHtml(subject)}</button>`).join("")}</div></section>
  <div class="catalog-meta"><span id="catalog-count"></span><span>级别以所附竞赛目录为准 · 当届要求请见赛事官网</span></div><div class="catalog-list" id="catalog-list"></div>`;
}

function resourceBox(title, index, links, item) {
  return `<div class="resource-box"><header>${escapeHtml(title)} <span>ARCHIVE / ${index}</span></header><div class="resource-content">${links.length ? links.map(link => `<a class="resource-link" href="${safeHref(link.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(link.title)}</span><span>↗</span></a>`).join("") : `<p class="resource-empty">暂未从该赛事官网核实到公开的${escapeHtml(title)}链接。可前往官网查看最新公布资料。</p><a class="text-link" href="${safeHref(item.officialUrl)}" target="_blank" rel="noopener noreferrer">到赛事官网查找 ↗</a>`}</div></div>`;
}

function renderCompetition(item) {
  const correction = item.urlCorrected ? `<p>目录所列旧地址与赛事不符，当前入口已按赛事官网核对更新。</p>` : `<p>该网址来自学校竞赛目录；赛事网站可能调整，报名时请核对网页标题与主办方。</p>`;
  return `<section class="detail-hero blueprint"><div class="detail-main"><div class="breadcrumb"><a href="#/">首页</a> / <a href="#/competitions">竞赛详情</a> / ${String(item.id).padStart(3, "0")}</div><span class="eyebrow">COMPETITION / ${String(item.id).padStart(3, "0")}</span><h1>${escapeHtml(item.name)}</h1><p>${escapeHtml(item.description)}</p><div class="detail-tags">${levelPill(item.level)}<span>${escapeHtml(item.subject)}</span><span>目录序号 ${item.id}</span></div></div><aside class="detail-side"><div><span class="route-label">DIRECT LINK / 竞赛入口</span><h2>从官网开始准备。</h2></div><a class="official-button" href="${safeHref(item.officialUrl)}" target="_blank" rel="noopener noreferrer"><span>前往竞赛官网 / 报名入口</span><span>↗</span></a><div class="url-text">${escapeHtml(item.officialUrl)}</div>${item.otherUrls.length ? `<div class="alternate-links">${item.otherUrls.map(link => `<a href="${safeHref(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.title)} 官网 ↗</a>`).join("")}</div>` : ""}${correction}</aside></section>
  <section class="info-grid"><div class="info-cell"><label>LEVEL / 竞赛级别</label><strong>${escapeHtml(item.level)} 类</strong><p>${escapeHtml(gradeText[item.level] || "以学校正式文件为准。")}</p></div><div class="info-cell"><label>FIELD / 学科方向</label><strong>${escapeHtml(item.subject)}</strong><p>来源：学校竞赛分类目录</p></div><div class="info-cell"><label>LATEST SESSION / 最新参加时间</label><strong>${escapeHtml(item.latestTime)}</strong><p>具体报名期、校内选拔和比赛日期以当届官方通知为准。</p></div></section>
  <section class="resource-section">${sectionHeading("01", "PREPARE & EXPLORE", "历年赛题与优秀作品", "仅收录赛事官网可核实的公开资料，点击后将在新窗口打开。")}
  <div class="resource-grid">${resourceBox("历年赛题", "A", item.papers, item)}${resourceBox("优秀作品 / 获奖展示", "B", item.works, item)}</div><div class="source-note">校内负责单位：${escapeHtml(item.organizer || "以学校通知为准")}。级别和学科方向来自所附学校竞赛目录。${item.urlCorrected ? `目录原链接：${escapeHtml(item.directoryUrl)}。` : ""}若官网尚未发布本届信息，请以之后的正式通知为准。</div></section>`;
}

function renderNews() {
  return `${pageHead("02", "CAMPUS BULLETIN", "最新消息", "学院官网“学生工作—学科竞赛”栏目最近公布的 15 条消息。点击标题查看原文。")}
  <div class="sync-note"><span>来源：物理科学与信息工程学院官网 / 学生工作 / 学科竞赛</span><span id="news-sync-label">${escapeHtml(state.newsUpdatedAt)}</span></div><div class="news-page-list">${state.news.slice(0, 15).map(newsRow).join("")}</div>`;
}

function documentRow(title, url, index, kind) {
  return `<a class="document-row" href="${safeHref(url)}" target="_blank" rel="noopener noreferrer"><span class="doc-no">${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(title)}</strong><span class="doc-kind">${escapeHtml(kind)}</span><span class="doc-arrow">↗</span></a>`;
}

function renderPolicyContent() {
  if (state.policyTab === "plans") {
    return `<div class="policy-intro"><h2>培养方案</h2><p>按学院官网公开资料收录。请根据自己的专业与入学年级选择对应版本。</p></div><div class="document-list">${trainingPlans.map((plan, index) => documentRow(plan.title, plan.url, index, "学院官网 PDF")).join("")}</div>`;
  }
  if (state.policyTab === "handbook") {
    return `<div class="policy-intro"><h2>新生手册</h2><p>入学报到、选课、住宿等事项请以学校当年的正式通知为准。</p></div><div class="notice-box"><strong>暂未核实到公开的新版新生手册</strong><p>目前提供学校和学院官方入口。取得学校发布的手册文件或链接后，可直接补入此栏目。</p><a class="button accent" href="https://www.lcu.edu.cn/" target="_blank" rel="noopener noreferrer">查看聊城大学官网 <span>↗</span></a></div>`;
  }
  return `<div class="policy-intro"><h2>校方文件</h2><p>学校竞赛级别与活动管理以正式文件为准；历史目录仅供对照。</p></div><div class="document-list">${documentRow("聊城大学大学生学科竞赛活动管理办法", "assets/聊城大学大学生学科竞赛活动管理办法.docx", 0, "2025 · DOCX")}${documentRow("聊城大学大学生学科竞赛目录（2024 版）", "assets/聊大理工学院竞赛.pdf", 1, "历史目录 · PDF")}</div><div class="grade-grid">${levelOrder.map(level => `<div><strong>${level}</strong><span>${escapeHtml(gradeText[level])}</span></div>`).join("")}</div>`;
}

function renderPolicies() {
  const tabs = [["plans", "培养方案"], ["handbook", "新生手册"], ["files", "校方文件"]];
  return `${pageHead("03", "SCHOOL POLICY", "校方政策", "汇集培养方案、入学资料与竞赛管理文件，便于在报名前核对规定。")}<div class="policy-tabs" role="tablist" aria-label="政策分类">${tabs.map(([key, title]) => `<button data-policy="${key}" role="tab" aria-selected="${state.policyTab === key}" class="${state.policyTab === key ? "active" : ""}">${title}</button>`).join("")}</div><section class="policy-content" id="policy-content">${renderPolicyContent()}</section>`;
}

function render() {
  const route = location.hash.replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean);
  const page = route[0] || "home";
  document.querySelectorAll("[data-nav]").forEach(link => link.classList.toggle("active", link.dataset.nav === (page === "competition" ? "competitions" : page)));
  if (page === "competitions") app.innerHTML = renderCompetitions();
  else if (page === "competition") {
    const item = competitions.find(competition => competition.id === Number(route[1]));
    app.innerHTML = item ? renderCompetition(item) : pageHead("404", "NOT FOUND", "未找到这项竞赛", "请返回竞赛目录继续查找。");
  } else if (page === "news") app.innerHTML = renderNews();
  else if (page === "policies") app.innerHTML = renderPolicies();
  else app.innerHTML = renderHome();
  if (page === "competitions") renderCatalogList();
  document.title = `${page === "competition" ? "竞赛详情" : ({home: "竞赛渠道查询", competitions: "竞赛详情", news: "最新消息", policies: "校方政策"}[page] || "竞赛渠道查询")} · 聊城大学物理科学与信息工程学院`;
  window.scrollTo({top: 0, behavior: "auto"});
}

document.addEventListener("click", event => {
  const mode = event.target.closest("[data-mode]");
  const level = event.target.closest("[data-level]");
  const subject = event.target.closest("[data-subject]");
  const policy = event.target.closest("[data-policy]");
  if (mode) {state.catalogMode = mode.dataset.mode; render();}
  if (level) {state.levelFilter = level.dataset.level; document.querySelectorAll("[data-level]").forEach(button => button.classList.toggle("active", button === level)); renderCatalogList();}
  if (subject) {state.subjectFilter = subject.dataset.subject; render();}
  if (policy) {state.policyTab = policy.dataset.policy; render();}
});

document.addEventListener("input", event => {
  if (event.target.id === "catalog-search") {state.search = event.target.value; renderCatalogList();}
});

document.addEventListener("change", event => {
  if (event.target.id === "subject-select") {state.subjectFilter = event.target.value; render();}
});

async function refreshNews() {
  if (!location.protocol.startsWith("http")) return;
  try {
    const response = await fetch("/api/news", {cache: "no-store"});
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data.items) || !data.items.length) return;
    state.news = data.items.slice(0, 15);
    state.newsUpdatedAt = data.updatedAt ? `最近同步：${data.updatedAt}` : "最近同步：学院官网";
    const page = location.hash.replace(/^#\/?/, "").split("/")[0];
    if (!page || page === "news") render();
  } catch {
    state.newsUpdatedAt = "当前展示上次同步的消息";
  }
}

document.getElementById("today-label").textContent = new Intl.DateTimeFormat("zh-CN", {timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date());
window.addEventListener("hashchange", render);
render();
refreshNews();
