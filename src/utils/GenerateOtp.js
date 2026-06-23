export default function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 90000);
  return otp;
}
