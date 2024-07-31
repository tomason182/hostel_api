const jwt = require("jsonwebtoken");

exports.jwtTokenGenerator = function (res, userId) {
  const payload = { sub: userId };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
  return res
    .cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
      sameSite: "strict",
      maxAge: 3600 * 8 * 1000, // 3600 sec/hs * 8hs * 1000 milisec/sec
    })
    .status(200)
    .json({ msg: "ok", token: token });
};
