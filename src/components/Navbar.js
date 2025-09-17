import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";

function Navbar({ username, role, onLogout }) {
  return (
    <Box sx={{ flexGrow: 1, marginBottom: 2 }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              color: "inherit",
              textDecoration: "none",
              fontWeight: 700,
              letterSpacing: ".05em"
            }}
          >
            Vereinsverwaltung
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button color="inherit" component={Link} to="/">
              Start
            </Button>
            {role === "admin" && (
              <>
                <Button color="inherit" component={Link} to="/neuer-termin">
                  Neuer Termin
                </Button>
                <Button color="inherit" component={Link} to="/neuer-user">
                  Neuer Benutzer
                </Button>
                <Button color="inherit" component={Link} to="/users">
                  Benutzerverwaltung
                </Button>
              </>
            )}
            {!!username && (
              <>
                <Typography variant="body2" sx={{ alignSelf: "center", mx: 1 }}>
                  Angemeldet als: <b>{username}</b> ({role})
                </Typography>
                <Button color="inherit" onClick={onLogout}>
                  Logout
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;