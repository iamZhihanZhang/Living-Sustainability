

// Contains all of the input and expected output for api/evaluate-text. Used for testing in server.test.js

const EPOXY_INPUT = {
  "text": "The GFRV composite was constructed from two parts: vitrimer polymer and woven glass fibre sheets. The vitrimer polymer was prepared by mixing a stoichiometric ratio (1:1:5 mol% to the acid) of epoxy (EPON 828, Skygeek), adipic acid (Sigma Aldrich) and 1,5,7-triazabicyclo[4.4.0]dec-5-ene (TBD, Sigma Aldrich)."
};

const PDMS_INPUT = {
  "text": "The PDMS substrate was prepared by mixing the PDMS prepolymer with the curing agent with a mixing ratio of 10:1 w/w."
};

module.exports = { EPOXY_INPUT, PDMS_INPUT }