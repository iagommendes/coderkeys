import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/components/ui';

interface TranslationPanelProps {
  sourceText: string;
}

export function TranslationPanel({ sourceText }: TranslationPanelProps) {
  const { t } = useTranslation('lesson');

  return (
    <Card className="border-accent/30 bg-accent/5">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        {t('sourceText')}
      </p>
      <p className="text-base leading-relaxed text-foreground">{sourceText}</p>
    </Card>
  );
}
