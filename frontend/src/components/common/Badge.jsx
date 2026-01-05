import { BADGES } from '@constants/styles/components';

const variantMap = {
  primary: BADGES.PRIMARY,
  secondary: BADGES.SECONDARY,
  accent: BADGES.ACCENT,
  success: BADGES.SUCCESS,
  warning: BADGES.WARNING,
  error: BADGES.ERROR,
  neutral: BADGES.NEUTRAL,
};

const sizeMap = {
  sm: BADGES.SIZE_SM,
  md: BADGES.SIZE_MD,
  lg: BADGES.SIZE_LG,
};

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
}) {
  const baseClasses = BADGES.BASE;
  const variantClasses = variantMap[variant] || variantMap.primary;
  const sizeClasses = sizeMap[size] || sizeMap.md;

  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
