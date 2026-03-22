const STORAGE_KEY = "bonus-calculator-values";

const form = document.getElementById("bonus-form");
const personalFactorInput = document.getElementById("personalFactor");
const baseSalaryInput = document.getElementById("baseSalary");
const roicInput = document.getElementById("roic");
const organicGrowthInput = document.getElementById("organicGrowth");
const acquiredGrowthInput = document.getElementById("acquiredGrowth");
const resetButton = document.getElementById("reset-button");
const formMessage = document.getElementById("form-message");

const bonusResult = document.getElementById("bonus-result");
const pfDisplay = document.getElementById("pf-display");
const cfDisplay = document.getElementById("cf-display");
const cfTopDisplay = document.getElementById("cf-top-display");
const salaryDisplay = document.getElementById("salary-display");
const corporateBreakdown = document.getElementById("corporate-breakdown");
const bonusBreakdown = document.getElementById("bonus-breakdown");

function loadSavedValues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveValues(values) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizePersonalFactor(value) {
  return Number(value).toFixed(1);
}

function formatPercent(value) {
  return `${(value || 0).toFixed(2)}%`;
}

function getCorporateFactor({ roic, organicGrowth, acquiredGrowth }) {
  return (roic - 5) + (2 * organicGrowth) + acquiredGrowth;
}

function calculateBonus({ personalFactor, baseSalary, corporateFactor }) {
  return personalFactor * baseSalary * (corporateFactor / 100);
}

function updateDisplay(values) {
  const {
    personalFactor,
    baseSalary,
    corporateFactor,
    bonus,
    roic = 0,
    organicGrowth = 0,
    acquiredGrowth = 0
  } = values;

  pfDisplay.textContent = Number.isFinite(personalFactor) ? personalFactor.toFixed(1) : "0.0";
  cfDisplay.textContent = formatPercent(corporateFactor);
  cfTopDisplay.textContent = formatPercent(corporateFactor);
  salaryDisplay.textContent = formatCurrency(baseSalary);
  bonusResult.textContent = formatCurrency(bonus);

  corporateBreakdown.textContent =
    `Corporate Factor = (${formatPercent(roic)} - 5.00%) + ` +
    `(2 x ${formatPercent(organicGrowth)}) + ${formatPercent(acquiredGrowth)} = ${formatPercent(corporateFactor)}`;

  bonusBreakdown.textContent =
    `Bonus = ${formatPercent(corporateFactor)} x ` +
    `${Number.isFinite(personalFactor) ? personalFactor.toFixed(1) : "0.0"} x ${formatCurrency(baseSalary)} = ${formatCurrency(bonus)}`;
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#8a2f2f" : "#5f6e64";
}

function hydrateForm() {
  const saved = loadSavedValues();

  if (!saved) {
    updateDisplay({
      personalFactor: 0,
      baseSalary: 0,
      corporateFactor: 0,
      bonus: 0,
      roic: 0,
      organicGrowth: 0,
      acquiredGrowth: 0
    });
    return;
  }

  if (saved.personalFactor !== undefined) {
    personalFactorInput.value = normalizePersonalFactor(saved.personalFactor);
  }

  if (saved.baseSalary !== undefined) {
    baseSalaryInput.value = saved.baseSalary;
  }

  if (saved.roic !== undefined) {
    roicInput.value = saved.roic;
  }

  if (saved.organicGrowth !== undefined) {
    organicGrowthInput.value = saved.organicGrowth;
  }

  if (saved.acquiredGrowth !== undefined) {
    acquiredGrowthInput.value = saved.acquiredGrowth;
  }

  const personalFactor = parseNumber(saved.personalFactor);
  const baseSalary = parseNumber(saved.baseSalary);
  const roic = parseNumber(saved.roic);
  const organicGrowth = parseNumber(saved.organicGrowth);
  const acquiredGrowth = parseNumber(saved.acquiredGrowth);
  const corporateFactor = getCorporateFactor({ roic, organicGrowth, acquiredGrowth });
  const bonus = calculateBonus({ personalFactor, baseSalary, corporateFactor });

  updateDisplay({ personalFactor, baseSalary, corporateFactor, bonus, roic, organicGrowth, acquiredGrowth });
  showMessage("Saved values loaded.");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const personalFactor = parseNumber(personalFactorInput.value);
  const baseSalary = parseNumber(baseSalaryInput.value);
  const roic = parseNumber(roicInput.value);
  const organicGrowth = parseNumber(organicGrowthInput.value);
  const acquiredGrowth = parseNumber(acquiredGrowthInput.value);

  if (!Number.isFinite(personalFactor) || personalFactor < 0) {
    showMessage("Enter a valid PF value.", true);
    personalFactorInput.focus();
    return;
  }

  if (!Number.isFinite(baseSalary) || baseSalary < 0) {
    showMessage("Enter a valid Base Salary.", true);
    baseSalaryInput.focus();
    return;
  }

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

  const normalizedPersonalFactor = Number(normalizePersonalFactor(personalFactor));
  personalFactorInput.value = normalizedPersonalFactor.toFixed(1);
  const corporateFactor = getCorporateFactor({ roic, organicGrowth, acquiredGrowth });

  const bonus = calculateBonus({
    personalFactor: normalizedPersonalFactor,
    baseSalary,
    corporateFactor
  });

  saveValues({
    personalFactor: normalizedPersonalFactor,
    baseSalary,
    roic,
    organicGrowth,
    acquiredGrowth
  });

  updateDisplay({
    personalFactor: normalizedPersonalFactor,
    baseSalary,
    corporateFactor,
    bonus,
    roic,
    organicGrowth,
    acquiredGrowth
  });

  showMessage("Values saved to this browser.");
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  updateDisplay({
    personalFactor: 0,
    baseSalary: 0,
    corporateFactor: 0,
    bonus: 0,
    roic: 0,
    organicGrowth: 0,
    acquiredGrowth: 0
  });
  showMessage("Saved values cleared.");
});

hydrateForm();
