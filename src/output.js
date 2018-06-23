function outputToElement(elementId) {
  const ele = document.getElementById(elementId);
  let outArray = [];

  return function output(text) {
    outArray.push(text);
    ele.innerHTML = outArray.join('\n');
  }
}

export { outputToElement };
