/**
 * Email Configuration Helper
 * Validates and provides email setup instructions
 */

export const validateEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.error('❌ EMAIL CONFIGURATION ERROR');
    console.error('Missing email credentials in .env file');
    console.error('');
    console.error('Required environment variables:');
    console.error('  EMAIL_USER=your-gmail@gmail.com');
    console.error('  EMAIL_PASSWORD=your-app-password');
    console.error('');
    console.error('To get Gmail App Password:');
    console.error('1. Go to https://myaccount.google.com/');
    console.error('2. Click "Security" in left sidebar');
    console.error('3. Enable 2-Step Verification if not enabled');
    console.error('4. Scroll to "App passwords"');
    console.error('5. Select "Mail" and "Windows Computer"');
    console.error('6. Copy the 16-character password');
    console.error('7. Add to .env as EMAIL_PASSWORD');
    console.error('');
    return false;
  }

  if (!emailUser.includes('@gmail.com')) {
    console.warn('⚠️  WARNING: EMAIL_USER does not appear to be a Gmail address');
    console.warn('This configuration is optimized for Gmail');
  }

  console.log('✅ Email configuration found');
  console.log(`   EMAIL_USER: ${emailUser}`);
  console.log(`   EMAIL_PASSWORD: ${emailPassword.substring(0, 3)}...`);
  return true;
};

export default validateEmailConfig;
