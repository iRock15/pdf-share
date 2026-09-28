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
  FormControl,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formPayload = Object.fromEntries(formData.entries());
    console.log("Form Payload:", formPayload);
    try {
      setIsLoading(true);
      console.log("signup");
      const response = await fetch(
        "http://localhost:8000/api/v1/users/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formPayload),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
        navigate("/verify-email", {
          state: {
            email: formPayload.email,
          },
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

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
            Sign Up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              placeholder="Enter first name"
              name="firstName"
              fullWidth
              required
              autoFocus
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            <TextField
              placeholder="Enter last name"
              name="lastName"
              fullWidth
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            <TextField
              placeholder="Enter email"
              name="email"
              fullWidth
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            <TextField
              placeholder="Enter password"
              name="password"
              fullWidth
              required
              type="password"
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            <TextField
              placeholder="Confirm password"
              name="passwordConfirm"
              fullWidth
              required
              disabled={isLoading}
              type="password"
            />
            {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
            <Button
              type="submit"
              onSubmit={(event) => handleSubmit(event)}
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{ mt: 1 }}
            >
              Sign In
            </Button>
          </Box>
          {/* <Grid container justifycontent="space-between" sx={{ mt: 1 }}>
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
        </Grid> */}
        </Paper>
      </Container>
    </>
  );
};

export default Signup;
