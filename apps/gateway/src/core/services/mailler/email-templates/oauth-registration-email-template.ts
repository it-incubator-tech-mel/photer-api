export const oAuthRegistrationEmailTemplate = (username: string): string => {
  return `
    <h1>Welcome, ${username}!</h1>
    <p>Your account has been successfully created using Google or GitHub.</p>
    <p>If you wish to set a password, you can do so via the password recovery process.</p>
    <p>Thanks for joining!</p>
  `;
};
