'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { authApi } from '@/shared/lib/api';
import { useSessionStore } from '@/features/auth/session-store';
import type { NavItem } from '@/shared/lib/navigation';

const DRAWER_WIDTH = 240;

interface SideNavContentProps {
  items: NavItem[];
  title: string;
  onNavigate?: () => void;
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <List
      component="ul"
      disablePadding
      sx={{ px: 1.5, py: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={active}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            aria-label={item.description ?? item.label}
            sx={{
              borderRadius: 1.5,
              py: 0.875,
              px: 1.5,
              minHeight: 40,
              borderLeft: '3px solid transparent',
              color: active ? 'primary.main' : 'text.primary',
              '& .MuiListItemIcon-root': {
                minWidth: 32,
                color: active ? 'primary.main' : 'text.secondary',
              },
              '& .MuiListItemText-primary': {
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
                lineHeight: 1.4,
              },
              '&:hover': {
                bgcolor: alpha(theme.palette.text.primary, 0.04),
              },
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderLeftColor: 'primary.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            }}
          >
            <ListItemIcon>
              <Icon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
}

function SideNavFooter({ onNavigate }: { onNavigate?: () => void }) {
  const setUser = useSessionStore((s) => s.setUser);
  const router = useRouter();
  const theme = useTheme();

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    router.push('/login');
    onNavigate?.();
  };

  return (
    <Box sx={{ mt: 'auto', borderTop: 1, borderColor: 'divider', p: 1.5 }}>
      <ListItemButton
        onClick={logout}
        sx={{
          borderRadius: 1.5,
          py: 0.875,
          px: 1.5,
          minHeight: 40,
          color: 'text.secondary',
          '& .MuiListItemIcon-root': { minWidth: 32, color: 'inherit' },
          '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: 500 },
          '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.04) },
        }}
      >
        <ListItemIcon>
          <LogoutIcon sx={{ fontSize: 20 }} />
        </ListItemIcon>
        <ListItemText primary="Log out" />
      </ListItemButton>
    </Box>
  );
}

function SideNavContent({ items, title, onNavigate }: SideNavContentProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Box sx={{ px: 2, pt: title ? 2.5 : 2, pb: title ? 1 : 0 }}>
          {title ? (
            <Typography
              variant="caption"
              component="p"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontSize: '0.6875rem',
              }}
            >
              {title}
            </Typography>
          ) : null}
        </Box>
        <NavList items={items} onNavigate={onNavigate} />
      </Box>
      <SideNavFooter onNavigate={onNavigate} />
    </Box>
  );
}

interface DashboardSideNavProps {
  items: NavItem[];
  title: string;
}

export function DashboardSideNav({ items, title }: DashboardSideNavProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box' as const,
    borderRight: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
  };

  if (!isDesktop) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.25,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <IconButton
            edge="start"
            size="small"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          {title ? (
            <Typography variant="subtitle2" fontWeight={600}>
              {title}
            </Typography>
          ) : null}
        </Box>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiBackdrop-root': { bgcolor: alpha(theme.palette.common.black, 0.4) },
            '& .MuiDrawer-paper': { ...drawerPaperSx, display: 'flex', flexDirection: 'column' },
          }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', minHeight: 48, flexShrink: 0 }}>
            <IconButton onClick={closeMobile} aria-label="Close navigation" size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Toolbar>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <SideNavContent items={items} title={title} onNavigate={closeMobile} />
          </Box>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      component="nav"
      aria-label={title ? `${title} navigation` : 'Main navigation'}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 64,
        alignSelf: 'flex-start',
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SideNavContent items={items} title={title} />
    </Box>
  );
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  navTitle: string;
  children: ReactNode;
}

export function DashboardLayout({ navItems, navTitle, children }: DashboardLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <DashboardSideNav items={navItems} title={navTitle} />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
