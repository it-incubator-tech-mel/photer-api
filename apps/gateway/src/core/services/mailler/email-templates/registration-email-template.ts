export const registrationEmailTemplate = (
  confirmationCode: string,
  baseUrl: string,
): string => {
  return `
     <h1>Thanks for your registration</h1>
     <p>To finish registration please follow the link:
         <a href='${baseUrl}/confirm-email?code=${confirmationCode}'>complete registration</a>
     </p>
  `;
};
