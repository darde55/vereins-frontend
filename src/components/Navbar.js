import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

function Navbar({ username, role, onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State für Mobile-Menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Button-Config
  const adminButtons = [
    { to: "/neuer-termin", label: "Neuer Termin" },
    { to: "/neuer-user", label: "Neuer Benutzer" },
    { to: "/users", label: "Benutzerverwaltung" }
  ];

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
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="end"
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                keepMounted
              >
                <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                  Start
                </MenuItem>
                {role === "admin" &&
                  adminButtons.map((btn) => (
                    <MenuItem
                      key={btn.to}
                      component={Link}
                      to={btn.to}
                      onClick={handleMenuClose}
                    >
                      {btn.label}
                    </MenuItem>
                  ))}
                {!!username && (
                  <MenuItem disabled>
                    <Typography variant="body2">
                      Angemeldet als: <b>{username}</b> ({role})
                    </Typography>
                  </MenuItem>
                )}
                {!!username && (
                  <MenuItem onClick={() => { handleMenuClose(); onLogout(); }}>
                    Logout
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button color="inherit" component={Link} to="/">
                Start
              </Button>
              {role === "admin" &&
                adminButtons.map((btn) => (
                  <Button
                    color="inherit"
                    component={Link}
                    to={btn.to}
                    key={btn.to}
                  >
                    {btn.label}
                  </Button>
                ))}
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
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;