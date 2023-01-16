export default () => {
  let text = '';
  let activeEl = document.activeElement;
  let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
  if (
    ['textarea', 'input'].includes(activeElTagName) &&
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
      (typeof activeEl.selectionStart === 'number')
  ) {
    text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
  } else if (window.getSelection) {
    text = window.getSelection().toString();
  }
  return text;
};
