"use strict";

const form = document.getElementById("registration-form");
const submitButton = document.getElementById("submit-button");
const resetButton = document.getElementById("reset-button");
const formStatus = document.getElementById("form-status");
const fields = form.querySelectorAll("[data-label]");

function refreshAll() {
    updatePasswordStrength();
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

