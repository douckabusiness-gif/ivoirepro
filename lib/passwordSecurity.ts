const COMMON_PASSWORDS = new Set([
  '123456789012',
  'administrateur',
  'adminpassword',
  'motdepasse123',
  'password1234',
]);

export type PasswordValidation = {
  valid: boolean;
  errors: string[];
};

export function validateAdminPassword(password: unknown): PasswordValidation {
  if (typeof password !== 'string') {
    return { valid: false, errors: ['Le nouveau mot de passe est obligatoire.'] };
  }

  const errors: string[] = [];
  const characterCount = Array.from(password).length;
  const byteLength = new TextEncoder().encode(password).length;

  if (characterCount < 12) {
    errors.push('Utilisez au moins 12 caractères.');
  }
  if (byteLength > 72) {
    errors.push('Le mot de passe ne doit pas dépasser 72 octets.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Ajoutez au moins une lettre minuscule.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Ajoutez au moins une lettre majuscule.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Ajoutez au moins un chiffre.');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Ajoutez au moins un caractère spécial.');
  }
  if (/\p{Cc}/u.test(password)) {
    errors.push('Les caractères de contrôle ne sont pas autorisés.');
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Choisissez un mot de passe moins courant.');
  }

  return { valid: errors.length === 0, errors };
}
