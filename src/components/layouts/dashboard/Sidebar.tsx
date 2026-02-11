import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

import { NAV_SECTIONS } from "@components/layouts/dashboard/nav";

export type SidebarProps = {
  width: number;
  collapsedWidth: number;
  open: boolean; // desktop open/collapsed
  onToggleOpen: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar(props: SidebarProps) {
  const {
    width,
    collapsedWidth,
    open,
    onToggleOpen,
    mobileOpen,
    onCloseMobile,
  } = props;
  const location = useLocation();

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand */}
      <Box
        sx={{
          px: open ? 2 : 1.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          gap: 1,
        }}
      >
        {open && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 800,
                flex: "0 0 auto",
              }}
            >
              🍡
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{ fontWeight: 700, color: "pink.main" }}
            >
              Dango
            </Typography>
          </Box>
        )}

        {open && (
          <IconButton
            size="small"
            onClick={onToggleOpen}
            aria-label="Collapse sidebar"
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
        )}

        {!open && (
          <IconButton
            size="small"
            onClick={onToggleOpen}
            aria-label="Expand sidebar"
          >
            <MenuOpenRoundedIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Nav */}
      <Box sx={{ px: open ? 1.25 : 0.75, py: 1, overflow: "auto" }}>
        {NAV_SECTIONS.map(section => (
          <Box key={section.title} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                px: open ? 1 : 0.5,
                color: "text.secondary",
                letterSpacing: 0.6,
                fontWeight: 700,
                display: open ? "block" : "none",
              }}
            >
              {section.title}
            </Typography>

            <List dense sx={{ mt: 0.5 }}>
              {section.items.map(item => {
                const selected = location.pathname === item.to;

                return (
                  <ListItemButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    selected={selected}
                    sx={{
                      borderRadius: 2,
                      my: 0.5,
                      px: open ? 1.25 : 1,
                      justifyContent: open ? "flex-start" : "center",
                      "&.Mui-selected": {
                        bgcolor: "action.selected",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 1.25 : 0,
                        justifyContent: "center",
                        color: selected ? "primary.main" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {open && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          noWrap: true,
                          fontSize: 13.5,
                          fontWeight: selected ? 700 : 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: "auto" }} />
    </Box>
  );

  const paperSx = {
    borderRight: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
  } as const;

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width, ...paperSx },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: open ? width : collapsedWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? width : collapsedWidth,
            transition: t =>
              t.transitions.create("width", {
                easing: t.transitions.easing.sharp,
                duration: t.transitions.duration.shortest,
              }),
            overflowX: "hidden",
            ...paperSx,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
