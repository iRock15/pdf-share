import {
  Backdrop,
  CircularProgress,
  Container,
  Box,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Navigate } from "react-router-dom";

// async function useVerifyEmail(tokenArg, fn) {
//   const response = await fetch(
//     "http://localhost:8000/api/v1/users/resend-verify-email",
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       token: JSON.stringify({ tokenArg }),
//     },
//   );

//   if (!response.ok) {
//     fn();
//   } else {
//     const data = await response.json();
//     console.log("Success:", data);
//   }
// }

function VerifyToken() {
  const navigate = useNavigate();
  const doubleRenderRef = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const token = searchParams.get("token");

  console.log(token);

  useEffect(() => {
    async function fetchData() {
      if (token) {
        if (doubleRenderRef.current === false) {
          doubleRenderRef.current = true;
          const response = await fetch(
            "http://localhost:8000/api/v1/users/verify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ token: token }),
            },
          );

          if (!response.ok) {
            navigate("/verify-email", {
              state: {
                error: "Link invalid or expired. Please request a new one.",
                message: "Please write your email to re-send a new email.",
              },
            });
          } else {
            const data = await response.json();
            console.log("Success:", data);
            setSuccess(true);
            setToastOpen(true);
            setTimeout(() => navigate("/app"), 6000);
          }
        }
      }
    }
    fetchData();
  }, [navigate, token]);

  if (!token) return <Navigate replace to="/verify-email" />;

  return (
    <>
      <Backdrop open={!success}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Container maxWidth="sm" sx={{ mt: 20 }}>
        <Box>
          <Paper
            elevation={10}
            sx={{
              padding: 4,
              textAlign: "center",
              fontSize: 20,
            }}
          >
            {!success
              ? "Verifying your email, please wait..."
              : "Success! Your email address has been verified. Logging you in..."}
          </Paper>
        </Box>
      </Container>

      <Snackbar
        open={toastOpen}
        autoHideDuration={5000} // Automatically disappears after 4 seconds
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Verification Successed!
        </Alert>
      </Snackbar>
    </>
  );
}

export default VerifyToken;
