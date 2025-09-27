// General utilities function that is used across all files

// Checks if the current domain is valid.
export function isDomainValid(domainList) {
  let allowedDomains = domainList;
  const currentDomain = getBaseDomain(window.location.hostname);

  console.log("currentDomain = " + currentDomain);
  if (allowedDomains.includes(currentDomain)) {
    return true;
  } else {
    return false;
  }
}

// Gets the base domain of the current hostname.
export function getBaseDomain(hostname) {
  const parts = hostname.split(".");
  if (parts.length > 2) {
    return parts.slice(-2).join(".");
  }
  return hostname;
}