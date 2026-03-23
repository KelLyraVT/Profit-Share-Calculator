const CF_STORAGE_KEY = "profit-share-corporate-factor";

const form = document.getElementById("cf-form");
const roicInput = document.getElementById("roic");
const organicGrowthInput = document.getElementById("organicGrowth");
const acquiredGrowthInput = document.getElementById("acquiredGrowth");
const resetButton = document.getElementById("reset-button");
const formMessage = document.getElementById("form-message");

const cfTopDisplay = document.getElementById("cf-top-display");
const cfResult = document.getElementById("cf-result");
const roicDisplay = document.getElementById("roic-display");
const organicGrowthDisplay = document.getElementById("organic-growth-display");
const acquiredGrowthDisplay = document.getElementById("acquired-growth-display");
const corporateBreakdown = document.getElementById("corporate-breakdown");

function loadSavedValues() {
  try {
    const raw = localStorage.getItem(CF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveValues(values) {
  localStorage.setItem(CF_STORAGE_KEY, JSON.stringify(values));
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatPercent(value) {
  return `${(value || 0).toFixed(2)}%`;
}

function getCorporateFactor({ roic, organicGrowth, acquiredGrowth }) {
  return (roic - 5) + (2 * organicGrowth) + acquiredGrowth;
}

function updateDisplay({ roic = 0, organicGrowth = 0, acquiredGrowth = 0, corporateFactor = 0 }) {
  cfTopDisplay.textContent = formatPercent(corporateFactor);
  cfResult.textContent = formatPercent(corporateFactor);
  roicDisplay.textContent = formatPercent(roic);
  organicGrowthDisplay.textContent = formatPercent(organicGrowth);
  acquiredGrowthDisplay.textContent = formatPercent(acquiredGrowth);
  corporateBreakdown.textContent =
    `Corporate Factor = (${formatPercent(roic)} - 5.00%) + (2 x ${formatPercent(organicGrowth)}) + ${formatPercent(acquiredGrowth)} = ${formatPercent(corporateFactor)}`;
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#8a2f2f" : "#5f6e64";
}

function hydrateForm() {
  const saved = loadSavedValues();

  if (!saved) {
    updateDisplay({});
    return;
  }

  roicInput.value = saved.roic ?? "";
  organicGrowthInput.value = saved.organicGrowth ?? "";
  acquiredGrowthInput.value = saved.acquiredGrowth ?? "";

  updateDisplay(saved);
  showMessage("Saved Corporate Factor inputs loaded.");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const roic = parseNumber(roicInput.value);
  const organicGrowth = parseNumber(organicGrowthInput.value);
  const acquiredGrowth = parseNumber(acquiredGrowthInput.value);

  if (!Number.isFinite(roic)) {
    showMessage("Enter a valid ROIC percentage.", true);
    roicInput.focus();
    return;
  }

  if (!Number.isFinite(organicGrowth)) {
    showMessage("Enter a valid Organic Growth percentage.", true);
    organicGrowthInput.focus();
    return;
  }

  if (!Number.isFinite(acquiredGrowth)) {
    showMessage("Enter a valid Acquired Growth percentage.", true);
    acquiredGrowthInput.focus();
    return;
  }

  const corporateFactor = getCorporateFactor({ roic, organicGrowth, acquiredGrowth });
  const savedValues = { roic, organicGrowth, acquiredGrowth, corporateFactor };

  saveValues(savedValues);
  updateDisplay(savedValues);
  showMessage("Corporate Factor saved for reuse on the bonus page.");
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(CF_STORAGE_KEY);
  form.reset();
  updateDisplay({});
  showMessage("Saved Corporate Factor values cleared.");
});

hydrateForm();
