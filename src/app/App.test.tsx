import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { App } from './App';

describe('App', () => {
  it('renders text from the translation files', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(i18n.t('app.name'));
    expect(screen.getByText(i18n.t('app.tagline'))).toBeInTheDocument();
  });

  it('switches language live', async () => {
    await i18n.changeLanguage('en');
    render(<App />);
    expect(screen.getByText('Plan your project before you code')).toBeInTheDocument();
    await i18n.changeLanguage('pt-BR');
  });
});
