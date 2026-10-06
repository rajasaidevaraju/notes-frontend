// navigator.clipboard only exists in secure contexts (HTTPS or localhost). The
// app is usually opened over plain HTTP on the LAN, so fall back to the legacy
// execCommand path, which browsers still allow inside a user gesture.

export const canReadClipboard = () =>
  typeof navigator !== 'undefined' && window.isSecureContext && !!navigator.clipboard?.readText;

function legacyCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  textarea.select();
  textarea.setSelectionRange(0, text.length); // iOS ignores select()
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
  }
  if (!ok) throw new Error('Copy was blocked by the browser.');
}

export async function copyToClipboard(text: string) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permission denied or document not focused; try the legacy path.
    }
  }
  legacyCopy(text);
}
