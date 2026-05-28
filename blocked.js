renderMascot(document.getElementById("mascot"));

const params = new URLSearchParams(location.search);
const domain = params.get("d") || "";

function renderSubtitle() {
  const subtitleEl = document.getElementById("subtitle");
  const fullText = t("blockedSubtitle", [domain]);
  const parts = fullText.split(domain);

  subtitleEl.replaceChildren();
  parts.forEach((part, i) => {
    subtitleEl.appendChild(document.createTextNode(part));
    if (i < parts.length - 1 && domain) {
      const span = document.createElement("span");
      span.className = "domain";
      span.textContent = domain;
      subtitleEl.appendChild(span);
    }
  });
}

document.getElementById("backBtn").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else window.close();
});

window.addEventListener("localechange", renderSubtitle);

i18nReady.then(() => {
  renderSubtitle();
  document.body.classList.add("ready");
});
