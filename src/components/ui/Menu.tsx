import { Check } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const itemClasses = cn(
  'relative flex h-8 cursor-default items-center gap-2.5 rounded-control px-2.5 text-[13px] text-text outline-none select-none',
  'pointer-coarse:h-11 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted',
  'data-[highlighted]:bg-fill-strong data-[disabled]:opacity-45',
);

type MenuProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
};

/** Action list anchored to an icon button (ux-ui 13.18). */
export function Menu({ trigger, children, align = 'end', side = 'bottom' }: MenuProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          side={side}
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            'surface-raised z-50 min-w-[200px] rounded-inner p-1 inset-ring inset-ring-stroke-strong',
            'origin-(--radix-dropdown-menu-content-transform-origin)',
            'data-[state=closed]:animate-[popover-out_var(--duration-fast)_ease-in] data-[state=open]:animate-[popover-in_var(--duration-fast)_var(--ease-out)]',
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

type MenuItemProps = {
  icon?: ReactNode;
  children: ReactNode;
  onSelect: () => void;
  /** Destructive actions sit in the last group, in danger (ux-ui 13.18). */
  destructive?: boolean;
  disabled?: boolean;
};

export function MenuItem({ icon, children, onSelect, destructive, disabled }: MenuItemProps) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(itemClasses, destructive && 'text-danger [&_svg]:text-danger')}
    >
      {icon}
      {children}
    </DropdownMenu.Item>
  );
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu.Label className="px-2.5 pt-1.5 pb-1 font-mono text-[11px] tracking-wider text-faint uppercase">
      {children}
    </DropdownMenu.Label>
  );
}

type MenuRadioGroupProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: ReactNode; icon?: ReactNode }[];
};

/** Choosable items (status) show a check, never color alone (ux-ui 13.18). */
export function MenuRadioGroup<T extends string>({
  value,
  onValueChange,
  options,
}: MenuRadioGroupProps<T>) {
  return (
    <DropdownMenu.RadioGroup value={value} onValueChange={(next) => onValueChange(next as T)}>
      {options.map((option) => (
        <DropdownMenu.RadioItem key={option.value} value={option.value} className={itemClasses}>
          {option.icon}
          <span className="flex-1">{option.label}</span>
          <DropdownMenu.ItemIndicator>
            <Check aria-hidden className="text-text!" />
          </DropdownMenu.ItemIndicator>
        </DropdownMenu.RadioItem>
      ))}
    </DropdownMenu.RadioGroup>
  );
}
