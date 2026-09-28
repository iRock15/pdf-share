import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ContrastIcon from "@mui/icons-material/Contrast";
import { makeStyles, useColorScheme } from "@mui/material";

function WebsiteNav() {
  const navigate = useNavigate();

  return (
    <>
      <Box>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                onClick={() => navigate("/")}
                sx={{
                  cursor: "pointer",
                  display: "inline-flex",
                }}
              >
                Home
                {/* LOGO */}
              </Typography>
            </Box>

            <Button color="inherit">
              <ContrastIcon></ContrastIcon>
            </Button>
            <Button color="inherit" onClick={() => navigate("/signup")}>
              Signup
            </Button>
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
            {/* AVATAR */}
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}

export default WebsiteNav;
