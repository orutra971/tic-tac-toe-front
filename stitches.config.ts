import { createStitches } from "@stitches/react";

export const { styled, css, globalCss, config } = createStitches({
  media: {
    bp1: "(max-width: 767px)",
    bp2: "(min-width: 768px) and (max-width: 899px)",
    bp3: "(min-width: 900px)"
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

/*
export const darkTheme = theme.createTheme({
  colors: {
      bg: "$darkJungleGreen",
      fg: "$fluorescentBlue",
  }
});
*/


const injectGlobalStyles = globalCss({
  "*": { fontFamily: "Hammersmith One", boxSizing: "border-box" },
  "*:after": { fontFamily: "Hammersmith One" },
  "*:before": { fontFamily: "Hammersmith One" },
  body: { margin: 0, padding: 0, height: '100%'},
  html:  { height: '100%'},
  h1: { margin: 0 },
  "body > div": { height: '100%', backgroundColor: '$bg' }
})

injectGlobalStyles();

// export default stitches;
