import {
  Box,
  Text,
  Link,
  HStack,
  VStack,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import {
  BsFacebook,
  BsInstagram,
  BsTwitterX,
  BsWhatsapp,
} from "react-icons/bs";

const Footer = () => {
  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box
      as="footer"
      p={4}
      bg={bg}
      color={textColor}
      textAlign="center"
      borderTop="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
    >
      <VStack spacing={2}>
        <Text fontSize="sm">
          © {new Date().getFullYear()} ZostaTech. All rights reserved.
        </Text>
        <HStack direction="row" spacing={4} justify="center">
          <Link href="/terms" color={textColor}>
            Terms of Service
          </Link>
          <Link href="/privacy" color={textColor}>
            Privacy Policy
          </Link>
          <Link href="/contact" color={textColor}>
            Contact Us
          </Link>
        </HStack>
        <HStack spacing={4} justify="center">
          <IconButton
            as={Link}
            href="https://facebook.com"
            target="_blank"
            aria-label="Facebook"
            icon={<BsFacebook />}
            colorScheme="facebook"
          />
          <IconButton
            as={Link}
            href="https://x.com"
            target="_blank"
            aria-label="X"
            icon={<BsTwitterX />}
            colorScheme="twitter"
          />
          <IconButton
            as={Link}
            href="https://instagram.com"
            target="_blank"
            aria-label="Instagram"
            icon={<BsInstagram />}
          />
          <IconButton
            as={Link}
            href="https://whatsapp.com"
            target="_blank"
            aria-label="Whatsapp"
            icon={<BsWhatsapp />}
            colorScheme="whatsapp"
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default Footer;
