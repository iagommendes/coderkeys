import { useEffect, useRef } from 'react';
import { EditorView, drawSelection } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { useSettingsStore } from '@/shared/stores/settings.store';

interface CodePreviewProps {
  code: string;
  language?: string;
}

function getLanguageExtension(language?: string) {
  if (language === 'json') return json();
  return javascript({ typescript: language === 'typescript' });
}

export function CodePreview({ code, language }: CodePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    if (!containerRef.current) return;

    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const view = new EditorView({
      doc: code,
      parent: containerRef.current,
      extensions: [
        getLanguageExtension(language),
        EditorView.editable.of(false),
        drawSelection(),
        EditorView.lineWrapping,
        ...(isDark ? [oneDark] : []),
      ],
    });

    return () => view.destroy();
  }, [code, language, theme]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-xl border border-border bg-surface-elevated text-sm"
      aria-hidden
    />
  );
}
