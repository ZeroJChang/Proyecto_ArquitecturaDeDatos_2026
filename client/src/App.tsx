import { CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router-dom';

import darkTheme from './themes/dark.theme';
import { AuthProvider } from './context/AuthContext';
import router from './routes/Routes';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
