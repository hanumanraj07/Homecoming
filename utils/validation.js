const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test((value ?? '').trim());
}

export function isValidPassword(value) {
  return (value ?? '').length >= 8;
}
