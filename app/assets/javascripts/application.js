function ready(fn) {
  if (document.readyState !== 'loading') {
    // IE9 support
    fn();
  } else {
    // Everything else
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production');
}

ready(() => {
  window.GOVUKFrontend.initAll();
  window.MOJFrontend.initAll();
});

function selectTab(id) {
  document.getElementById('share-result').style.display = 'none';
  document.getElementById('manage-codes').style.display = 'none';
  document.getElementById('dispute-result').style.display = 'none';
  document.getElementById('contact-dbs').style.display = 'none';
  document.getElementById(id).style.display = 'block';
}
