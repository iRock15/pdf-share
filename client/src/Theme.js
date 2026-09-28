import { createTheme } from "@mui/material";

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f4f4f4",
          margin: 0,
          padding: 0,
        },
        "#root": {
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        },
        a: {
          textDecoration: "none",
          color: "inherit",
        },
      },
    },
  },
  colorSchemes: {
    dark: "",
  },
});

export default theme;
