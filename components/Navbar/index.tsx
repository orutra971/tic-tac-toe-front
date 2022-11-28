import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import { styled } from '@stitches/react';
import { violet, blackA, mauve } from '@radix-ui/colors';
import { Avatar, Image } from 'components';
import { User } from 'next-auth';
import { ExitIcon } from '@radix-ui/react-icons'

interface INavar { user: User, signOut: any }

const Navbar: React.FC<INavar> = ({ user, signOut }) => {
  return (
    <ToolbarRoot aria-label="Formatting options">
      <Image src="/assets/icon.png" alt="logo" width="40"  height="40" variant='nav' priority ={true}/>
      <ToolbarSeparator />
      <Avatar src={user.image}/>
      <AvatarUsername>{user.name}</AvatarUsername>
      <ToolbarButton css={{ marginLeft: 'auto' }} onClick={() => signOut()}>
        <ExitIcon />
        <Text>Sign Out</Text>
      </ToolbarButton>
    </ToolbarRoot>
  )
}

const ToolbarRoot = styled(Toolbar.Root, {
  display: 'flex',
  padding: 10,
  minWidth: 'max-content',
  borderRadius: 6,
  backgroundColor: 'white',
  boxShadow: `0 2px 10px ${blackA.blackA7}`,
});

const itemStyles = {
  all: 'unset',
  flex: '0 0 auto',
  color: mauve.mauve11,
  padding: '0 5px',
  borderRadius: 4,
  display: 'inline-flex',
  fontSize: 13,
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': { backgroundColor: violet.violet3, color: violet.violet11 },
  '&:focus': { position: 'relative', boxShadow: `0 0 0 2px ${violet.violet7}` },
};

const ToolbarSeparator = styled(Toolbar.Separator, {
  width: 1,
  backgroundColor: mauve.mauve6,
  margin: '0 10px',
});

const AvatarUsername = styled('div', {
  margin: 'auto 0',
  paddingLeft: 12,
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
});

const Text = styled('div', {
  paddingLeft: 10,
});

const ToolbarButton = styled(
  Toolbar.Button,
  {
    ...itemStyles,
    paddingLeft: 10,
    paddingRight: 10,
    color: 'white',
    backgroundColor: violet.violet9,
  },
  { '&:hover': { backgroundColor: violet.violet10 } }
);

export default Navbar;