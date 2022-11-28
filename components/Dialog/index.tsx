import React, { createElement, useEffect, useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { styled, keyframes } from '@stitches/react';
import { violet, blackA, red, mauve } from '@radix-ui/colors';
import { IGame, ILeaderboard } from 'types/app';
import Avatar from 'components/Avatar';
import ProgressBar from 'components/ProgressBar';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

const AlertDialogOverlay = styled(AlertDialog.Overlay, {
  backgroundColor: blackA.blackA9,
  position: 'fixed',
  inset: 0,
  animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
});

const AlertDialogContent = styled(AlertDialog.Content, {
  backgroundColor: 'white',
  borderRadius: 6,
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '500px',
  height: '320px',
  maxHeight: '85vh',
  padding: 25,
  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,

  '&:focus': { outline: 'none' },
});

const AlertDialogTitle = styled(AlertDialog.Title, {
  margin: 0,
  color: mauve.mauve12,
  fontSize: 17,
  fontWeight: 500,
});

const AlertDialogDescription = styled('div', {
  marginBottom: 20,
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
});

const Flex = styled('div', { display: 'flex' });

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
      violet: {
        backgroundColor: violet.violet4,
        color: violet.violet11,
        '&:hover': { backgroundColor: violet.violet3 },
        '&:focus': { boxShadow: `0 0 0 2px ${violet.violet7}` },
      },
      red: {
        backgroundColor: red.red4,
        color: red.red11,
        '&:hover': { backgroundColor: red.red5 },
        '&:focus': { boxShadow: `0 0 0 2px ${red.red7}` },
      },
      mauve: {
        backgroundColor: mauve.mauve4,
        color: mauve.mauve11,
        '&:hover': { backgroundColor: mauve.mauve5 },
        '&:focus': { boxShadow: `0 0 0 2px ${mauve.mauve7}` },
      },
    },
  },

  defaultVariants: {
    variant: 'violet',
  },
});

const Container = styled('div', {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  rowGap: '12px'
});

const Text = styled('div', {
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
});

const FixedDynamicComponent: React.FC<IAlertDialog> = (props) => {
  return createElement(AlertDialogInfo, props);
};

export interface IAlertDialog {
  opened: boolean;
  opponent?: ILeaderboard;
  title: string;
  description: string;
  match?: IGame;
  isMatchVictory?: boolean;
  time?: number;
  accept: () => Promise<void>;
  cancel: () => Promise<void>;
}

const AlertDialogInfo: React.FC<IAlertDialog> = ({opened, opponent, title, description, match, isMatchVictory = false, time = 10000, accept, cancel}) => {
  const [open, isOpen] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout>();
  const maxTime = 100000;


  useEffect(() => {
    if (opened) {
      isOpen(opened);
    } 
  }, [opened, match]);

  useEffect(() => {
    if (!match) return;
    const timer = setTimeout(() => isMatchVictory ? handleAccept() : handleCancel(), maxTime < time ? maxTime : time);
    setTimer(timer);
    return () => clearTimeout(timer);
  }, [opened, match]);

  const handleAccept = async () => {
    isOpen(false);
    if (timer) clearTimeout(timer);
    await accept();
  }

  const handleCancel= async () => {
    isOpen(false);
    if (timer) clearTimeout(timer);
    await cancel();
  }


  return (
    <AlertDialog.Root open={open} onOpenChange={isOpen}>
      <AlertDialog.Portal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <Container>
              <Text>
                {description}
              </Text>
              {
                opponent ?
                <>
                  <Avatar src={opponent.image}/>
                  <Text>{opponent.username}</Text>
                  <ProgressBar increment={maxTime / time}/>
                </>
                :
                <></>

              }
            </Container>
          </AlertDialogDescription>
          <Flex css={{ justifyContent: 'center' }}>
            {
              !isMatchVictory ? 
              <AlertDialog.Cancel asChild>
                  <Button variant="red" css={{ marginRight: 25 }} onClick={handleCancel}>
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
              :
              <></>
            }
            <AlertDialog.Action asChild>
              <Button variant="violet"  onClick={handleAccept}>
                Accept
              </Button>
            </AlertDialog.Action>
            
          </Flex>
        </AlertDialogContent>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
};

export default FixedDynamicComponent;