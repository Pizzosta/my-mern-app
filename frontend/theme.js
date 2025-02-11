import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "Poppins, sans-serif",  // Use Poppins for headings
    body: "Poppins, sans-serif",      // Use Roboto for body text
  },
});

export default theme;
