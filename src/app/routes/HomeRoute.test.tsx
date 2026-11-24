import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { HomeRoute } from './HomeRoute';

describe('HomeRoute', () => {
  it('renders text from the translation files', () => {
    render(<HomeRoute />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(i18n.t('app.name'));
    expect(screen.getByText(i18n.t('app.tagline'))).toBeInTheDocument();
  });

  it('switches language live', async () => {
    render(<HomeRoute />);
    await act(() => i18n.changeLanguage('en'));
    expect(screen.getByText('Plan your project before you code')).toBeInTheDocument();
    await act(() => i18n.changeLanguage('pt-BR'));
  });
});
