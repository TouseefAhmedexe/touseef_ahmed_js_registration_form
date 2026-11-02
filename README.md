# Registration Form with JavaScript

A registration form that checks your answers while you fill it in, built with HTML, CSS and
JavaScript. Task 12 of my Bloomrix internship. No jQuery is used.

## Files
- index.html - the page
- style.css - all the styling
- app.js - all the JavaScript

## Key Fixes & Architecture (Task 12 Optimization)
- **Whitespace Validation & Custom Validity Lifecycles**: `validateWhitespaceOnly()` explicitly resets `setCustomValidity("")` before running checks to prevent sticky custom errors.
- **Form Reset Cleanup**: `clearForm()` runs an explicit loop that clears `setCustomValidity("")` across all controls independently of browser-specific `form.reset()` behaviors.
- **Event Listener Efficiency**: Consolidated input handling to a single form-level delegation listener (`form.addEventListener("input", handleUnifiedFormInput)`), removing redundant element-level listeners.
- **Accessible Form Gating**: The submit button remains enabled to allow native `Enter` submission. If submitted with errors, `showAllErrors()` highlights invalid fields and shifts keyboard focus directly to the first invalid control.
- **ARIA & Focus Accessibility**:
  - Dynamically updates `aria-invalid="true"/"false"` on input controls.
  - Linked all controls to error text using `aria-describedby` matching `.field-error` element IDs.
  - Full WAI-ARIA tab pattern (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, roving `tabindex`).
  - Dynamic confirmation modal with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
  - Automated focus restoration to the form input when the success countdown expires.

## DOM and Event Topics Used
- `getElementById`, `querySelector`, `querySelectorAll`, `closest`, `matches`
- `textContent`, `innerHTML` (only for clearing list), `classList`, `dataset`, `setAttribute`, `removeAttribute`
- `createElement`, `append`, `remove`
- Events: `click`, `input`, `blur`, `submit`, `keydown`, `DOMContentLoaded`, `pagehide`
- Event delegation (form, chip list, tabs), capturing (`blur`), `target`, `currentTarget`, `preventDefault`
- `FormData`, `form.reset`, validity flags, `validationMessage`, `setCustomValidity`
- `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`
- Focus handling with `focus()` and `document.activeElement`

## How to Run
Open index.html with Live Server in Visual Studio Code or in any modern web browser