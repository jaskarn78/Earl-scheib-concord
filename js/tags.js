// Earl Scheib Of Concord — measurement config (Google tag: GA4 + Google Ads).
//
// One Google tag serves both products. GA4 loads from the head snippet on every
// page; this file adds the Google Ads account to the SAME tag and names the
// conversion actions that js/main.js fires. Fill in the AW values from
// Google Ads → Goals → Conversions after the conversion actions exist
// (the label is the part after the slash in "AW-123456789/AbCdEfGhIj").
//
// Until ADS_ID is set, nothing Ads-related fires and GA4 keeps working alone.
window.ESW_TAGS = {
  GA4_ID: "G-ZCTNDH2BGF",
  ADS_ID: "",                 // e.g. "AW-123456789"
  ADS_LEAD_LABEL: "",         // conversion action: "Estimate request (website form)"  — PRIMARY
  ADS_CALL_LABEL: ""          // conversion action: "Phone click (website)"             — SECONDARY
};

(function () {
  var t = window.ESW_TAGS;
  if (typeof window.gtag !== "function" || !t.ADS_ID) return;
  // Adds the Ads account to the already-loaded Google tag. Enhanced conversions
  // must also be switched on for each conversion action inside Google Ads.
  window.gtag("config", t.ADS_ID, { allow_enhanced_conversions: true });
})();
