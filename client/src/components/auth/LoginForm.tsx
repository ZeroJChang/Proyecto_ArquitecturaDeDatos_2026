import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ListItemText,
} from '@mui/material';

import useAuth from '../../hooks/use-auth.hook';
import { isValidEmail } from '../../utils/check-email.util';

interface DemoUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

const DEMO_USERS: DemoUser[] = [
  { name: 'Admin Principal', email: 'admin@acme-ev.com', password: 'admin123', role: 'ADMIN' },
  { name: 'Operador Guatemala City', email: 'branch1@acme-ev.com', password: 'branch123', role: 'BRANCH_USER' },
  { name: 'Operador Quetzaltenango', email: 'branch2@acme-ev.com', password: 'branch123', role: 'BRANCH_USER' },
  { name: 'Operador Escuintla', email: 'branch3@acme-ev.com', password: 'branch123', role: 'BRANCH_USER' },
  { name: 'Propietario Uno', email: 'owner1@acme-ev.com', password: 'owner123', role: 'OWNER' },
  { name: 'Propietario Dos', email: 'owner2@acme-ev.com', password: 'owner123', role: 'OWNER' },
];

const getRoleColor = (role: string): 'error' | 'warning' | 'info' => {
  switch (role) {
    case 'ADMIN':
      return 'error';
    case 'BRANCH_USER':
      return 'warning';
    case 'OWNER':
      return 'info';
    default:
      return 'info';
  }
};

const LoginForm: React.FC = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState('');

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

  const handleDemoUserSelect = (email: string) => {
    const demoUser = DEMO_USERS.find((u) => u.email === email);
    if (demoUser) {
      setSelectedDemoUser(email);
      setEmail(demoUser.email);
      setPassword(demoUser.password);
      setEmailError('');
      setPasswordError('');
      setServerError('');
    }
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

      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel id="demo-user-label">Usuario demo</InputLabel>
        <Select
          labelId="demo-user-label"
          value={selectedDemoUser}
          label="Usuario demo"
          onChange={(e) => handleDemoUserSelect(e.target.value)}
        >
          {DEMO_USERS.map((user) => (
            <MenuItem key={user.email} value={user.email}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <ListItemText primary={user.name} />
                <Chip label={user.role} size="small" color={getRoleColor(user.role)} />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
