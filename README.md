# Registration Form with JavaScript

A registration form that checks your answers while you fill it in, built with HTML, CSS and
JavaScript. Task 12 of my Bloomrix internship. No jQuery is used.

## Files
- index.html - the page
- style.css - all the styling
- app.js - all the JavaScript

## Features
- Custom error messages under each field. A field shows its messages after you leave it, and
  then checks itself on every key press.
- Password strength meter with a text label, and a check that the confirm password matches.
- Character counter for the textarea.
- A list of the selected interests. Each item has a Remove button.
- The submit button is disabled until every field is valid, and a status line tells you how
  many answers still need attention.
- A confirmation window built with createElement. Escape, a click outside, or the Go back
  button closes it, and the keyboard focus stays inside while it is open.
- A loading indicator, then a success message with a countdown, without reloading the page.
- A Reset button that clears the fields, the messages and the generated list.
- Tabs for the additional information, with arrow key support.
- This page has no server, so the form does not send the answers anywhere.

## DOM and event topics used
- getElementById, querySelector, querySelectorAll, closest, matches
- textContent, innerHTML (only for clearing a list), classList, dataset, setAttribute,
  removeAttribute
- createElement, append, remove
- Events: click, input, blur, submit, keydown, DOMContentLoaded
- Event delegation (the form, the chip list and the tabs), capturing (blur), target and
  currentTarget, preventDefault
- FormData, form.reset, the validity flags, validationMessage and setCustomValidity
- setTimeout, setInterval, clearTimeout and clearInterval
- Focus handling with focus and document.activeElement

## How to run
Open index.html with Live Server in Visual Studio Code, or in any web browser.