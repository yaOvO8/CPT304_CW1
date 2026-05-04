# Accessibility Fix Summary

This document explains the accessibility fixes applied to the BizTrack order management project, focusing on:

1. Keyboard inaccessibility caused by non-semantic interactive controls
2. Search inputs lacking accessible names

## 1. Semantic interactive controls for keyboard accessibility

### What was changed

- Replaced clickable menu wrappers from `div` to `<button type="button">`
- Replaced clickable sidebar close icons from bare `<i>` elements to `<button type="button">`
- Kept Font Awesome icons as decorative children using `aria-hidden="true"`
- Replaced sortable table headers from `th onclick="..."` to `th > button`
- Replaced row action icons in the Products, Orders, and Expenses tables from bare icons to real buttons created in JavaScript
- Added accessible names to icon-only controls with `aria-label`
- Added visible keyboard focus styles for buttons, links, inputs, and selects
- Removed global focus suppression caused by `outline: none`

### Files updated

- [index.html](C:\Users\Lenovo\Desktop\CPT304_CW1\index.html)
- [about.html](C:\Users\Lenovo\Desktop\CPT304_CW1\about.html)
- [help.html](C:\Users\Lenovo\Desktop\CPT304_CW1\help.html)
- [products.html](C:\Users\Lenovo\Desktop\CPT304_CW1\products.html)
- [orders.html](C:\Users\Lenovo\Desktop\CPT304_CW1\orders.html)
- [finances.html](C:\Users\Lenovo\Desktop\CPT304_CW1\finances.html)
- [products.js](C:\Users\Lenovo\Desktop\CPT304_CW1\products.js)
- [orders.js](C:\Users\Lenovo\Desktop\CPT304_CW1\orders.js)
- [finances.js](C:\Users\Lenovo\Desktop\CPT304_CW1\finances.js)
- [styles.css](C:\Users\Lenovo\Desktop\CPT304_CW1\styles.css)

### Problems this fixes

- `div onclick` and `i onclick` controls were not reliably keyboard operable
  - Plain `div` and `i` elements are not interactive by default
  - Keyboard users could miss these controls entirely during `Tab` navigation
  - Enter and Space behavior was not guaranteed the way it is for native buttons

- Sortable table headers were mouse-oriented only
  - Users could click the header with a mouse, but not activate sorting naturally from the keyboard
  - Replacing them with `button` elements inside table headers makes sorting reachable and operable with `Tab`, `Enter`, and `Space`

- Edit and delete icons in table rows were not proper controls
  - Screen readers and keyboard users had no robust semantic signal that these were actions
  - These controls now expose labels such as `Edit product PD001` or `Delete order 1001`

- Focus was visually hidden
  - The global `outline: none` rule removed the browser's default focus ring
  - Keyboard users could move focus but not see where they were on the page
  - The new `:focus-visible` styling restores a clear focus indicator

- Sort state was not exposed
  - Sort headers now update `aria-sort` so assistive technology can better interpret the active sort direction

## 2. Search inputs now have accessible names

### What was changed

- Added visually hidden labels to the search fields on:
  - [products.html](C:\Users\Lenovo\Desktop\CPT304_CW1\products.html)
  - [orders.html](C:\Users\Lenovo\Desktop\CPT304_CW1\orders.html)
  - [finances.html](C:\Users\Lenovo\Desktop\CPT304_CW1\finances.html)

- Labels added:
  - `Search products`
  - `Search orders`
  - `Search expenses`

- Kept the existing placeholder text as helper text only

### Problems this fixes

- Placeholder text alone is not a reliable accessible name
  - Screen readers may not treat placeholder text as the proper label for a form field
  - Placeholder text also disappears or becomes less useful once a user starts typing

- The fields were harder to identify in assistive technology
  - Without a label, users may hear a generic search/input field without enough context
  - The new labels clearly tell users what each search box searches

## 3. Styling and behavior improvements added during the fix

### What was changed

- Added `.sr-only` utility styling for visually hidden labels
- Added `.icon-button` styling for shared semantic icon controls
- Added `.sort-button` styling so sortable headers still match the existing UI
- Added focus styling for:
  - links
  - buttons
  - inputs
  - selects
  - action controls in tables

### Problems this fixes

- Accessibility improvements now work without breaking the existing visual layout
- The project keeps the same general appearance while improving semantics and keyboard behavior
- Keyboard-only users now get both operable controls and visible focus feedback

## 4. Verification completed

### Source-level verification

- Confirmed shared menu and sidebar close controls now use buttons
- Confirmed all three CRUD search boxes now have accessible names
- Confirmed there are no remaining sortable `th onclick` patterns in the affected pages
- Confirmed Products, Orders, and Expenses table action controls are generated as buttons in JavaScript

### Script verification

- Ran `node --check` successfully on:
  - `products.js`
  - `orders.js`
  - `finances.js`

## 5. Summary of bugs resolved

- Fixed keyboard inaccessibility caused by non-semantic interactive elements
- Fixed missing accessible names on the three CRUD-page search inputs
- Restored visible keyboard focus indicators
- Improved screen-reader support for icon-only actions and sortable headers
