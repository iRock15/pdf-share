import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline, Box } from "@mui/material";

import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import WebsiteNav from "./component/WebsiteNav";

import theme from "./Theme";
import VerifyToken from "./pages/VerifyToken";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <WebsiteNav />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify" element={<VerifyToken />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
