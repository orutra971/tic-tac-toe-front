import React, { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { styled } from '@stitches/react';
import { violet, mauve, blackA } from '@radix-ui/colors';
import { Button, Input, Fieldset, Image, Label} from '@components';
import { signIn , useSession } from 'next-auth/react';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import axios from 'axios';
import { useRouter } from 'next/router';


const Login = () => {
  const { data: session, status } = useSession();
  const { replace } = useRouter();

  // check if logged in
  useEffect(() => {
    if (status === "authenticated") replace('/');
  }, []);


  //tabs
  const [tab, setTab] = useState<string>("tab1");

  
  // login
  const [email, setEmail] = useState<string>("arturo.info2@gmail.com");
  const [password, setPassword] = useState<string>("Oaxaca06");

  // signup
  const [signupUsername, setSignupUsername] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [signupPasswordConfirmation, setSignupPasswordConfirmation] = useState<string>(""); 

  useEffect(() => {
    if (status === "authenticated") replace('/');
  }, []);

  const handleTab = (tab: string) => {
    setTab(tab);
  }


  const handleEmail = (email: string) => {
    setEmail(email);
  }

  const handlePassword = (password: string) => {
    setPassword(password);
  }

  const handleSignupUsername = (signupUsername: string) => {
    setSignupUsername(signupUsername);
  }

  const handleSignupEmail = (signupEmail: string) => {
    setSignupEmail(signupEmail);
  }

  const handleSignupPassword = (signupPassword: string) => {
    setSignupPassword(signupPassword);
  }

  const handleSignupPasswordConfirmation = (signupPasswordConfirmation: string) => {
    setSignupPasswordConfirmation(signupPasswordConfirmation);
  }

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!email || !email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    
    if(!password || !password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    const promise = signIn('credentials',
      {
        email,
        password,
        redirect: false,
      }
    ).then((res) => {
      if (res.error) throw res.error;
      replace('/');
      return res;
    });

    toast.promise(
      promise,
      {
        pending: {
          render(){
            return "Loading..."
          },
          icon: false,
        },
        error: {
          render({data}){
            // When the promise reject, data will contains the error
            return `${data}`
          }
        }
      }
    );
  }

  const handleSignin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!signupEmail || !signupEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }
    
    if(!signupPassword || !signupPassword.trim()) {
      toast.error("Please a password");
      return;
    }

    if (signupPassword !== signupPasswordConfirmation) {
      toast.error("Passwords don't match");
      return;
    }

    const promise = axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE}/auth/signup`, {username: signupUsername, email: signupEmail, password: signupPassword})
      .then((res) => res.data);

    toast.promise(
      promise,
      {
        pending: {
          render(){
            return "Loading..."
          },
          icon: false,
        },
        success: {
          render({data}){
            setSignupUsername("");
            handleSignupEmail("");
            handleSignupPassword("");
            handleSignupPasswordConfirmation("");
            setTab("tab1");
            return `${data.message}`
          }
        },
        error: {
          render({data}){
            return `${data}`
          }
        }
      }
    );
  }

  return (
    <Container>
      <ToastContainer />
      <TabsRoot defaultValue="tab1" value={tab} onValueChange={(value) => handleTab(value)}>
        <TabsList aria-label="Manage your account">
          <TabsTrigger value="tab1">Log in</TabsTrigger>
          <TabsTrigger value="tab2">Sign up</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <form onSubmit={handleLogin}>
            <Image src="/assets/icon.png" alt="logo" width="64"  height="64" variant='centered' priority ={true}/>
            <Fieldset>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => handleEmail(e.target.value)} required={true}/>
            </Fieldset>
            <Fieldset>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => handlePassword(e.target.value)} required={true}/>
            </Fieldset>
            <Flex css={{ marginTop: 20, justifyContent: 'flex-end' }}>
              <Button variant="green" type='submit'>Log in</Button>
            </Flex>
          </form>
        </TabsContent>
        <TabsContent value="tab2">
          <form onSubmit={handleSignin}>
            <Image src="/assets/icon.png" alt="logo" width="64"  height="64" variant='centered'/>
            <Fieldset>
              <Label htmlFor="siginUsername">Username</Label>
              <Input id="siginUsername" type="text" value={signupUsername} maxLength={20} onChange={(e) => handleSignupUsername(e.target.value)} required={true}/>
            </Fieldset>
            <Fieldset>
              <Label htmlFor="siginEmail">Email</Label>
              <Input id="siginEmail" type="email" value={signupEmail} onChange={(e) => handleSignupEmail(e.target.value)} required={true}/>
            </Fieldset>
            <Fieldset>
              <Label htmlFor="siginPassword">Password</Label>
              <Input id="siginPassword" type="password" value={signupPassword}  onChange={(e) => handleSignupPassword(e.target.value)} required={true}/>
            </Fieldset>
            <Fieldset>
              <Label htmlFor="siginConfirmPassword">Confirm password</Label>
              <Input id="siginConfirmPassword" type="password" value={signupPasswordConfirmation}  onChange={(e) => handleSignupPasswordConfirmation(e.target.value)} required={true}/>
            </Fieldset>
            <Flex css={{ marginTop: 20, justifyContent: 'flex-end' }}>
              <Button variant={"green"} type="submit">Sign up</Button>
            </Flex>
          </form>
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


const Flex = styled('div', { display: 'flex' });

const Container = styled('div', {
  height: '100%',
  padding: '0',
  margin: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});


export async function getServerSideProps(context) {
  return {
    props: {
      session: await unstable_getServerSession(
        context.req,
        context.res,
        authOptions
      ),
    },
  }
}

Login.auth = false;

export default Login;