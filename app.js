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

