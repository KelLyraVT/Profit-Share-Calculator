const BONUS_STORAGE_KEY = "bonus-calculator-values";
const SHARED_CF_KEY = "profit-share-corporate-factor";

const form = document.getElementById("bonus-form");
const corporateFactorInput = document.getElementById("corporateFactor");
const personalFactorInput = document.getElementById("personalFactor");
const baseSalaryInput = document.getElementById("baseSalary");
const resetButton = document.getElementById("reset-button");
const formMessage = document.getElementById("form-message");

const bonusResult = document.getElementById("bonus-result");
const cfDisplay = document.getElementById("cf-display");
const pfDisplay = document.getElementById("pf-display");
const salaryDisplay = document.getElementById("salary-display");
const bonusBreakdown = document.getElementById("bonus-breakdown");

function loadSavedValues() {
  try {
    const raw = localStorage.getItem(BONUS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveValues(values) {
  localStorage.setItem(BONUS_STORAGE_KEY, JSON.stringify(values));
}

function loadSharedCorporateFactor() {
  try {
    const raw = localStorage.getItem(SHARED_CF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
}

function formatPercent(value) {
  return `${(value || 0).toFixed(2)}%`;
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizePersonalFactor(value) {
  return Number(value).toFixed(1);
}

function calculateBonus({ corporateFactor, personalFactor, baseSalary }) {
  return (corporateFactor / 100) * personalFactor * baseSalary;
}

function updateDisplay({ corporateFactor, personalFactor, baseSalary, bonus }) {
  cfDisplay.textContent = formatPercent(corporateFactor);
  pfDisplay.textContent = Number.isFinite(personalFactor) ? personalFactor.toFixed(1) : "0.0";
  salaryDisplay.textContent = formatCurrency(baseSalary);
  bonusResult.textContent = formatCurrency(bonus);
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
  const sharedCf = loadSharedCorporateFactor();

  if (sharedCf && sharedCf.corporateFactor !== undefined) {
    corporateFactorInput.value = sharedCf.corporateFactor;
    showMessage("Latest Corporate Factor loaded from the builder page.");
  }

  if (saved?.personalFactor !== undefined) {
    personalFactorInput.value = normalizePersonalFactor(saved.personalFactor);
  }

  if (saved?.baseSalary !== undefined) {
    baseSalaryInput.value = saved.baseSalary;
  }

  const corporateFactor = parseNumber(corporateFactorInput.value);
  const personalFactor = parseNumber(saved?.personalFactor);
  const baseSalary = parseNumber(saved?.baseSalary);
  const bonus = calculateBonus({
    corporateFactor: Number.isFinite(corporateFactor) ? corporateFactor : 0,
    personalFactor: Number.isFinite(personalFactor) ? personalFactor : 0,
    baseSalary: Number.isFinite(baseSalary) ? baseSalary : 0
  });

  updateDisplay({
    corporateFactor: Number.isFinite(corporateFactor) ? corporateFactor : 0,
    personalFactor: Number.isFinite(personalFactor) ? personalFactor : 0,
    baseSalary: Number.isFinite(baseSalary) ? baseSalary : 0,
    bonus
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const corporateFactor = parseNumber(corporateFactorInput.value);
  const personalFactor = parseNumber(personalFactorInput.value);
  const baseSalary = parseNumber(baseSalaryInput.value);

  if (!Number.isFinite(corporateFactor)) {
    showMessage("Enter a valid Corporate Factor percentage.", true);
    corporateFactorInput.focus();
    return;
  }

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

  const normalizedPersonalFactor = Number(normalizePersonalFactor(personalFactor));
  personalFactorInput.value = normalizedPersonalFactor.toFixed(1);

  const bonus = calculateBonus({
    corporateFactor,
    personalFactor: normalizedPersonalFactor,
    baseSalary
  });

  saveValues({
    personalFactor: normalizedPersonalFactor,
    baseSalary
  });

  updateDisplay({
    corporateFactor,
    personalFactor: normalizedPersonalFactor,
    baseSalary,
    bonus
  });

  showMessage("Values saved to this browser.");
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(BONUS_STORAGE_KEY);
  form.reset();

  const sharedCf = loadSharedCorporateFactor();
  if (sharedCf && sharedCf.corporateFactor !== undefined) {
    corporateFactorInput.value = sharedCf.corporateFactor;
  }

  updateDisplay({
    corporateFactor: parseNumber(corporateFactorInput.value) || 0,
    personalFactor: 0,
    baseSalary: 0,
    bonus: 0
  });

  showMessage("Saved PF and Base Salary cleared.");
});

hydrateForm();
