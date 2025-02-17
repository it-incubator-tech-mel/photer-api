export const passwordRecoveryEmailTemplate = (
  confirmationCode: string,
  baseUrl: string
): string => {
  return `
        <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='${baseUrl}/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
        </p>
    `;
};
