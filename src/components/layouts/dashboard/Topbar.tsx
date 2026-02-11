import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Tooltip,
} from "@mui/material";

export type TopbarProps = {
  title?: string;
  onOpenMobile: () => void;
};

export function Topbar({ title = "Dashboard", onOpenMobile }: TopbarProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Mobile menu */}
        <IconButton
          onClick={onOpenMobile}
          sx={{ display: { xs: "inline-flex", md: "none" }, mr: 1 }}
          aria-label="Open sidebar"
        >
          <MenuRoundedIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Notifications">
          <IconButton aria-label="Notifications">
            <Badge badgeContent={4} color="error">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <Avatar
            sx={{
              ml: 1.5,
              width: 34,
              height: 34,
              bgcolor: "primary.main",
              fontWeight: 700,
            }}
          >
            A
          </Avatar>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
