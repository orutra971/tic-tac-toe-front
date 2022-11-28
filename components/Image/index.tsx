
import React from 'react'
import { styled } from 'stitches.config';
import { ImageProps } from 'next/image';
import Image from 'next/image';

const StyledImage = styled('div', {
  maxHeight: 100,

  variants: {
    variant: {
      centered: {
        width: '64px',
        margin: '0 auto',
      },
      nav: {
        height: 40,
        paddingTop: '2.5px',
        paddingBottom: '2.5px',
      }
    }
  }
});

type MyImageVariants = 'centered' | 'nav';

// Use `Stitches.CSS` or the configured type as shown above
interface MyImageProps extends ImageProps { variant?: MyImageVariants }


const MyImage: React.FC<MyImageProps> = ({ variant, ...props}) => {
  return (
    <StyledImage variant={variant}>
      <Image {...props} />
    </StyledImage>
  );
};

export default MyImage;
