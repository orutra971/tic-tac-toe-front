
import React from 'react'
import { styled } from 'stitches.config';
import { violet } from '@radix-ui/colors';
const Label = styled('label', {
  fontSize: 13,
  lineHeight: 1,
  marginBottom: 10,
  color: violet.violet12,
  display: 'block',
});

// Use `Stitches.CSS` or the configured type as shown above
interface MyLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { children?: React.ReactNode }

const MyLabel: React.FC<MyLabelProps> = ({children, ...props}) => {
  return (
    <Label {...props} >
      {children}
    </Label>
  );
};

export default MyLabel;
