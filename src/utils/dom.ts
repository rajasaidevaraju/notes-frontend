export function autoGrow(element: HTMLTextAreaElement) {
  element.style.height = 'auto';
  const borders = element.offsetHeight - element.clientHeight;
  element.style.height = `${element.scrollHeight + borders}px`;
}
