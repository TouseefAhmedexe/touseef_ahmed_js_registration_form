# Registration Form with JavaScript

A registration form that checks your answers while you fill it in, built with HTML, CSS and
JavaScript. Task 12 of my Bloomrix internship. No jQuery is used.

## Files
- index.html - the page
- style.css - all the styling
- app.js - all the JavaScript

## Architectural & Accessibility Improvements
- **Constraint Validation API & `novalidate`**: Gated form with `novalidate` to ensure custom UI messaging (`showAllErrors()`) serves as the single source of truth without being preempted by native browser bubbles.
- **Whitespace Sanitization**: Enhanced validation checks to ensure whitespace-only strings fail requirement rules cleanly.
- **Encapsulation**: Wrapped script logic in an IIFE to eliminate module-level global variable leaks.
- **ARIA Accessibility**: 
  - Integrated `aria-live="polite"` on message containers and status elements.
  - Implemented full WAI-ARIA Tab Pattern (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, roving `tabindex`).
  - Implemented accessible modal with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
- **Date Formatting**: Formatted raw ISO date strings via `Intl.DateTimeFormat` before presenting details in the confirmation modal.
- **Form Element State Restoration**: Improved form disable/enable logic to track and restore only specific controls that were active prior to processing.

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
Open index.html with Live Server in Visual Studio Code or in any modern web browser.