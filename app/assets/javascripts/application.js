//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

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
  const hashVal = window.location.href.split('#').pop();
  if (hashVal === 'share-result') {
    selectTab('share-result');
  }
});

function selectTab(id) {
  
  if (document.getElementById('show-result')) {
    document.getElementById('show-result').style.display = 'none';
  }
  
  if (document.getElementById('share-result')) {
    document.getElementById('share-result').style.display = 'none';
  }
  
  if (document.getElementById('manage-codes')) {
    document.getElementById('manage-codes').style.display = 'none';
  }
  
  if (document.getElementById('dispute-result')) {
    document.getElementById('dispute-result').style.display = 'none';
  }
  
  if (document.getElementById('contact-dbs')) {
    document.getElementById('contact-dbs').style.display = 'none';
  }
  
  document.getElementById(id).style.display = 'block';
}

function reveal() {
  document.getElementById('containOne').style.display = 'none';
  document.getElementById('containTwo').style.display = 'block';
}
