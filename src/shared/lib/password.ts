// Совпадает с правилами, которые используются на экране восстановления
// пароля. Проверяем пароль до запроса OTP, чтобы не отправлять код для формы,
// которая всё равно будет отклонена регистрационным endpoint'ом.
export const isStrongPassword = (password: string): boolean =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password);

export const PASSWORD_REQUIREMENTS_ERROR =
  "Пароль должен содержать минимум 8 символов, заглавную и строчную латинские буквы и цифру";
