import type { SvgIconComponent } from '@mui/icons-material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

export interface NavItem {
  href: string;
  label: string;
  icon: SvgIconComponent;
  description?: string;
}

export const employeeNav: NavItem[] = [
  {
    href: '/employee/balances',
    label: 'Balances',
    icon: AccountBalanceWalletOutlinedIcon,
    description: 'Vacation and sick days by location',
  },
  {
    href: '/employee/requests',
    label: 'Requests',
    icon: AssignmentOutlinedIcon,
    description: 'Book time off and track request status',
  },
];

export const managerNav: NavItem[] = [
  {
    href: '/manager/approvals',
    label: 'Approvals',
    icon: HowToRegOutlinedIcon,
    description: 'Review pending team requests',
  },
  {
    href: '/manager/history',
    label: 'History',
    icon: HistoryOutlinedIcon,
    description: 'Past approvals and denials',
  },
];
