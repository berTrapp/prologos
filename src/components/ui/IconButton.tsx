import { forwardRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from './Button';
import { Tooltip } from './Tooltip';

type IconButtonProps = Omit<ButtonProps, 'size' | 'children' | 'icon' | 'aria-label'> & {
  icon: ReactNode;
  /** Required: becomes the aria-label and the tooltip (ux-ui 13.7). */
  label: string;
  shortcut?: string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
};

/** 32 × 32 icon-only button (44 on touch) with aria-label and tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, shortcut, tooltipSide, variant = 'quiet', ...props },
  ref,
) {
  return (
    <Tooltip content={label} shortcut={shortcut} side={tooltipSide}>
      <Button ref={ref} size="icon" variant={variant} aria-label={label} icon={icon} {...props} />
    </Tooltip>
  );
});
