// A service for handling email-related API calls.

/**
 * Sends an email report to the backend.
 *
 * @param {object} reportData - The data for the email report.
 * @param {string} reportData.recipient - The recipient's email address.
 * @param {string} reportData.subject - The email subject.
 * @param {string} reportData.body - The email body.
 * @param {Array} reportData.messages - The array of messages to include in the report.
 * @param {string} reportData.format - The format of the attachment ('json' or 'csv').
 */
export const sendReport = async (reportData) => {

  const response = await fetch('/api/report/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to send email report. Server responded with:', errorBody);
    throw new Error('Failed to send email report.');
  }

  return response.json();
};

const emailService = {
  sendReport,
};

export default emailService;