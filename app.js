"use strict";

const form = document.getElementById("registration-form");
const submitButton = document.getElementById("submit-button");
const resetButton = document.getElementById("reset-button");
const formStatus = document.getElementById("form-status");
const fields = form.querySelectorAll("[data-label]");

function refreshAll() {
    updatePasswordStrength();
    updateCounter();
    syncPasswordMatch();
    syncInterests();
    renderSelectedList();
    updateSubmitState();
}

document.addEventListener("DOMContentLoaded", refreshAll);


const passwordField = document.getElementById("password");
const strengthMeter = document.getElementById("strength-meter");
const strengthText = document.getElementById("strength-text");
const strengthLabels = ["Very weak", "Very weak", "Weak", "Fair", "Strong", "Very strong"];

const isLower = (character) => character >= "a" && character <= "z";
const isUpper = (character) => character >= "A" && character <= "Z";
const isDigit = (character) => character >= "0" && character <= "9";
const isSymbol = (character) => !isLower(character) && !isUpper(character) && !isDigit(character);

function getPasswordScore(password) {
    const characters = [...password];
    const checks = [
        password.length >= 8,
        password.length >= 12,
        characters.some(isLower) && characters.some(isUpper),
        characters.some(isDigit),
        characters.some(isSymbol)
    ];

    return checks.filter((passed) => passed).length;
}

function updatePasswordStrength() {
    const password = passwordField.value;

    if (password === "") {
        strengthMeter.value = 0;
        strengthText.textContent = "Type a password to see its strength.";
        return;
    }

    const score = getPasswordScore(password);

    strengthMeter.value = score;
    strengthText.textContent = `Strength: ${strengthLabels[score]} (${score} of 5 checks passed)`;
}

passwordField.addEventListener("input", updatePasswordStrength);


const aboutField = document.getElementById("about-text");
const aboutCounter = document.getElementById("about-counter");

function updateCounter() {
    const used = aboutField.value.length;
    const remaining = aboutField.maxLength - used;
    let note = "";

    if (used < aboutField.minLength) {
        note = ` At least ${aboutField.minLength - used} more needed.`;
    } else if (remaining <= 20) {
        note = ` Only ${remaining} left.`;
    }

    aboutCounter.textContent = `${used} of ${aboutField.maxLength} characters used.${note}`;
    aboutCounter.classList.toggle("counter--warning", remaining <= 20);
}

aboutField.addEventListener("input", updateCounter);


const confirmField = document.getElementById("confirm-password");

function pluralize(count, word) {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function syncPasswordMatch() {
    const mismatch = confirmField.value !== passwordField.value;

    confirmField.setCustomValidity(mismatch ? "The passwords do not match." : "");
}

function getInvalidFields() {
    return [...form.elements].filter((element) => element.willValidate && !element.validity.valid);
}

function updateSubmitState() {
    const invalidCount = getInvalidFields().length;
    const isReady = invalidCount === 0;

    submitButton.disabled = !isReady;
    formStatus.className = isReady ? "form-status form-status--ready" : "form-status";
    formStatus.textContent = isReady
        ? "Everything looks good. You can submit the form."
        : `${pluralize(invalidCount, "answer")} ${invalidCount === 1 ? "needs" : "need"} attention before you can submit.`;
}

function handleFormInput(event) {
    if (event.target === passwordField || event.target === confirmField) {
        syncPasswordMatch();
    }

    updateSubmitState();
}

form.addEventListener("input", handleFormInput);


function getErrorMessage(field) {
    const { validity } = field;
    const label = field.dataset.label;

    if (validity.valid) {
        return "";
    }
    if (validity.valueMissing) {
        return field.dataset.requiredMessage ?? `${label} is required.`;
    }
    if (validity.typeMismatch) {
        return `Enter a valid ${label.toLowerCase()}.`;
    }
    if (validity.tooShort) {
        return `${label} must have at least ${field.minLength} characters.`;
    }
    if (validity.patternMismatch) {
        return field.dataset.patternMessage ?? `${label} is not in the right format.`;
    }
    if (validity.rangeUnderflow || validity.rangeOverflow) {
        return `${label} must be between ${field.min} and ${field.max}.`;
    }

    return field.validationMessage;
}

function validateField(field) {
    const wrapper = field.closest(".field");
    const errorBox = wrapper.querySelector(".field-error");
    const message = getErrorMessage(field);

    errorBox.textContent = message;
    wrapper.classList.toggle("field--invalid", message !== "");
    wrapper.classList.toggle("field--valid", message === "" && field.value !== "");
}

function showLiveMessages(event) {
    const field = event.target;

    if (field.dataset.touched === "true") {
        validateField(field);
    }

    if (field === passwordField && confirmField.dataset.touched === "true") {
        validateField(confirmField);
    }
}

function handleFieldBlur(event) {
    const field = event.target;

    if (field.matches("[data-label]")) {
        field.dataset.touched = "true";
        validateField(field);
    }
}

form.addEventListener("input", showLiveMessages);
form.addEventListener("blur", handleFieldBlur, true);


const interestsGroup = document.getElementById("interests-group");
const interestBoxes = [...form.querySelectorAll("[name='interests']")];
const interestsError = document.getElementById("interests-error");
const selectedList = document.getElementById("selected-list");
const selectedNote = document.getElementById("selected-note");

const getSelectedInterests = () => interestBoxes.filter((box) => box.checked).map((box) => box.value);

function buildChip(interest) {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const removeButton = document.createElement("button");

    item.className = "chip";
    label.textContent = interest;

    removeButton.type = "button";
    removeButton.className = "chip-remove";
    removeButton.textContent = "Remove";
    removeButton.dataset.value = interest;
    removeButton.setAttribute("title", `Remove ${interest}`);

    item.append(label, removeButton);
    return item;
}

function renderSelectedList() {
    const selected = getSelectedInterests();

    selectedList.innerHTML = "";
    selected.forEach((interest) => selectedList.append(buildChip(interest)));
    selectedNote.textContent = selected.length === 0
        ? "No interests selected yet."
        : `${pluralize(selected.length, "interest")} selected.`;
}

function syncInterests() {
    const message = getSelectedInterests().length === 0 ? "Choose at least one interest." : "";

    interestBoxes[0].setCustomValidity(message);
}

function showInterestsError() {
    const message = interestsGroup.dataset.touched === "true" ? interestBoxes[0].validationMessage : "";

    interestsError.textContent = message;
    interestsGroup.classList.toggle("group--invalid", message !== "");
}

function handleInterestsInput() {
    interestsGroup.dataset.touched = "true";
    syncInterests();
    renderSelectedList();
    showInterestsError();
}

function handleChipClick(event) {
    const removeButton = event.target.closest("[data-value]");

    if (removeButton === null) {
        return;
    }

    const box = interestBoxes.find((item) => item.value === removeButton.dataset.value);

    box.checked = false;
    handleInterestsInput();
    updateSubmitState();
    box.focus();
}

interestsGroup.addEventListener("input", handleInterestsInput);
selectedList.addEventListener("click", handleChipClick);


function setupTabs(tabs) {
    const tabList = tabs.querySelector(".tab-list");
    const tabButtons = [...tabList.children];
    const panels = tabs.querySelectorAll("[data-panel]");

    function selectTab(name) {
        tabButtons.forEach((button) => {
            button.classList.toggle("tab--active", button.dataset.tab === name);
        });
        panels.forEach((panel) => {
            panel.hidden = panel.dataset.panel !== name;
        });
    }

    tabList.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-tab]");

        if (tab !== null) {
            selectTab(tab.dataset.tab);
        }
    });

    tabList.addEventListener("keydown", (event) => {
        const tab = event.target.closest("[data-tab]");
        let nextTab = null;

        if (tab === null) {
            return;
        }

        if (event.key === "ArrowRight") {
            nextTab = tab.nextElementSibling ?? tabList.firstElementChild;
        } else if (event.key === "ArrowLeft") {
            nextTab = tab.previousElementSibling ?? tabList.lastElementChild;
        }

        if (nextTab !== null) {
            event.preventDefault();
            nextTab.focus();
            selectTab(nextTab.dataset.tab);
        }
    });
}

document.querySelectorAll(".tabs").forEach(setupTabs);


const successBox = document.getElementById("success-box");
const successText = document.getElementById("success-text");
const successCountdown = document.getElementById("success-countdown");

let sendTimer = null;
let countdownTimer = null;

function setFormBusy(isBusy) {
    [...form.elements].forEach((element) => {
        element.disabled = isBusy;
    });
}

function clearMessages() {
    window.clearTimeout(sendTimer);
    window.clearInterval(countdownTimer);
    successBox.hidden = true;
    successText.textContent = "";
    successCountdown.textContent = "";
}

function clearForm() {
    form.reset();

    fields.forEach((field) => {
        const wrapper = field.closest(".field");

        field.removeAttribute("data-touched");
        wrapper.classList.remove("field--invalid", "field--valid");
        wrapper.querySelector(".field-error").textContent = "";
    });

    interestsGroup.removeAttribute("data-touched");
    interestsGroup.classList.remove("group--invalid");
    interestsError.textContent = "";

    refreshAll();
}

function showSuccess(name) {
    let secondsLeft = 6;

    successText.textContent = `Thank you, ${name}! Your registration form is complete.`;
    successCountdown.textContent = `This message closes in ${pluralize(secondsLeft, "second")}.`;
    successBox.hidden = false;
    successBox.focus();

    countdownTimer = window.setInterval(() => {
        secondsLeft -= 1;

        if (secondsLeft <= 0) {
            clearMessages();
            return;
        }

        successCountdown.textContent = `This message closes in ${pluralize(secondsLeft, "second")}.`;
    }, 1000);
}

function finishSending(registration) {
    setFormBusy(false);
    clearForm();
    showSuccess(registration.name);
}

function startSending(registration) {
    clearMessages();
    setFormBusy(true);
    formStatus.className = "form-status form-status--loading";
    formStatus.textContent = "Processing your registration...";

    sendTimer = window.setTimeout(() => finishSending(registration), 1500);
}


const positionSelect = document.getElementById("applied-position");

let activeModal = null;
let lastFocusedElement = null;

function makeElement(tag, className, text = "") {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;
    return element;
}

function readRegistration() {
    const data = new FormData(form);

    return {
        name: data.get("full_name").trim(),
        email: data.get("email_address").trim(),
        position: positionSelect.options[positionSelect.selectedIndex].textContent,
        startDate: data.get("start_date"),
        interests: data.getAll("interests")
    };
}

function closeModal() {
    if (activeModal === null) {
        return;
    }

    document.removeEventListener("keydown", handleModalKeydown);
    document.body.classList.remove("modal-open");
    activeModal.remove();
    activeModal = null;
    lastFocusedElement.focus();
}

function handleModalKeydown(event) {
    if (event.key === "Escape") {
        closeModal();
        return;
    }

    if (event.key !== "Tab") {
        return;
    }

    const buttons = activeModal.querySelectorAll("button");
    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    if (!activeModal.contains(document.activeElement)) {
        event.preventDefault();
        firstButton.focus();
    } else if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
    } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
    }
}

function openModal(registration) {
    const backdrop = makeElement("div", "modal-backdrop");
    const modal = makeElement("div", "modal");
    const details = makeElement("ul", "modal-list");
    const actions = makeElement("div", "modal-actions");
    const confirmButton = makeElement("button", "button", "Yes, register me");
    const cancelButton = makeElement("button", "button button--secondary", "Go back");
    const lines = [
        `Name: ${registration.name}`,
        `Email: ${registration.email}`,
        `Position: ${registration.position}`,
        `Start date: ${registration.startDate}`,
        `Interests: ${registration.interests.join(", ")}`
    ];

    lines.forEach((line) => details.append(makeElement("li", "", line)));

    confirmButton.type = "button";
    cancelButton.type = "button";
    actions.append(confirmButton, cancelButton);
    modal.append(
        makeElement("h2", "", "Confirm your registration"),
        makeElement("p", "", "Check your details before you confirm."),
        details,
        actions
    );
    backdrop.append(modal);

    confirmButton.addEventListener("click", () => {
        closeModal();
        startSending(registration);
    });
    cancelButton.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    });

    lastFocusedElement = document.activeElement;
    activeModal = backdrop;
    document.addEventListener("keydown", handleModalKeydown);
    document.body.classList.add("modal-open");
    document.body.append(backdrop);
    confirmButton.focus();
}

function showAllErrors() {
    fields.forEach((field) => {
        field.dataset.touched = "true";
        validateField(field);
    });

    handleInterestsInput();
    updateSubmitState();
}

function handleSubmit(event) {
    event.preventDefault();

    if (!form.checkValidity()) {
        showAllErrors();
        return;
    }

    openModal(readRegistration());
}

form.addEventListener("submit", handleSubmit);


