import { createStitches, styled } from "@stitches/react";

const stitches = createStitches({
  media: {
    bp1: "(min-width: 320px)",
    bp2: "(min-width: 768px)",
    bp3: "(min-width: 1200px)",
  },
  theme: {
    colors: {
      // generated from coolors.co
      aliceBlue: "#F4FAFF",
      davyGrey: "#535657",

      cadetBlue: "#4F646F",
      platinum: "#DEE7E7",

      darkKhaki: "#B5BA72",
      darkSlateBlue: "#4F359B",

      // elements
      bg: "$aliceBlue",
      fg: "$davyGrey",
    },
    space: {
      xxs: "0.422rem",
      xs: "0.563rem",
      sm: "0.75rem",
      rg: "1rem",
      md: "1.33rem",
      lg: "1.77rem",
      xl: "2.369rem",
      xxl: "3.157rem",
    },
    fontSizes: {
      xxs: "0.422rem",
      xs: "0.563rem",
      sm: "0.75rem",
      rg: "1rem",
      md: "1.33rem",
      lg: "1.77rem",
      xl: "2.369rem",
      xxl: "3.157rem",
    },
  },
});

export const darkTheme = stitches.createTheme({
  colors: {
      bg: "$darkJungleGreen",
      fg: "$fluorescentBlue",
  }
});



const injectGlobalStyles = stitches.globalCss({
  "*": { fontFamily: "Hammersmith One" },
  "*:after": { fontFamily: "Hammersmith One" },
  "*:before": { fontFamily: "Hammersmith One" },
  body: { margin: 0, padding: 0, height: '100%'},
  html:  { height: '100%'},
  h1: { margin: 0 },
  "body > div": { height: '100%', backgroundColor: '$bg' }
})

injectGlobalStyles();

export default stitches;

export { styled }