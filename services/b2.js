const B2 = require('backblaze-b2');
const b2 = new B2({
    applicationKeyId: process.env.APK_KEY_ID,
    applicationKey: process.env.APK_KEY
});
module.exports = b2;