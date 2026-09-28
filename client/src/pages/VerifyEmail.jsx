import {
  Container,
  Paper,
  Button,
  TextField,
  Box,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function VerifyEmail() {
  const initialMessage =
    " A verification email has been sent to your inbox. Please confirm\nyour account to continue.";

  const location = useLocation();
  const [isLoading, setIsLoading] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [inputEmail, setInputEmail] = useState(location.state?.email || "");
  const [verifyErrors, setVerifyErrors] = useState(location.state?.error || "");
  const [message, setMessage] = useState(
    location.state?.message || initialMessage,
  );

  const [countdown, setCountdown] = useState(0);
  const email = location.state?.email;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer); // Cleanup prevents memory leaks
    }
  }, [countdown]);

  useEffect(() => {
    window.history.replaceState({}, "");
  }, []);

  function handleEmailTyping(event) {
    setInputEmail(event.target.value);
  }

  async function handleResend(event) {
    event.preventDefault();
    console.log("resend");
    try {
      setIsLoading(true);
      let response;
      //   setIsLoading(true);
      if (email) {
        setInputEmail(email);
        response = await fetch(
          "http://localhost:8000/api/v1/users/resend-verify-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          },
        );
      } else {
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const formPayload = Object.fromEntries(formData.entries());
        setInputEmail(formPayload.email);
        response = await fetch(
          "http://localhost:8000/api/v1/users/resend-verify-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formPayload),
          },
        );
      }
      const data = await response.json();
      if (response.ok) {
        console.log("Success:", data);
        setToastOpen(true); // Pop the green success message
        setCountdown(60); // Lock the button for 60 seconds
      } else {
        setVerifyErrors(data.message);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Backdrop open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Container maxWidth="sm" sx={{ mt: 20 }}>
        <Box component="form" onSubmit={(event) => handleResend(event)}>
          <Paper
            elevation={10}
            sx={{
              padding: 4,
              textAlign: "center",
              fontSize: 20,
            }}
          >
            {message}
            <Button
              type="submit"
              fullWidth
              disabled={isLoading || countdown > 0}
              sx={{
                padding: 4,
                fontSize: 15,
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              {isLoading
                ? "Sending..."
                : countdown > 0
                  ? `Try again in ${countdown}s`
                  : "Don't see the email? Click to resend."}
            </Button>
            {/* {!email && (
              <TextField
                placeholder="Enter email"
                name="email"
                fullWidth
                required
                autoFocus
                disabled={isLoading}
                sx={{ mb: 2, mt: 5 }}
              />
            )} */}
            <TextField
              placeholder="Enter email"
              name="email"
              value={inputEmail}
              fullWidth
              required
              autoFocus
              disabled={isLoading}
              onChange={(event) => handleEmailTyping(event)}
              sx={{ mb: 2, mt: 5 }}
            />
          </Paper>
        </Box>
      </Container>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000} // Automatically disappears after 4 seconds
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Email successfully resent!
        </Alert>
      </Snackbar>
      <Snackbar
        open={verifyErrors}
        autoHideDuration={4000} // Automatically disappears after 4 seconds
        onClose={() => setVerifyErrors(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setVerifyErrors(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {verifyErrors}
        </Alert>
      </Snackbar>
    </>
  );
}

export default VerifyEmail;
