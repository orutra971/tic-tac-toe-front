import { styled, config} from 'stitches.config';
import React, { createElement, useMemo } from 'react';

const CardRoot = styled('div', {
  display: 'flex',
  backgroundColor: 'white',
  borderRadius: '6px',
  boxShadow: 'rgb(0 0 0 / 14%) 0px 2px 10px',
  
});

const styles = {
  variants: {
    flex: {
      full: { width: "100%" },
      players: { width: "calc(80% - 8px)" },
      leaderboard: { width: "calc(20% - 8px)" },
      player: {
        order: 2,
        marginLeft: 'auto',
        width: '200px',
      },
      opponent: {
        marginLeft: 'auto',
        width: '200px',
      },
      board: {
        width: "100%",
        backgroundColor: 'transparent',
        boxShadow: 'none',
      }
    },
    alignItems: {
      start: { alignItems: 'start'},
      center: { alignItems: 'center'},
    },
    justifyContent: {
      start: { justifyContent: 'start'},
      center: { justifyContent: 'center'},
    },

  },
};

type Flex = keyof typeof styles.variants.flex;
type AlignItems = keyof typeof styles.variants.alignItems;
type JustifyContent = keyof typeof styles.variants.justifyContent;

type Media = `@${keyof typeof config.media}` | "@initial";

type Props = {
  children?: React.ReactNode,
  flex?: Flex | { [key in Media]?: Flex };
  alignItems?: AlignItems | { [key in Media]?: AlignItems };
  justifyContent?: JustifyContent | { [key in Media]?: JustifyContent };
};

/**
 * We must be smart when defining cache-keys, as inline objects would
 * be seen as different in each render.
 *
 * If there are additional variant types, all would have to be processed similarly.
 */
 const useCacheKeys = (props: Props) => {
  const flex =
    typeof props.flex !== "object" ? { "@initial": props.flex } : props.flex;
  const alignItems =
    typeof props.alignItems !== "object" ? { "@initial": props.alignItems } : props.alignItems;
  const justifyContent =
    typeof props.justifyContent !== "object" ? { "@initial": props.justifyContent } : props.justifyContent;
  const cacheKeys = [
    Object.entries(flex)
      .map(([media, value]) => `${media}=${value}`)
      .join(","),
    Object.entries(alignItems)
      .map(([media, value]) => `${media}=${value}`)
      .join(","),
    Object.entries(justifyContent)
      .map(([media, value]) => `${media}=${value}`)
      .join(",")
  ];

  return cacheKeys;
};


const FixedDynamicComponent: React.FC<Props> = (props) => {
  const cacheKeys = useCacheKeys(props);

  const component = useMemo(
    () => styled(CardRoot, { cacheKey: cacheKeys.join("|"), ...styles }),
    cacheKeys,
  );

  return createElement(component, props);
};

const Card: React.FC<Props> = ({children, flex, alignItems}) => {

  return (
    <>
      <FixedDynamicComponent flex={flex} alignItems={alignItems}>
        {children}
      </FixedDynamicComponent>
    </>    
  );
}



export default Card;