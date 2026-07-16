// Shared icon set — Lucide-style, stroke-width 2.75, per the Organic design
// system's icon guidance (readme.md "Icons" section). Centralized here so the
// tab bar and every other icon button in the app draw from one consistent set.

function Icon({ children, size = 20, strokeWidth = 2.75, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}

export function IconCompass(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </Icon>
  );
}

export function IconHeart({ filled, ...props }) {
  return (
    <Icon {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20.2s-7.3-4.4-9.6-9C1 8 2 4.6 5.4 3.9c2.4-.5 4.4.7 6.6 3.2 2.2-2.5 4.2-3.7 6.6-3.2C22 4.6 23 8 21.6 11.2c-2.3 4.6-9.6 9-9.6 9z" />
    </Icon>
  );
}

export function IconChat(props) {
  return (
    <Icon {...props}>
      <path d="M4 12.3a7.7 7.7 0 1 1 3 6.1L4 20l1.2-3.9A7.6 7.6 0 0 1 4 12.3z" />
    </Icon>
  );
}

export function IconUser(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </Icon>
  );
}

export function IconChevronLeft(props) {
  return (
    <Icon {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Icon>
  );
}

export function IconSend(props) {
  return (
    <Icon {...props}>
      <path d="M3 11l18-8-8 18-2.4-7.4L3 11z" />
    </Icon>
  );
}

export function IconFilter(props) {
  return (
    <Icon {...props}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </Icon>
  );
}

export function IconEdit(props) {
  return (
    <Icon {...props}>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      <path d="M12 20h9" />
    </Icon>
  );
}

export function IconLogOut(props) {
  return (
    <Icon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function IconAlertTriangle(props) {
  return (
    <Icon {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
}
