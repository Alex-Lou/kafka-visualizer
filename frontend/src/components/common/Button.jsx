import { Loader2 } from 'lucide-react';
import { BUTTONS } from '@constants/styles/components';

const variantMap = {
  primary: BUTTONS.PRIMARY,
  secondary: BUTTONS.SECONDARY,
  ghost: BUTTONS.GHOST,
  accent: BUTTONS.ACCENT,
  danger: BUTTONS.DANGER,
  success: BUTTONS.SUCCESS,
};

const sizeMap = {
  xs: BUTTONS.SIZE_XS,
  sm: BUTTONS.SIZE_SM,
  md: BUTTONS.SIZE_MD,
  lg: BUTTONS.SIZE_LG,
  xl: BUTTONS.SIZE_XL,
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseClasses = BUTTONS.BASE;
  const variantClasses = variantMap[variant] || variantMap.primary;
  const sizeClasses = sizeMap[size] || sizeMap.md;

  const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
}
