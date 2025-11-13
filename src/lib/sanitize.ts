// Sanitization des inputs utilisateur
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+=/gi, ''); // Supprimer les event handlers
};

export const sanitizeNumber = (input: string | number): number | null => {
  const num = typeof input === 'string' ? parseInt(input, 10) : input;
  return isNaN(num) ? null : num;
};

export const sanitizeNumbers = (inputs: (string | number)[]): number[] => {
  return inputs
    .map(sanitizeNumber)
    .filter((n): n is number => n !== null);
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Limiter la longueur des strings
export const truncateString = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.substring(0, maxLength) : str;
};

// Échapper les caractères HTML
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};
