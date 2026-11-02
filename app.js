"use strict";

(() => {
    const SEND_DELAY_MS = 1500;
    const COUNTDOWN_SECONDS = 6;
    const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];

    const form = document.getElementById("registration-form");
    const submitButton = document.getElementById("submit-button");
    const resetButton = document.getElementById("reset-button");
    const formStatus = document.getElementById("form-status");
    const fields = form.querySelectorAll("[data-label]");

    const passwordField = document.getElementById("password");
    const confirmField = document.getElementById("confirm-password");
    const strengthMeter = document.getElementById("strength-meter");
    const strengthText = document.getElementById("strength-text");

    const aboutField = document.getElementById("about-text");
    const aboutCounter = document.getElementById("about-counter");

    const interestsGroup = document.getElementById("interests-group");
    const interestBoxes = [...form.querySelectorAll("[name='interests']")];
    const interestsError = document.getElementById("interests-error");
    const selectedList = document.getElementById("selected-list");
    const selectedNote = document.getElementById("selected-note");

    const positionSelect = document.getElementById("applied-position");
    const successBox = document.getElementById("success-box");
    const successText = document.getElementById("success-text");
    const successCountdown = document.getElementById("success-countdown");

    let sendTimer = null;
    let countdownTimer = null;
    let activeModal = null;
    let lastFocusedElement = null;
    let disabledControls = [];

    const pluralize = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

    const isLower = (c) => c >= "a" && c <= "z";
    const isUpper = (c) => c >= "A" && c <= "Z";
    const isDigit = (c) => c >= "0" && c <= "9";
    const isSymbol = (c) => !isLower(c) && !isUpper(c) && !isDigit(c);

    function getPasswordScore(password) {
        const characters = [...password];
        const checks = [
            password.length >= 8,
            password.length >= 12,
            characters.some(isLower) && characters.some(isUpper),
            characters.some(isDigit),
            characters.some(isSymbol)
        ];
        return checks.filter(Boolean).length;
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
        strengthText.textContent = `Strength: ${STRENGTH_LABELS[score]} (${score} of 5 checks passed)`;
    }

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

    function syncPasswordMatch() {
        const mismatch = confirmField.value !== passwordField.value;
        confirmField.setCustomValidity(mismatch ? "The passwords do not match." : "");
    }

    function validateWhitespaceOnly(field) {
        if (field.hasAttribute("required") && field.type === "text") {
            if (field.value.trim() === "" && field.value.length > 0) {
                field.setCustomValidity(`${field.dataset.label} cannot consist only of spaces.`);
                return false;
            }
        }
        return true;
    }

    function getInvalidFields() {
        return [...form.elements].filter((element) => {
            if (!element.willValidate) return false;
            if (element.type === "text") validateWhitespaceOnly(element);
            return !element.validity.valid;
        });
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

    function getErrorMessage(field) {
        const { validity } = field;
        const label = field.dataset.label;

        if (validity.customError) return field.validationMessage;
        if (validity.valid) return "";
        if (validity.valueMissing) return field.dataset.requiredMessage ?? `${label} is required.`;
        if (validity.typeMismatch) return `Enter a valid ${label.toLowerCase()}.`;
        if (validity.tooShort) return `${label} must have at least ${field.minLength} characters.`;
        if (validity.patternMismatch) return field.dataset.patternMessage ?? `${label} is not in the right format.`;
        if (validity.rangeUnderflow || validity.rangeOverflow) return `${label} must be between ${field.min} and ${field.max}.`;

        return field.validationMessage;
    }

    function validateField(field) {
        const wrapper = field.closest(".field");
        if (!wrapper) return;
        const errorBox = wrapper.querySelector(".field-error");
        validateWhitespaceOnly(field);
        const message = getErrorMessage(field);

        if (errorBox) errorBox.textContent = message;
        wrapper.classList.toggle("field--invalid", message !== "");
        wrapper.classList.toggle("field--valid", message === "" && field.value.trim() !== "");
    }

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
        removeButton.setAttribute("aria-label", `Remove ${interest}`);

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
        interestBoxes.forEach((box) => box.setCustomValidity(message));
    }

    function showInterestsError() {
        const message = interestsGroup.dataset.touched === "true" ? interestBoxes[0].validationMessage : "";
        interestsError.textContent = message;
        interestsGroup.classList.toggle("group--invalid", message !== "");
    }

    function handleUnifiedFormInput(event) {
        const target = event.target;

        if (target === passwordField) updatePasswordStrength();
        if (target === aboutField) updateCounter();

        if (target === passwordField || target === confirmField) {
            syncPasswordMatch();
        }

        if (target.name === "interests") {
            interestsGroup.dataset.touched = "true";
            syncInterests();
            renderSelectedList();
            showInterestsError();
        }

        if (target.dataset.touched === "true") {
            validateField(target);
        }

        if (target === passwordField && confirmField.dataset.touched === "true") {
            validateField(confirmField);
        }

        updateSubmitState();
    }

    function handleFieldBlur(event) {
        const field = event.target;
        if (field.matches("[data-label]")) {
            field.dataset.touched = "true";
            validateField(field);
        }
    }

    function handleChipClick(event) {
        const removeButton = event.target.closest("[data-value]");
        if (!removeButton) return;
        const box = interestBoxes.find((item) => item.value === removeButton.dataset.value);
        if (box) {
            box.checked = false;
            syncInterests();
            renderSelectedList();
            showInterestsError();
            updateSubmitState();
            box.focus();
        }
    }

    function refreshAll() {
        updatePasswordStrength();
        updateCounter();
        syncPasswordMatch();
        syncInterests();
        renderSelectedList();
        updateSubmitState();
    }

    function setupTabs(tabs) {
        const tabList = tabs.querySelector("[role='tablist']");
        const tabButtons = [...tabList.querySelectorAll("[role='tab']")];
        const panels = [...tabs.querySelectorAll("[role='tabpanel']")];

        function selectTab(targetButton) {
            tabButtons.forEach((button) => {
                const isActive = button === targetButton;
                button.classList.toggle("tab--active", isActive);
                button.setAttribute("aria-selected", isActive ? "true" : "false");
                button.setAttribute("tabindex", isActive ? "0" : "-1");
            });

            panels.forEach((panel) => {
                panel.hidden = panel.id !== targetButton.getAttribute("aria-controls");
            });
        }

        tabList.addEventListener("click", (event) => {
            const tab = event.target.closest("[role='tab']");
            if (tab) selectTab(tab);
        });

        tabList.addEventListener("keydown", (event) => {
            const tab = event.target.closest("[role='tab']");
            if (!tab) return;
            const index = tabButtons.indexOf(tab);
            let nextIndex = null;

            if (event.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
            if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End") nextIndex = tabButtons.length - 1;

            if (nextIndex !== null) {
                event.preventDefault();
                tabButtons[nextIndex].focus();
                selectTab(tabButtons[nextIndex]);
            }
        });
    }

    function setFormBusy(isBusy) {
        if (isBusy) {
            disabledControls = [...form.elements].filter((el) => !el.disabled);
            disabledControls.forEach((el) => { el.disabled = true; });
        } else {
            disabledControls.forEach((el) => { el.disabled = false; });
            disabledControls = [];
        }
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
            if (wrapper) {
                wrapper.classList.remove("field--invalid", "field--valid");
                const errBox = wrapper.querySelector(".field-error");
                if (errBox) errBox.textContent = "";
            }
        });

        interestsGroup.removeAttribute("data-touched");
        interestsGroup.classList.remove("group--invalid");
        interestsError.textContent = "";
        refreshAll();
    }

    function showSuccess(name) {
        let secondsLeft = COUNTDOWN_SECONDS;
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

    function startSending(registration) {
        clearMessages();
        setFormBusy(true);
        formStatus.className = "form-status form-status--loading";
        formStatus.textContent = "Processing your registration...";

        sendTimer = window.setTimeout(() => {
            setFormBusy(false);
            clearForm();
            showSuccess(registration.name);
        }, SEND_DELAY_MS);
    }

    function makeElement(tag, className, text = "") {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        return el;
    }

    function formatDate(dateString) {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        const dateObj = new Date(year, month - 1, day);
        return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(dateObj);
    }

    function readRegistration() {
        const data = new FormData(form);
        return {
            name: data.get("full_name").trim(),
            email: data.get("email_address").trim(),
            position: positionSelect.options[positionSelect.selectedIndex].textContent,
            startDate: formatDate(data.get("start_date")),
            interests: data.getAll("interests")
        };
    }

    function closeModal() {
        if (!activeModal) return;
        document.removeEventListener("keydown", handleModalKeydown);
        document.body.classList.remove("modal-open");
        activeModal.remove();
        activeModal = null;
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function handleModalKeydown(event) {
        if (event.key === "Escape") {
            closeModal();
            return;
        }
        if (event.key !== "Tab") return;

        const focusables = [...activeModal.querySelectorAll("button, [tabindex='0']")];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (!activeModal.contains(document.activeElement)) {
            event.preventDefault();
            first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function openModal(registration) {
        const backdrop = makeElement("div", "modal-backdrop");
        const modal = makeElement("div", "modal");
        const titleId = "modal-title-heading";

        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", titleId);

        const heading = makeElement("h2", "", "Confirm your registration");
        heading.id = titleId;

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
            heading,
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
        backdrop.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) closeModal();
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
        interestsGroup.dataset.touched = "true";
        syncInterests();
        showInterestsError();
        updateSubmitState();
    }

    function handleSubmit(event) {
        event.preventDefault();
        syncInterests();
        if (getInvalidFields().length > 0) {
            showAllErrors();
            return;
        }
        openModal(readRegistration());
    }

    function handleReset() {
        clearMessages();
        clearForm();
    }

    form.addEventListener("input", handleUnifiedFormInput);
    form.addEventListener("blur", handleFieldBlur, true);
    interestsGroup.addEventListener("input", handleUnifiedFormInput);
    selectedList.addEventListener("click", handleChipClick);
    form.addEventListener("submit", handleSubmit);
    resetButton.addEventListener("click", handleReset);
    window.addEventListener("pagehide", clearMessages);

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".tabs").forEach(setupTabs);
        refreshAll();
    });
})();