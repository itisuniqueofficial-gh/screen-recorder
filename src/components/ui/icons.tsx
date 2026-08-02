import type { CSSProperties } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

interface IconShellProps extends IconProps {
  icon: string;
}

function IconShell({ icon, size = 20, className, style }: IconShellProps) {
  return (
    <i
      aria-hidden="true"
      className={`${icon} ${className ?? ''}`.trim()}
      style={{ fontSize: size, ...style }}
    />
  );
}

export function IconRecord(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-circle-dot" />;
}

export function IconStop(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-stop" />;
}

export function IconPause(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-pause" />;
}

export function IconPlay(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-play" />;
}

export function IconTrash(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-trash-can" />;
}

export function IconDownload(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-download" />;
}

export function IconEdit(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-pen" />;
}

export function IconStar(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-star" />;
}

export function IconStarOutline(p: IconProps) {
  return <IconShell {...p} icon="fa-regular fa-star" />;
}

export function IconClose(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-xmark" />;
}

export function IconCheck(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-check" />;
}

export function IconSettings(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-gear" />;
}

export function IconHistory(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-clock-rotate-left" />;
}

export function IconInfo(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-circle-info" />;
}

export function IconKeyboard(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-keyboard" />;
}

export function IconShare(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-share-nodes" />;
}

export function IconCopy(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-copy" />;
}

export function IconMic(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-microphone" />;
}

export function IconScreen(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-desktop" />;
}

export function IconCamera(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-video" />;
}

export function IconVolume(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-volume-high" />;
}

export function IconFilm(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-film" />;
}

export function IconClock(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-clock" />;
}

export function IconAlert(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-triangle-exclamation" />;
}

export function IconSun(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-sun" />;
}

export function IconMoon(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-moon" />;
}

export function IconMonitor(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-display" />;
}

export function IconChevronDown(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-chevron-down" />;
}

export function IconWifiOff({ size = 20, className, style }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center ${className ?? ''}`.trim()}
      style={{ width: size, height: size, ...style }}
    >
      <i className="fa-solid fa-wifi" style={{ fontSize: size }} />
      <i
        className="fa-solid fa-slash absolute"
        style={{
          fontSize: size * 0.55,
          left: '50%',
          top: '54%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </span>
  );
}

export function IconGithub(p: IconProps) {
  return <IconShell {...p} icon="fa-brands fa-github" />;
}

export function IconExternalLink(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-up-right-from-square" />;
}

export function IconImage(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-image" />;
}

export function IconTrim(p: IconProps) {
  return <IconShell {...p} icon="fa-solid fa-scissors" />;
}
