import React, { useEffect, useState } from 'react';
import * as Progress from '@radix-ui/react-progress';
import { blackA, mauve } from "@radix-ui/colors";
import { styled } from "@stitches/react";

const ProgressRoot = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  background: blackA.blackA9,
  borderRadius: '99999px',
  width: 200,
  height: 25,

  // Fix overflow clipping in Safari
  // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
  transform: 'translateZ(0)',
});

const Container = styled('div', {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  rowGap: '12px'
});


const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: 'green',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
});

const Text = styled('div', {
  color: mauve.mauve11,
  fontSize: 24,
  lineHeight: 1.5,
});

const ProgressBar: React.FC<{increment: number}> = ({increment}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress >= 100) return;
    const timer = setTimeout(() => setProgress((progress + increment) ), 1000);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <Container>
      <Text>
        {(100/increment - progress/increment)}
      </Text>
            
      <ProgressRoot value={0}>
        <ProgressIndicator style={{ transform: `translateX(-${100 - progress}%)` }} />
      </ProgressRoot>
    </Container>
  );
};

export default ProgressBar;