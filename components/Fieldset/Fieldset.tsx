
import React from 'react'
import { styled } from 'stitches.config';
import type * as Stitches from '@stitches/react';

const Fieldset = styled('fieldset', {
  all: 'unset',
  marginBottom: 15,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
});

// Use `Stitches.CSS` or the configured type as shown above
interface MyFieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> { children?: React.ReactNode };

const MyFieldset: React.FC<MyFieldsetProps> = ({children, ...props}) => {
  return (
    <Fieldset {...props} >
      {children}
    </Fieldset>
  );
};

export default MyFieldset;
