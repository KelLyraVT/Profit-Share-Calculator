const STORAGE_KEY = "bonus-calculator-values";

const form = document.getElementById("bonus-form");
const personalFactorInput = document.getElementById("personalFactor");
const baseSalaryInput = document.getElementById("baseSalary");
const cfModeInputs = document.querySelectorAll('input[name="cfMode"]');
const roicInput = document.getElementById("roic");
const organicGrowthInput = document.getElementById("organicGrowth");
const acquiredGrowthInput = document.getElementById("acquiredGrowth");
const manualCorporateFactorInput = document.getElementById("manualCorporateFactor");
const calculatedCfFields = document.getElementById("calculated-cf-fields");
const manualCfFields = document.getElementById("manual-cf-fields");
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

function getSelectedCfMode() {
  const selected = Array.from(cfModeInputs).find((input) => input.checked);
  return selected ? selected.value : "calculated";
}

function formatPercent(value) {
  return `${(value || 0).toFixed(2)}%`;
}

function getCorporateFactor({ roic, organicGrowth, acquiredGrowth }) {
  return (roic - 5) + (2 * organicGrowth) + acquiredGrowth;
}

function setCfMode(mode) {
  const isCalculated = mode === "calculated";
  calculatedCfFields.hidden = !isCalculated;
  manualCfFields.hidden = isCalculated;
  calculatedCfFields.classList.toggle("is-active", isCalculated);
  calculatedCfFields.classList.toggle("is-inactive", !isCalculated);
  calculatedCfFields.classList.toggle("is-highlighted", isCalculated);
  manualCfFields.classList.toggle("is-active", !isCalculated);
  manualCfFields.classList.toggle("is-inactive", isCalculated);
  manualCfFields.classList.toggle("is-highlighted", !isCalculated);
  roicInput.disabled = !isCalculated;
  organicGrowthInput.disabled = !isCalculated;
  acquiredGrowthInput.disabled = !isCalculated;
  manualCorporateFactorInput.disabled = isCalculated;
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
    cfMode = "calculated",
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
    cfMode === "manual"
      ? `Corporate Factor entered directly = ${formatPercent(corporateFactor)}`
      : `Corporate Factor = (${formatPercent(roic)} - 5.00%) + ` +
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
      cfMode: "calculated",
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

  const cfMode = saved.cfMode || "calculated";
  Array.from(cfModeInputs).forEach((input) => {
    input.checked = input.value === cfMode;
  });
  setCfMode(cfMode);

  if (saved.roic !== undefined) {
    roicInput.value = saved.roic;
  }

  if (saved.organicGrowth !== undefined) {
    organicGrowthInput.value = saved.organicGrowth;
  }

  if (saved.acquiredGrowth !== undefined) {
    acquiredGrowthInput.value = saved.acquiredGrowth;
  }

  if (saved.manualCorporateFactor !== undefined) {
    manualCorporateFactorInput.value = saved.manualCorporateFactor;
  }

  const personalFactor = parseNumber(saved.personalFactor);
  const baseSalary = parseNumber(saved.baseSalary);
  const roic = parseNumber(saved.roic);
  const organicGrowth = parseNumber(saved.organicGrowth);
  const acquiredGrowth = parseNumber(saved.acquiredGrowth);
  const manualCorporateFactor = parseNumber(saved.manualCorporateFactor);
  const corporateFactor = cfMode === "manual"
    ? manualCorporateFactor
    : getCorporateFactor({ roic, organicGrowth, acquiredGrowth });
  const bonus = calculateBonus({ personalFactor, baseSalary, corporateFactor });

  updateDisplay({ personalFactor, baseSalary, corporateFactor, bonus, cfMode, roic, organicGrowth, acquiredGrowth });
  showMessage("Saved values loaded.");
}

cfModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const mode = getSelectedCfMode();
    setCfMode(mode);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const cfMode = getSelectedCfMode();
  const personalFactor = parseNumber(personalFactorInput.value);
  const baseSalary = parseNumber(baseSalaryInput.value);
  const roic = parseNumber(roicInput.value);
  const organicGrowth = parseNumber(organicGrowthInput.value);
  const acquiredGrowth = parseNumber(acquiredGrowthInput.value);
  const manualCorporateFactor = parseNumber(manualCorporateFactorInput.value);

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

  if (cfMode === "manual") {
    if (!Number.isFinite(manualCorporateFactor)) {
      showMessage("Enter a valid Corporate Factor percentage.", true);
      manualCorporateFactorInput.focus();
      return;
    }
  } else {
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
  }

  const normalizedPersonalFactor = Number(normalizePersonalFactor(personalFactor));
  personalFactorInput.value = normalizedPersonalFactor.toFixed(1);
  const corporateFactor = cfMode === "manual"
    ? manualCorporateFactor
    : getCorporateFactor({ roic, organicGrowth, acquiredGrowth });

  const bonus = calculateBonus({
    personalFactor: normalizedPersonalFactor,
    baseSalary,
    corporateFactor
  });

  saveValues({
    cfMode,
    personalFactor: normalizedPersonalFactor,
    baseSalary,
    roic,
    organicGrowth,
    acquiredGrowth,
    manualCorporateFactor
  });

  updateDisplay({
    personalFactor: normalizedPersonalFactor,
    baseSalary,
    corporateFactor,
    bonus,
    cfMode,
    roic,
    organicGrowth,
    acquiredGrowth
  });

  showMessage("Values saved to this browser.");
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  Array.from(cfModeInputs).forEach((input) => {
    input.checked = input.value === "calculated";
  });
  setCfMode("calculated");
  updateDisplay({
    personalFactor: 0,
    baseSalary: 0,
    corporateFactor: 0,
    bonus: 0,
    cfMode: "calculated",
    roic: 0,
    organicGrowth: 0,
    acquiredGrowth: 0
  });
  showMessage("Saved values cleared.");
});

setCfMode(getSelectedCfMode());
hydrateForm();
