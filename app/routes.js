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

router.get('/test', (req, res) => {
  res.render('test');
});

router.get('/list-accounts', (req, res, _next) => {
  if (!req.session?.mockDBaccounts) {
    generateAccounts(req, false);
  }
  res.render('list-accounts', { accounts: req.session?.mockDBaccounts });
});

//enter cert num
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

//request OTP
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

//enter OTP
router.get('/dashboard/enter-otp', (req, res, _next) => {
  let backButton = '/dashboard/request-otp';
  req.session.selectedCertificate.securityCode;
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
    res.redirect('/create_account');
  }
});

//sign in email
router.get('/sign_in', (req, res, _next) => {
  let backButton = '/create_account';
  res.render('sign_in', {
    backButton: backButton,
    emailAddr: req.session?.selectedCertificate?.emailAddress || '',
    validation: null,
  });
});

router.post('/sign_in', (req, res, _next) => {
  let postEmail = req.body['subEmail'];
  const dataValidation = {};

  if (!postEmail) {
    dataValidation['subEmail'] = 'Enter email address';
  }

  if (postEmail != req.session.selectedCertificate.emailAddress) {
    dataValidation['subEmail'] = 'Invalid email address';
  }

  if (Object.keys(dataValidation).length) {
    res.render('sign_in', {
      backButton: '/start',
      validation: dataValidation,
    });
  } else {
    res.redirect('/sign_in_verify');
  }
});

//sign in password
router.get('/sign_in_verify', (req, res, _next) => {
  let backButton = '/sign_in';
  res.render('sign_in_verify', {
    backButton: backButton,
    password: req.session?.selectedCertificate?.signInPassword || '',
    validation: null,
  });
});

router.post('/sign_in_verify', (req, res, _next) => {
  let signInPass = req.body['userPass'];
  const dataValidation = {};

  if (!signInPass) {
    dataValidation['userPass'] = 'Enter password';
  }

  if (signInPass != req.session.selectedCertificate.signInPassword) {
    dataValidation['userPass'] = 'Incorrect password';
  }

  if (Object.keys(dataValidation).length) {
    res.render('sign_in_verify', {
      backButton: '/sign_in',
      validation: dataValidation,
    });
  } else {
    res.redirect('/results_certificate');
  }
});

//applicant certificate
router.get('/results_certificate', (req, res, _next) => {
  let backButton = '/start';
  let certificateIssueDate =
    req.session?.selectedCertificate?.certificateIssueDate;
  let certificateNumber = req.session?.selectedCertificate?.certificateNumber;
  let typeOfCheck = req.session?.selectedCertificate?.typeOfCheck;
  let typeOfWorkforce = req.session?.selectedCertificate?.typeOfWorkforce;
  let lastName = req.session?.selectedCertificate?.lastName;
  let firstName = req.session?.selectedCertificate?.firstName;
  let DOB = req.session?.selectedCertificate?.DOB;
  let firstLineAddress = req.session?.selectedCertificate?.firstLineAddress;
  let policeRecordsOfConvictions =
    req.session?.selectedCertificate?.policeRecordsOfConvictions;
  let dateOfConviction = '';
  let offence = '';
  let date_offence = '';
  let court = '';
  let disposal = '';
  let police_force = '';

  if (policeRecordsOfConvictions != 'None recorded') {
    dateOfConviction += policeRecordsOfConvictions[0].date_conviction;
    offence += policeRecordsOfConvictions[1].offence;
    date_offence += policeRecordsOfConvictions[2].date_offence;
    court += policeRecordsOfConvictions[3].court;
    disposal += policeRecordsOfConvictions[4].disposal;
    police_force += policeRecordsOfConvictions[5].police_force;
  }

  let infoSection142Education =
    req.session?.selectedCertificate?.infoSection142Education;
  let dbsChildrenBarList = req.session?.selectedCertificate?.dbsChildrenBarList;
  let dbsAdultBarList = req.session?.selectedCertificate?.dbsAdultBarList;
  let otherInfoChiefPolice =
    req.session?.selectedCertificate?.otherInfoChiefPolice;
  let result = 'revelant information';
  if (
    policeRecordsOfConvictions[0].date_conviction ==
      'None recorded - Not applicable' &&
    infoSection142Education == 'None recorded' &&
    dbsChildrenBarList == 'None recorded' &&
    dbsAdultBarList == 'None recorded' &&
    otherInfoChiefPolice == 'None recorded'
  ) {
    result = 'no relevant information';
  }

  res.render('results_certificate', {
    backButton: backButton,
    certificateIssueDate: certificateIssueDate,
    certificateNumber: certificateNumber,
    typeOfCheck: typeOfCheck,
    typeOfWorkforce: typeOfWorkforce,
    lastName: lastName,
    firstName: firstName,
    DOB: DOB,
    firstLineAddress: firstLineAddress,
    policeRecordsOfConvictions: policeRecordsOfConvictions,
    dateOfConviction: dateOfConviction,
    offence: offence,
    date_offence: date_offence,
    court: court,
    disposal: disposal,
    police_force: police_force,
    infoSection142Education: infoSection142Education,
    dbsChildrenBarList: dbsChildrenBarList,
    dbsAdultBarList: dbsAdultBarList,
    otherInfoChiefPolice: otherInfoChiefPolice,
    result: result,
    validation: null,
  });
});

//share OT code for viewing cert
router.get('/share_OT_code_cert', (req, res, _next) => {
  let OT_code_cert = req.session?.selectedCertificate?.oneTimeShareCode;
  res.render('share_OT_code_cert', {
    OT_code_cert: OT_code_cert,
    validation: null,
  });
});

//needs to be updated from /sign in to /share_OT_code_cert and functionality
router.post('/sign_in', (req, res, _next) => {
  let postEmail = req.body['subEmail'];
  const dataValidation = {};

  if (!postEmail) {
    dataValidation['subEmail'] = 'Enter email address';
  }

  if (postEmail != req.session.selectedCertificate.emailAddress) {
    dataValidation['subEmail'] = 'Invalid email address';
  }

  if (Object.keys(dataValidation).length) {
    res.render('sign_in', {
      backButton: '/start',
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
  res.redirect('/start');
});

const generateAccounts = (req, refresh) => {
  if (!req.session?.mockDBaccounts) {
    const accounts = [];
    accounts.push({
      applicationNumber: 'E2233445566',
      firstName: 'Tariq',
      lastName: 'Aziz',
      DOB: '14/05/1995',
      certificateIssueDate: '25/07/2022',
      certificateNumber: '001122334455',
      emailAddress: 'tariq.doc@gmail.com',
      signInPassword: 'superman3',
      mobileNumber: '07456782308',
      securityCode: '123456',
      resultsDayPerformed: '25/07/2022',
      typeOfCheck: 'Enhanced with Barred',
      typeOfWorkforce: 'Adult and Children',
      dateOfIssue: '25/07/2022',
      firstLineAddress: '1 Arcadia Avenue',
      policeRecordsOfConvictions: [
        { date_conviction: 'None recorded - Not applicable' },
        { offence: 'None recorded - Not applicable' },
        { date_offence: 'None recorded - Not applicable' },
        { court: 'None recorded - Not applicable' },
        { disposal: 'None recorded - Not applicable' },
        { police_force: 'None recorded - Not applicable' },
      ],
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
      DOB: '03/02/1978',
      certificateIssueDate: '04/08/2022',
      certificateNumber: '006677889910',
      emailAddress: 'jack.beanstalk@hotmail.co.uk',
      signInPassword: 'spiderman99!',
      mobileNumber: '07621432112',
      securityCode: '654321',
      resultsDayPerformed: '04/08/2022',
      typeOfCheck: 'Basic',
      typeOfWorkforce: 'NA',
      dateOfIssue: '04/08/2022',
      firstLineAddress: '23a Flatts Lane',
      policeRecordsOfConvictions: [
        { date_conviction: '12/08/2017' },
        { offence: 'Obtaining property by deception' },
        { date_offence: '1/09/2006' },
        { court: 'Coventry' },
        { disposal: 'Probation order - 12 months' },
        { police_force: 'Merseyside Police' },
      ],
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
