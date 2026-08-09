/** Grows a textarea to fit its content instead of scrolling internally. */
export function autoGrow(element: HTMLTextAreaElement) {
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
}
