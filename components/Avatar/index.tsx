import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { css, styled } from '@stitches/react';
import { violet, blackA } from '@radix-ui/colors';

type AvatarVariants = 'player' | 'playerList';

interface IAvatar {
  src: string;
  username?: string;
  variant?: AvatarVariants;
}

const Avatar: React.FC<IAvatar> = ({src, username, variant}) => (
  <Flex variant={variant}>
    <AvatarRoot>
      <AvatarImage
        src={src}
        alt="Player avatar"
      />
    </AvatarRoot>
    {
      username ? <Text>{username}</Text> : <></>
    }
    
  </Flex>
);

const Text = styled('div', {
  paddingTop: '3px',
  margin: 'auto 4px',
});

const AvatarRoot = styled(AvatarPrimitive.Root, {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
  overflow: 'hidden',
  userSelect: 'none',
  width: 45,
  height: 45,
  borderRadius: '100%',
  backgroundColor: blackA.blackA3,
});

const AvatarImage = styled(AvatarPrimitive.Image, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
});

const Flex = styled('div', { 
  display: 'flex',
  variants: {
    variant: {
      player:  {
        margin: 'auto',
        padding: 0,
        maxWidth: '45px',
      },
      playerList: {
        width: "200px",
      }
    }
  }
});

export default Avatar;