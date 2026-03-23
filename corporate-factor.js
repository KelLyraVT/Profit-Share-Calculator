const CF_STORAGE_KEY = "profit-share-corporate-factor";

const form = document.getElementById("cf-form");
const cfModeInputs = document.querySelectorAll('input[name="cfMode"]');
const roicInput = document.getElementById("roic");
const organicGrowthInput = document.getElementById("organicGrowth");
const acquiredGrowthInput = document.getElementById("acquiredGrowth");
const businessOneRoicInput = document.getElementById("businessOneRoic");
const businessOneWeightInput = document.getElementById("businessOneWeight");
const businessOneOrganicGrowthInput = document.getElementById("businessOneOrganicGrowth");
const businessOneAcquiredGrowthInput = document.getElementById("businessOneAcquiredGrowth");
const businessTwoRoicInput = document.getElementById("businessTwoRoic");
const businessTwoWeightInput = document.getElementById("businessTwoWeight");
const businessTwoOrganicGrowthInput = document.getElementById("businessTwoOrganicGrowth");
const businessTwoAcquiredGrowthInput = document.getElementById("businessTwoAcquiredGrowth");
const singleCfFields = document.getElementById("single-cf-fields");
const splitCfFields = document.getElementById("split-cf-fields");
const resetButton = document.getElementById("reset-button");
const formMessage = document.getElementById("form-message");

const cfTopDisplay = document.getElementById("cf-top-display");
const cfResult = document.getElementById("cf-result");
const modeDisplay = document.getElementById("mode-display");
const weightedRoicDisplay = document.getElementById("weighted-roic-display");
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

function getSelectedCfMode() {
  const selected = Array.from(cfModeInputs).find((input) => input.checked);
  return selected ? selected.value : "single";
}

function getCorporateFactor({ roic, organicGrowth, acquiredGrowth }) {
  return (roic - 5) + (2 * organicGrowth) + acquiredGrowth;
}

function getSplitCorporateFactor({
  businessOneRoic,
  businessOneWeight,
  businessOneOrganicGrowth,
  businessOneAcquiredGrowth,
  businessTwoRoic,
  businessTwoWeight,
  businessTwoOrganicGrowth,
  businessTwoAcquiredGrowth
}) {
  const businessOneCf = getCorporateFactor({
    roic: businessOneRoic,
    organicGrowth: businessOneOrganicGrowth,
    acquiredGrowth: businessOneAcquiredGrowth
  });

  const businessTwoCf = getCorporateFactor({
    roic: businessTwoRoic,
    organicGrowth: businessTwoOrganicGrowth,
    acquiredGrowth: businessTwoAcquiredGrowth
  });

  const blendedRoic = ((businessOneRoic * businessOneWeight) + (businessTwoRoic * businessTwoWeight)) / 100;
  const blendedCorporateFactor = ((businessOneCf * businessOneWeight) + (businessTwoCf * businessTwoWeight)) / 100;

  return {
    blendedRoic,
    businessOneCf,
    businessTwoCf,
    corporateFactor: blendedCorporateFactor
  };
}

function setCfMode(mode) {
  const isSingle = mode === "single";

  singleCfFields.classList.toggle("is-active", isSingle);
  singleCfFields.classList.toggle("is-inactive", !isSingle);
  singleCfFields.classList.toggle("is-highlighted", isSingle);

  splitCfFields.classList.toggle("is-active", !isSingle);
  splitCfFields.classList.toggle("is-inactive", isSingle);
  splitCfFields.classList.toggle("is-highlighted", !isSingle);

  roicInput.disabled = !isSingle;
  organicGrowthInput.disabled = !isSingle;
  acquiredGrowthInput.disabled = !isSingle;
  businessOneRoicInput.disabled = isSingle;
  businessOneWeightInput.disabled = isSingle;
  businessOneOrganicGrowthInput.disabled = isSingle;
  businessOneAcquiredGrowthInput.disabled = isSingle;
  businessTwoRoicInput.disabled = isSingle;
  businessTwoWeightInput.disabled = isSingle;
  businessTwoOrganicGrowthInput.disabled = isSingle;
  businessTwoAcquiredGrowthInput.disabled = isSingle;
}

function updateDisplay({
  cfMode = "single",
  corporateFactor = 0,
  roic = 0,
  organicGrowth = 0,
  acquiredGrowth = 0,
  blendedRoic = 0,
  businessOneCf = 0,
  businessTwoCf = 0
}) {
  cfTopDisplay.textContent = formatPercent(corporateFactor);
  cfResult.textContent = formatPercent(corporateFactor);
  modeDisplay.textContent = cfMode === "single" ? "Single Business" : "Split Two ROICs";
  weightedRoicDisplay.textContent = cfMode === "split" ? formatPercent(blendedRoic) : "Not used";

  corporateBreakdown.textContent = cfMode === "single"
    ? `Corporate Factor = (${formatPercent(roic)} - 5.00%) + (2 x ${formatPercent(organicGrowth)}) + ${formatPercent(acquiredGrowth)} = ${formatPercent(corporateFactor)}`
    : `Weighted Corporate Factor = (${formatPercent(businessOneCf)} x Allocation 1) + (${formatPercent(businessTwoCf)} x Allocation 2) = ${formatPercent(corporateFactor)}. Weighted ROIC = ${formatPercent(blendedRoic)}.`;
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

  const cfMode = saved.cfMode || "single";
  Array.from(cfModeInputs).forEach((input) => {
    input.checked = input.value === cfMode;
  });
  setCfMode(cfMode);

  roicInput.value = saved.roic ?? "";
  organicGrowthInput.value = saved.organicGrowth ?? "";
  acquiredGrowthInput.value = saved.acquiredGrowth ?? "";
  businessOneRoicInput.value = saved.businessOneRoic ?? "";
  businessOneWeightInput.value = saved.businessOneWeight ?? "";
  businessOneOrganicGrowthInput.value = saved.businessOneOrganicGrowth ?? "";
  businessOneAcquiredGrowthInput.value = saved.businessOneAcquiredGrowth ?? "";
  businessTwoRoicInput.value = saved.businessTwoRoic ?? "";
  businessTwoWeightInput.value = saved.businessTwoWeight ?? "";
  businessTwoOrganicGrowthInput.value = saved.businessTwoOrganicGrowth ?? "";
  businessTwoAcquiredGrowthInput.value = saved.businessTwoAcquiredGrowth ?? "";

  updateDisplay(saved);
  showMessage("Saved Corporate Factor inputs loaded.");
}

cfModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    setCfMode(getSelectedCfMode());
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const cfMode = getSelectedCfMode();
  const roic = parseNumber(roicInput.value);
  const organicGrowth = parseNumber(organicGrowthInput.value);
  const acquiredGrowth = parseNumber(acquiredGrowthInput.value);
  const businessOneRoic = parseNumber(businessOneRoicInput.value);
  const businessOneWeight = parseNumber(businessOneWeightInput.value);
  const businessOneOrganicGrowth = parseNumber(businessOneOrganicGrowthInput.value);
  const businessOneAcquiredGrowth = parseNumber(businessOneAcquiredGrowthInput.value);
  const businessTwoRoic = parseNumber(businessTwoRoicInput.value);
  const businessTwoWeight = parseNumber(businessTwoWeightInput.value);
  const businessTwoOrganicGrowth = parseNumber(businessTwoOrganicGrowthInput.value);
  const businessTwoAcquiredGrowth = parseNumber(businessTwoAcquiredGrowthInput.value);

  let corporateFactor = 0;
  let blendedRoic = 0;
  let businessOneCf = 0;
  let businessTwoCf = 0;

  if (cfMode === "single") {
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

    corporateFactor = getCorporateFactor({ roic, organicGrowth, acquiredGrowth });
  } else {
    if (!Number.isFinite(businessOneRoic)) {
      showMessage("Enter a valid Business 1 ROIC percentage.", true);
      businessOneRoicInput.focus();
      return;
    }

    if (!Number.isFinite(businessOneWeight) || businessOneWeight < 0) {
      showMessage("Enter a valid Business 1 allocation percentage.", true);
      businessOneWeightInput.focus();
      return;
    }

    if (!Number.isFinite(businessTwoRoic)) {
      showMessage("Enter a valid Business 2 ROIC percentage.", true);
      businessTwoRoicInput.focus();
      return;
    }

    if (!Number.isFinite(businessTwoWeight) || businessTwoWeight < 0) {
      showMessage("Enter a valid Business 2 allocation percentage.", true);
      businessTwoWeightInput.focus();
      return;
    }

    if (!Number.isFinite(businessOneOrganicGrowth)) {
      showMessage("Enter a valid Business 1 Organic Growth percentage.", true);
      businessOneOrganicGrowthInput.focus();
      return;
    }

    if (!Number.isFinite(businessOneAcquiredGrowth)) {
      showMessage("Enter a valid Business 1 Acquired Growth percentage.", true);
      businessOneAcquiredGrowthInput.focus();
      return;
    }

    if (Math.abs((businessOneWeight + businessTwoWeight) - 100) > 0.01) {
      showMessage("Business 1 and Business 2 allocations must total 100%.", true);
      businessTwoWeightInput.focus();
      return;
    }

    if (!Number.isFinite(businessTwoOrganicGrowth)) {
      showMessage("Enter a valid Business 2 Organic Growth percentage.", true);
      businessTwoOrganicGrowthInput.focus();
      return;
    }

    if (!Number.isFinite(businessTwoAcquiredGrowth)) {
      showMessage("Enter a valid Business 2 Acquired Growth percentage.", true);
      businessTwoAcquiredGrowthInput.focus();
      return;
    }

    const splitResult = getSplitCorporateFactor({
      businessOneRoic,
      businessOneWeight,
      businessOneOrganicGrowth,
      businessOneAcquiredGrowth,
      businessTwoRoic,
      businessTwoWeight,
      businessTwoOrganicGrowth,
      businessTwoAcquiredGrowth
    });

    corporateFactor = splitResult.corporateFactor;
    blendedRoic = splitResult.blendedRoic;
    businessOneCf = splitResult.businessOneCf;
    businessTwoCf = splitResult.businessTwoCf;
  }

  const savedValues = {
    cfMode,
    corporateFactor,
    roic: Number.isFinite(roic) ? roic : 0,
    organicGrowth: Number.isFinite(organicGrowth) ? organicGrowth : 0,
    acquiredGrowth: Number.isFinite(acquiredGrowth) ? acquiredGrowth : 0,
    businessOneRoic: Number.isFinite(businessOneRoic) ? businessOneRoic : 0,
    businessOneWeight: Number.isFinite(businessOneWeight) ? businessOneWeight : 0,
    businessOneOrganicGrowth: Number.isFinite(businessOneOrganicGrowth) ? businessOneOrganicGrowth : 0,
    businessOneAcquiredGrowth: Number.isFinite(businessOneAcquiredGrowth) ? businessOneAcquiredGrowth : 0,
    businessTwoRoic: Number.isFinite(businessTwoRoic) ? businessTwoRoic : 0,
    businessTwoWeight: Number.isFinite(businessTwoWeight) ? businessTwoWeight : 0,
    businessTwoOrganicGrowth: Number.isFinite(businessTwoOrganicGrowth) ? businessTwoOrganicGrowth : 0,
    businessTwoAcquiredGrowth: Number.isFinite(businessTwoAcquiredGrowth) ? businessTwoAcquiredGrowth : 0,
    blendedRoic,
    businessOneCf,
    businessTwoCf
  };

  saveValues(savedValues);
  updateDisplay(savedValues);
  showMessage("Corporate Factor saved for reuse on the bonus page.");
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(CF_STORAGE_KEY);
  form.reset();
  Array.from(cfModeInputs).forEach((input) => {
    input.checked = input.value === "single";
  });
  setCfMode("single");
  updateDisplay({});
  showMessage("Saved Corporate Factor values cleared.");
});

setCfMode(getSelectedCfMode());
hydrateForm();
