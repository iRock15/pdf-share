import {
  Avatar,
  Box,
  Container,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
  Checkbox,
  Button,
  Grid,
  Link,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [emailState, setEmailState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [error, setError] = useState("");
  const [needToVerify, setNeedToVerify] = useState(false);
  // const [validInput, setValidInput] = useState(null);
  const loginRef = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formPayload = Object.fromEntries(formData.entries());
    console.log("Form Payload:", formPayload);

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formPayload),
      });
      setIsLoading(false);
      const data = await response.json();
      if (response.ok) {
        setError("");
        setTimeout(() => navigate("/app"), 6000);

        loginRef.current = true;
        setIsLoading(false);
        setSuccess(true);
        loginRef.current = true;
        console.log("Success:", data);
        setToastOpen(true);
      } else if (response.status === 403) {
        setError("");

        setToastOpen(true);

        setError(data.message);
        setNeedToVerify(true);
      } else {
        setError("");

        setToastOpen(true);
        setError(data.message);
        // setValidInput(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   if (loginRef.current) {
  //     setTimeout(() => navigate("/app"), 6000);
  //   }
  // }, [navigate]);

  return (
    <>
      <Backdrop open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Container
        maxWidth="xs"
        sx={{
          mt: 20,
        }}
      >
        <Paper elevation={10} sx={{ marginTop: 8, padding: 2 }}>
          <Avatar
            sx={{
              mx: "auto",
              bgcolor: "secondary.main",
              textAlign: "center",
              mb: 1,
            }}
          >
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ textAlign: "center" }}>
            Log In
          </Typography>
          <Box
            component="form"
            onSubmit={(event) => handleSubmit(event)}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              placeholder="Enter email"
              fullWidth
              name="email"
              required
              autoFocus
              onChange={(event) => setEmailState(event.target.value)}
              value={emailState}
              sx={{ mb: 2 }}
            />
            <TextField
              placeholder="Enter password"
              fullWidth
              name="password"
              required
              type="password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>
              Log In
            </Button>
          </Box>
          <Grid container justifycontent="space-between" sx={{ mt: 1 }}>
            <Grid item="false">
              <Link component={RouterLink} to="/forgot">
                Forgot password?
              </Link>
            </Grid>
            <Grid item="false">
              <Link component={RouterLink} to="/signup">
                Sign Up
              </Link>
            </Grid>
            {needToVerify && (
              <Grid item="false">
                <Link
                  component={RouterLink}
                  to="/verify-email"
                  state={{ email: emailState }}
                >
                  Click here to send verification email.
                </Link>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Container>

      <Snackbar
        open={toastOpen}
        autoHideDuration={5000} // Automatically disappears after 4 seconds
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={success ? "success" : "error"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {success && "Successfully logged in. You will be redirected shortly."}
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Login;
