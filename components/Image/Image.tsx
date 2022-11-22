
import React from 'react'
import { styled } from 'stitches.config';
import { ImageProps } from 'next/image';
import Image from 'next/image';

const SImage = styled('div', {
  maxHeight: 100,

  variants: {
    variant: {
      centered: {
        width: '64px',
        margin: '0 auto',
      }
    }
  }
});

type MyImageVariants = 'centered';

// Use `Stitches.CSS` or the configured type as shown above
interface MyImageProps extends ImageProps { variant?: MyImageVariants };


const MyImage: React.FC<MyImageProps> = ({ variant, ...props}) => {
  return (
    <SImage variant={variant}>
      <Image {...props} />
    </SImage>
  );
};

export default MyImage;
