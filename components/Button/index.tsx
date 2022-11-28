
import React from 'react'
import { styled } from 'stitches.config';
import { green } from '@radix-ui/colors';

const Button = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  padding: '0 15px',
  fontSize: 15,
  lineHeight: 1,
  fontWeight: 500,
  height: 35,

  variants: {
    variant: {
      green: {
        backgroundColor: green.green4,
        color: green.green11,
        '&:hover': { backgroundColor: green.green5 },
        '&:focus': { boxShadow: `0 0 0 2px ${green.green7}` },
      },
    },
  },
});

type MyButtonVariants = 'green';

// Use `Stitches.CSS` or the configured type as shown above
interface MyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { children?: React.ReactNode | string; variant?: MyButtonVariants }

const MyButton: React.FC<MyButtonProps> = ({children, variant, ...props}) => {
  return (
    <Button variant={variant} {...props} >
      {children}
    </Button>
  );
};

export default MyButton;
