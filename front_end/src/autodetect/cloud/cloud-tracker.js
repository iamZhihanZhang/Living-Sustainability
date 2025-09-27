

// This module contains methods used for tracking specific input/value changes in Azure website for the cloud feature.


// Observes the text change of the element
export function observeTextChange(element, callback) {
  const observer = new MutationObserver(() => {
    const textContent = element.textContent.trim();
    callback(textContent);
  });
  observer.observe(element, { childList: true, subtree: true });
}

/**
 * Observes if an element contains certain .textContent and classList properties
 * @param {String} matchingText The matching text. For example, "Size" or "Region"
 * @param {Array} matchingClassesArr The array containing the matching classes. For example, ["azc-form-label"];
 * @param {callback} callback
 */
export function observeElementTextAndClassContent(
  matchingText,
  matchingClassesArr,
  callback
) {
  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if it's an element
            if (
              node.textContent.includes(matchingText) &&
              matchingClassesArr.some((className) =>
                node.classList.contains(className)
              )
            ) {
              callback(node);
              observer.disconnect(); // Stop observing once a match is found
            }
          }
        });
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Gets the element by the text content
export function getElementByTextContent(nodeList, matchingText) {
  const nList = document.querySelectorAll(nodeList);
  nList.forEach((element) => {
    if (element.textContent === matchingText) {
      return element;
    }
  });
}