// Service pour les appels API liés à l'email.
import { reportApi } from './api';

/**
 * Envoie un rapport par email au backend.
 * Passe par l'instance axios `api` (intercepteur => Authorization: Bearer ...),
 * et renvoie directement le corps JSON (response.data).
 *
 * @param {object} reportData - Données du rapport.
 * @param {string} reportData.recipient - Email du destinataire.
 * @param {string} reportData.subject - Sujet de l'email.
 * @param {string} reportData.body - Corps de l'email.
 * @param {Array}  reportData.messages - Messages à inclure dans le rapport.
 * @param {string} reportData.format - Format de la pièce jointe ('json' ou 'csv').
 */
export const sendReport = async (reportData) => {
  return reportApi.email(reportData);
};

const emailService = {
  sendReport,
};

export default emailService;
