exports.generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

exports.getOtpExpiry = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return now;
};
