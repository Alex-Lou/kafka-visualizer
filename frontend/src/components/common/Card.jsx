import { CARDS } from '@constants/styles/components';

export function Card({ children, variant = 'default', padding = 'md', className = '', ...props }) {
  const variantMap = {
    default: CARDS.DEFAULT,
    interactive: CARDS.INTERACTIVE,
    glass: CARDS.GLASS,
    flat: CARDS.FLAT,
    elevated: CARDS.ELEVATED,
  };

  const paddingMap = {
    sm: CARDS.PADDING_SM,
    md: CARDS.PADDING_MD,
    lg: CARDS.PADDING_LG,
    xl: CARDS.PADDING_XL,
    none: '',
  };

  const classes = `${CARDS.BASE} ${variantMap[variant]} ${paddingMap[padding]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, withActions = false, className = '' }) {
  const classes = withActions ? CARDS.HEADER_WITH_ACTIONS : CARDS.HEADER;
  return <div className={`${classes} ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`${CARDS.BODY} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`${CARDS.FOOTER} ${className}`}>{children}</div>;
}

export default Card;
