require("dotenv").config();
const fetchDataHelper = require("../utils/fetchDataHelper");

async function verifyCaptcha(captchaToken) {
  const secretKey = process.env.SITE_PRIVATE_KEY;
  const url = "https://www.google.com/recaptcha/api/siteverify";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const bodyData = `secret=${encodeURIComponent(
    secretKey
  )}&response=${encodeURIComponent(captchaToken)}`;

  try {
    const response = await fetchDataHelper(url, options, bodyData);
    if (response.success) {
      console.log("CAPTCHA verification successful");
      return true;
    } else {
      console.log("CAPTCHA verification fail");
      return false;
    }
  } catch (e) {
    console.error("CAPTCHA verification error: ", e.message);
    return false;
  }
}

module.exports = verifyCaptcha;
