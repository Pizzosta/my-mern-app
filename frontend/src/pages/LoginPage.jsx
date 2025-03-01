import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/user";
import React from "react";

const LoginPage = () => {
  const [credentials, setCredentials] = React.useState({
    email: "",
    password: "",
  });
  const toast = useToast();
  const { login } = useUserStore();
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { success, message } = await login(credentials);

      toast({
        title: success ? "Success" : "Error",
        description: message,
        status: success ? "success" : "error",
        duration: 3000,
        isClosable: true,
      });
      
      if (success) {
        // Redirect to dashboard or home page
        navigate("/");
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box p={6} shadow="md" borderWidth={1} borderRadius={8}>
        <Heading mb={6}>Login</Heading>
        <FormControl mb={4}>
          <FormLabel>Email or Username</FormLabel>
          <Input
            type="text"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
          />
        </FormControl>
        <FormControl mb={6}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />
        </FormControl>
        <Button colorScheme="blue" onClick={handleLogin} width="full">
          Login
        </Button>
        <Text
          mt={4}
          textAlign={"center"}
          fontWeight="bold"
          //color="gray.500"
        >
          Don&apos;t have an account?{" "}
          <Link to={"/signup"}>
            <Text
              as="span"
              color="blue.500"
              _hover={{ textDecoration: "underline" }}
            >
              Sign Up
            </Text>
          </Link>
        </Text>
      </Box>
    </Container>
  );
};

export default LoginPage;
