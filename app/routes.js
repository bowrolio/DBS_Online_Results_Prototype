const express = require('express');
const router = express.Router();

// middleware import
const { validateSex } = require('./middleware/validateSex');
const {
  validateNationalInsurance,
} = require('./middleware/validateNationalInsurance');
const {
  validateApplicationDetailsConfirm,
} = require('./middleware/validateApplicationDetailsConfirm');
const {
  validateWorkforceSelect,
} = require('./middleware/validateWorkforceSelect');
const {
  invalidateCache,
  loadPageData,
  savePageData,
} = require('./middleware/utilsMiddleware');

const cms = {
  generalContent: {
    continue: 'Continue',
  },
};

// Add your routes here - above the module.exports line

router.get('/create_account', (req, res) => {
  res.render('create_account');
});

router.get('/results_certificate', (req, res) => {
  res.render('results_certificate');
});

router.get('/test', (req, res) => {
  res.render('test');
});

router.get('/list-accounts', (req, res, _next) => {
  if (!req.session?.mockDBaccounts) {
    generateAccounts(req, false);
  }
  res.render('list-accounts', { accounts: req.session?.mockDBaccounts });
});

router.get('/enter-certificate', (req, res, _next) => {
  res.render('/dashboard/enter-certificate');
});

router.post('/dashboard/enter-certificate', (req, res, _next) => {
  const dbsCertificateNumber = req.body['dbs-certificate-nr'];
  savePageData(req, req.body);
  const inputCache = loadPageData(req);
  const dataValidation = {};
  let selectedCertificate = undefined;

  if (!dbsCertificateNumber) {
    dataValidation['dbs-certificate-nr'] = 'Enter certificate number';
  }

  if (
    dbsCertificateNumber.length !== 12 ||
    dbsCertificateNumber.slice(0, 2) !== '00' ||
    /^[0-9]+$/.test(dbsCertificateNumber) === false
  ) {
    dataValidation['dbs-certificate-nr'] = 'Enter valid certificate number';
  }

  if (dbsCertificateNumber) {
    if (req.session?.mockDBaccounts) {
      selectedCertificate = req.session?.mockDBaccounts.find(
        (el) => dbsCertificateNumber === el.certificateNumber
      );
      if (selectedCertificate) {
        req.session.selectedCertificate = selectedCertificate;
      } else {
        dataValidation['dbs-certificate-nr'] = 'Enter valid certificate number';
      }
    }
  }

  if (Object.keys(dataValidation).length) {
    res.render('dashboard/enter-certificate', {
      cache: inputCache,
      validation: dataValidation,
    });
  } else {
    res.redirect('/dashboard/request-otp');
  }
});

router.get('/dashboard/request-otp', (req, res, _next) => {
  let backButton = '/dashboard/enter-certificate';
  res.render('dashboard/request-otp', {
    backButton: backButton,
    cache: null,
    mobileNumber: req.session?.selectedCertificate?.mobileNumber || '',
    validation: null,
  });
});

router.post('/dashboard/request-otp', (req, res, _next) => {
  res.redirect('/dashboard/enter-otp');
});

router.get('/dashboard/enter-otp', (req, res, _next) => {
  let backButton = '/dashboard/request-otp';
  req.session.selectedCertificate.securityCode;
  console.log('OTP', req.session.selectedCertificate.securityCode);
  res.render('dashboard/enter-otp', {
    backButton: backButton,
    mobileNumber: req.session?.selectedCertificate?.mobileNumber || '',
    validation: null,
  });
});

router.post('/dashboard/enter-otp', (req, res, _next) => {
  let securityCode = req.body['securityCode'];
  const dataValidation = {};

  if (!securityCode) {
    dataValidation['securityCode'] = 'Enter security code';
  }

  if (securityCode != req.session.selectedCertificate.securityCode) {
    dataValidation['securityCode'] = 'Incorrect security code';
  }

  if (Object.keys(dataValidation).length) {
    res.render('dashboard/enter-otp', {
      backButton: '/dashboard/request-otp',
      validation: dataValidation,
    });
  } else {
    res.redirect('/results_certificate');
  }
});

router.get('/sign_in', (req, res, _next) => {
  let backButton = '/create_account';
  console.log(req.session.selectedCertificate.emailAddress);
  res.render('sign_in', {
    backButton: backButton,
    emailAddress: req.session?.selectedCertificate?.emailAddress || '',
    validation: null,
  });
});

router.post('/dashboard/sign_in', (req, res, _next) => {
  let submEmail = req.body['subEmail'];
  const dataValidation = {};

  if (!subEmail) {
    dataValidation['subEmail'] = 'Enter security code';
  }

  if (subEmail != req.session.selectedCertificate.emailAddress) {
    dataValidation['subEmail'] = 'Incorrect security code';
  }

  if (Object.keys(dataValidation).length) {
    res.render('sign_in_verify', {
      backButton: '/create_account',
      validation: dataValidation,
    });
  } else {
    res.redirect('/sign_in_verify');
  }
});

// Clear all data in session if you open /prototype-admin/clear-data
router.post('/prototype-admin/clear-data', function (req, res) {
  req.session.data = {};
  req.session.cache = {};
  generateAccounts(req, true);
  console.log('Mock Accounts:', req.session.mockDBaccounts);
  res.redirect('/start');
});

const generateAccounts = (req, refresh) => {
  if (!req.session?.mockDBaccounts) {
    const accounts = [];
    accounts.push({
      applicationNumber: 'E2233445566',
      firstName: 'Tariq',
      lastName: 'Aziz',
      DOB: '14 / 05 / 1995',
      certificateIssueDate: '25 / 07 / 2022',
      certificateNumber: '001122334455',
      emailAddress: 'tariq.doc@gmail.com',
      signInPassword: 'superman3',
      mobileNumber: '07456782308',
      securityCode: '123456',
      resultsDayPerformed: '25 / 07 / 2022',
      typeOfCheck: 'Enhanced with Barred',
      typeOfWorkforce: 'Adult and Children',
      dateOfIssue: '25 / 07 / 2022',
      firstLineAddress: '1 Arcadia Avenue',
      policeRecordsOfConvictions: 'None recorded',
      infoSection142Education: 'None recorded',
      dbsChildrenBarList: 'None recorded',
      dbsAdultBarList: 'None recorded',
      otherInfoChiefPolice: 'None recorded',
      organisationName: 'North Tees Hospital',
      oneTimeShareCode: '8w Ds xn 72',
    });
    accounts.push({
      applicationNumber: 'E1177889910',
      firstName: 'Jack',
      lastName: 'Morton',
      DOB: '03 / 02 / 1978',
      certificateIssueDate: '04 / 08 / 2022',
      certificateNumber: '006677889910',
      emailAddress: 'jack.beanstalk@hotmail.co.uk',
      signInPassword: 'spiderman99!',
      mobileNumber: '07621432112',
      securityCode: '654321',
      resultsDayPerformed: '04 / 08 / 2022',
      typeOfCheck: 'Basic',
      typeOfWorkforce: 'NA',
      dateOfIssue: '04 / 08 / 2022',
      firstLineAddress: '23a Flatts Lane',
      policeRecordsOfConvictions: 'None recorded',
      infoSection142Education: 'None recorded',
      dbsChildrenBarList: 'None recorded',
      dbsAdultBarList: 'None recorded',
      otherInfoChiefPolice: 'None recorded',
      organisationName: 'JW Building Services',
      oneTimeShareCode: '2F vc PB 24',
    });
    req.session.mockDBaccounts = accounts;
  } else if (req.session.mockDBaccounts && refresh) {
    delete req.session.mockDBaccounts;
    generateAccounts(req, false);
  }
};
module.exports = router;
