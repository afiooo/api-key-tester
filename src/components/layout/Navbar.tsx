import { Globe, ChevronDown, Check, Sun, Moon, Monitor, Menu } from 'lucide-react';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useTheme, type ThemeMode } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/cn';

interface NavbarProps {
  onMenuClick?: () => void;
}

const themeIcon = {
  light: <Sun size={20} strokeWidth={2} />,
  dark: <Moon size={20} strokeWidth={2} />,
  system: <Monitor size={20} strokeWidth={2} />,
} as const;

export function Navbar({ onMenuClick }: NavbarProps) {
  const { mode, actual, setMode } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const langLabel: Record<string, string> = {
    zh: t('ui.chineseName'),
    en: t('ui.englishName'),
  };

  const themeLabel: Record<ThemeMode, string> = {
    light: t('lightMode'),
    dark: t('darkMode'),
    system: t('systemMode'),
  };

  return (
    <header className="w-full h-16 flex items-center justify-between gap-4 px-4 sm:px-8 bg-card border-b border-border">
      <div className="flex items-center gap-4 sm:gap-8 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-card text-fg hover:bg-bg cursor-pointer transition-colors"
          aria-label={t('ui.expandSidebar')}
        >
          <Menu size={20} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <KeyIcon />
          <h1 className="text-h1 font-bold text-fg whitespace-nowrap">
            {t('appTitle')}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <a
          href="https://github.com/weiruchenai1/api-key-tester"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-card text-fg hover:bg-bg transition-colors"
          aria-label="GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </a>

        <Dropdown
          trigger={
            <span className="inline-flex items-center gap-2 h-9 px-2 rounded-card hover:bg-bg transition-colors text-fg">
              <Globe size={20} strokeWidth={2} />
              <span className="hidden sm:inline text-btn font-bold">
                {langLabel[lang]}
              </span>
              <ChevronDown size={16} strokeWidth={2} />
            </span>
          }
          panelClassName="w-[150px]"
        >
          {(close) => (
            <>
              <DropdownItem
                active={lang === 'zh'}
                trailing={lang === 'zh' ? <Check size={20} className="text-success" /> : null}
                onClick={() => {
                  setLang('zh');
                  close();
                }}
              >
                {t('ui.chineseName')}
              </DropdownItem>
              <DropdownItem
                active={lang === 'en'}
                trailing={lang === 'en' ? <Check size={20} className="text-success" /> : null}
                onClick={() => {
                  setLang('en');
                  close();
                }}
              >
                {t('ui.englishName')}
              </DropdownItem>
            </>
          )}
        </Dropdown>

        <Dropdown
          trigger={
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-card hover:bg-bg transition-colors text-fg">
              {actual === 'dark' ? (
                <Moon size={20} strokeWidth={2} />
              ) : (
                <Sun size={20} strokeWidth={2} />
              )}
            </span>
          }
          panelClassName="w-[150px]"
        >
          {(close) => (
            <>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                <DropdownItem
                  key={m}
                  active={mode === m}
                  icon={themeIcon[m]}
                  trailing={
                    mode === m ? <Check size={20} className="text-success" /> : null
                  }
                  onClick={() => {
                    setMode(m);
                    close();
                  }}
                >
                  {themeLabel[m]}
                </DropdownItem>
              ))}
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}

function KeyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('text-fg shrink-0')}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}
