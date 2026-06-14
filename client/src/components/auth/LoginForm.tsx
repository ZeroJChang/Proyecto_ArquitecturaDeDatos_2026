import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

import useAuth from '../../hooks/use-auth.hook';
import { isValidEmail } from '../../utils/check-email.util';

const LoginForm: React.FC = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('El email es requerido');
      return false;
    }
    if (!isValidEmail(value)) {
      setEmailError('Formato de email inválido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('La contraseña es requerida');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) validatePassword(value);
  };

  const isFormValid = (): boolean => {
    return isValidEmail(email) && password.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Error al iniciar sesión. Intenta nuevamente.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Iniciar Sesión
      </Typography>

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={handleEmailChange}
        onBlur={() => validateEmail(email)}
        error={!!emailError}
        helperText={emailError}
        autoComplete="email"
      />

      <TextField
        label="Contraseña"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={handlePasswordChange}
        onBlur={() => validatePassword(password)}
        error={!!passwordError}
        helperText={passwordError}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading || !isFormValid()}
        sx={{ mt: 3 }}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </Box>
  );
};

export default LoginForm;
