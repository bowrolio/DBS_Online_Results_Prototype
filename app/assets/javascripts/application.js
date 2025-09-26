//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

function ready(fn) {
  if (document.readyState !== "loading") {
    // IE9 support
    fn();
  } else {
    // Everything else
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function copyLink(event) {
  console.log("COPY LINK", event);
  navigator.clipboard.writeText(event.target.dataset.link);
}
