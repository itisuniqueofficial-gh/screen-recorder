import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  IconAlert,
  IconBars,
  IconCamera,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconClose,
  IconCopy,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFilm,
  IconGithub,
  IconHistory,
  IconImage,
  IconInfo,
  IconKeyboard,
  IconMic,
  IconMonitor,
  IconMoon,
  IconPause,
  IconPlay,
  IconRecord,
  IconScreen,
  IconSettings,
  IconShare,
  IconStar,
  IconStarOutline,
  IconStop,
  IconSun,
  IconTrash,
  IconTrim,
  IconVolume,
  IconWifiOff,
  type IconProps,
} from '@/components/ui/icons';

const SOLID_ICONS: [string, (p: IconProps) => React.ReactNode, string][] = [
  ['IconAlert', IconAlert, 'fa-solid fa-triangle-exclamation'],
  ['IconBars', IconBars, 'fa-solid fa-bars'],
  ['IconCamera', IconCamera, 'fa-solid fa-video'],
  ['IconCheck', IconCheck, 'fa-solid fa-check'],
  ['IconChevronDown', IconChevronDown, 'fa-solid fa-chevron-down'],
  ['IconClock', IconClock, 'fa-solid fa-clock'],
  ['IconClose', IconClose, 'fa-solid fa-xmark'],
  ['IconCopy', IconCopy, 'fa-solid fa-copy'],
  ['IconDownload', IconDownload, 'fa-solid fa-download'],
  ['IconEdit', IconEdit, 'fa-solid fa-pen'],
  ['IconExternalLink', IconExternalLink, 'fa-solid fa-up-right-from-square'],
  ['IconFilm', IconFilm, 'fa-solid fa-film'],
  ['IconHistory', IconHistory, 'fa-solid fa-clock-rotate-left'],
  ['IconImage', IconImage, 'fa-solid fa-image'],
  ['IconInfo', IconInfo, 'fa-solid fa-circle-info'],
  ['IconKeyboard', IconKeyboard, 'fa-solid fa-keyboard'],
  ['IconMic', IconMic, 'fa-solid fa-microphone'],
  ['IconMonitor', IconMonitor, 'fa-solid fa-display'],
  ['IconMoon', IconMoon, 'fa-solid fa-moon'],
  ['IconPause', IconPause, 'fa-solid fa-pause'],
  ['IconPlay', IconPlay, 'fa-solid fa-play'],
  ['IconRecord', IconRecord, 'fa-solid fa-circle-dot'],
  ['IconScreen', IconScreen, 'fa-solid fa-desktop'],
  ['IconSettings', IconSettings, 'fa-solid fa-gear'],
  ['IconShare', IconShare, 'fa-solid fa-share-nodes'],
  ['IconStar', IconStar, 'fa-solid fa-star'],
  ['IconStop', IconStop, 'fa-solid fa-stop'],
  ['IconSun', IconSun, 'fa-solid fa-sun'],
  ['IconTrash', IconTrash, 'fa-solid fa-trash-can'],
  ['IconTrim', IconTrim, 'fa-solid fa-scissors'],
  ['IconVolume', IconVolume, 'fa-solid fa-volume-high'],
];

const REGULAR_ICONS: [string, (p: IconProps) => React.ReactNode, string][] = [
  ['IconStarOutline', IconStarOutline, 'fa-regular fa-star'],
];

describe('icons', () => {
  it.each(SOLID_ICONS)(
    '%s renders its FA 7 solid classes at the requested size',
    (name, Icon, faClass) => {
      const { container } = render(<Icon size={22} />);
      const icon = container.querySelector(`i.${faClass.replace('fa-solid ', '')}`);
      expect(icon, name).toBeInTheDocument();
      expect(icon, name).toHaveClass('fa-solid');
      expect(icon, name).toHaveStyle({ fontSize: '22px' });
    }
  );

  it.each(REGULAR_ICONS)('%s renders its FA 7 regular classes', (name, Icon, faClass) => {
    const { container } = render(<Icon />);
    const icon = container.querySelector('i.fa-regular');
    expect(icon, name).toBeInTheDocument();
    expect(icon, name).toHaveClass('fa-star');
    expect(
      container.querySelector(`i.${faClass.replace('fa-regular ', '')}`),
      name
    ).toBeInTheDocument();
  });

  it('renders the wifi-off composite of wifi and slash overlays', () => {
    const { container } = render(<IconWifiOff size={20} />);
    expect(container.querySelector('i.fa-wifi')).toBeInTheDocument();
    expect(container.querySelector('i.fa-slash')).toBeInTheDocument();
  });

  it('renders the github brand icon', () => {
    const { container } = render(<IconGithub />);
    expect(container.querySelector('i.fa-brands.fa-github')).toBeInTheDocument();
  });
});
