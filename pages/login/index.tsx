import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { styled } from '@stitches/react';
import { violet, mauve, blackA, green } from '@radix-ui/colors';
import Fieldset from '@components/Fieldset/Fieldset';
import Input from '@components/Input/Input';
import Label from '@components/Label/Label';
import Image from '@components/Image/Image';
import Button from '@components/Button/Button';
import { signIn } from 'next-auth/react';

const Login = () => {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const handleEmail = (email: string) => {
    setEmail(email);
  }

  const handlePassword = (email: string) => {
    setPassword(email);
  }

  const handleLogin = () => {
    signIn('credentials',
      {
        email,
        password,
        // The page where you want to redirect to after a 
        // successful login
        callbackUrl: `${window.location.origin}/account_page` 
      }
    )
  }

  return (
    <Container>
      <TabsRoot defaultValue="tab1">
        <TabsList aria-label="Manage your account">
          <TabsTrigger value="tab1">Log in</TabsTrigger>
          <TabsTrigger value="tab2">Sign up</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <Image src="/icon.png" alt="logo" width="64"  height="64" variant='centered'/>
          <Fieldset>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" onChange={(e) => handlePassword(e.target.value)}/>
          </Fieldset>
          <Fieldset>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" onChange={(e) => handleEmail(e.target.value)} />
          </Fieldset>
          <Flex css={{ marginTop: 20, justifyContent: 'flex-end' }}>
            <Button variant="green" onClick={handleLogin}>Log in</Button>
          </Flex>
        </TabsContent>
        <TabsContent value="tab2">
          <Image src="/icon.png" alt="logo" width="64"  height="64" variant='centered'/>
          <Fieldset>
            <Label htmlFor="siginEmail">Email</Label>
            <Input id="siginEmail" type="email" />
          </Fieldset>
          <Fieldset>
            <Label htmlFor="siginPassword">Password</Label>
            <Input id="siginPassword" type="password" />
          </Fieldset>
          <Fieldset>
            <Label htmlFor="siginConfirmPassword">Confirm password</Label>
            <Input id="siginConfirmPassword" type="password" />
          </Fieldset>
          <Flex css={{ marginTop: 20, justifyContent: 'flex-end' }}>
            <Button variant={"green"}>Sign up</Button>
          </Flex>
        </TabsContent>
      </TabsRoot>
    </Container>
  )

};

const TabsRoot = styled(Tabs.Root, {
  display: 'flex',
  flexDirection: 'column',
  width: 300,
  boxShadow: `0 2px 10px ${blackA.blackA4}`,
});

const TabsList = styled(Tabs.List, {
  flexShrink: 0,
  display: 'flex',
  borderBottom: `1px solid ${mauve.mauve6}`,
});

const TabsTrigger = styled(Tabs.Trigger, {
  all: 'unset',
  fontFamily: 'inherit',
  backgroundColor: 'white',
  padding: '0 20px',
  height: 45,
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 15,
  lineHeight: 1,
  color: mauve.mauve11,
  userSelect: 'none',
  '&:first-child': { borderTopLeftRadius: 6 },
  '&:last-child': { borderTopRightRadius: 6 },
  '&:hover': { color: violet.violet11 },
  '&[data-state="active"]': {
    color: violet.violet11,
    boxShadow: 'inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor',
  },
  '&:focus': { position: 'relative', boxShadow: `0 0 0 2px black` },
});

const TabsContent = styled(Tabs.Content, {
  flexGrow: 1,
  padding: 20,
  backgroundColor: 'white',
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
  outline: 'none',
  '&:focus': { boxShadow: `0 0 0 2px black` },
});

const Text = styled('p', {
  marginTop: 0,
  marginBottom: 20,
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
});

const Flex = styled('div', { display: 'flex' });

const Container = styled('div', {
  height: '100%',
  padding: '0',
  margin: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});


export default Login;