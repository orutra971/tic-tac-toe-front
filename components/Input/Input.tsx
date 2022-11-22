
import React from 'react'
import { styled } from 'stitches.config';
import { violet } from '@radix-ui/colors';

const Input = styled('input', {
  all: 'unset',
  flex: '1 0 auto',
  borderRadius: 4,
  padding: '0 10px',
  fontSize: 15,
  lineHeight: 1,
  color: violet.violet11,
  boxShadow: `0 0 0 1px ${violet.violet7}`,
  height: 35,
  '&:focus': { boxShadow: `0 0 0 2px ${violet.violet8}` },
});

// Use `Stitches.CSS` or the configured type as shown above
interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement> { children?: React.ReactNode };

const MyInput: React.FC<MyInputProps> = ({children, ...props}) => {
  return (
    <Input {...props} >
      {children}
    </Input>
  );
};

export default MyInput;
