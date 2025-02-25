import {
  Box,
  Button,
  Container,
  Heading,
  useColorModeValue,
  VStack,
  Input,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/user"; // Import the store

const SignupPage = () => {
  const [newUser, setNewUser] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    email: "",
    password: "",
  });

  const toast = useToast(); // Initialize the toast

  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { createUser } = useUserStore(); // Destructure createUser from the store
  const navigate = useNavigate();

  // Simplified phone validation
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) return "Phone must be 10 digits frontend";
    if (!/^\d+$/.test(cleaned)) return "Only numbers allowed";
    return "";
  };

  // Simplified Email validation
  const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email format";
    return "";
  };

  // Simplified Password validation
  const validatePassword = (password) => {
    if (password.length < 6) return "Password should be at least 6 characters";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!newUser.firstName.trim()) newErrors.firstName = "First name required";
    if (!newUser.lastName.trim()) newErrors.lastName = "Last name required";
    if (!newUser.password) newErrors.password = "Password required";
    if (newUser.password !== newUser.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    if (!newUser.username.trim()) newErrors.username = "Username required";

    // Email validation
    const emailError = validateEmail(newUser.email);
    if (emailError) newErrors.email = emailError;

    // Phone validation
    const phoneError = validatePhone(newUser.phone);
    if (phoneError) newErrors.phone = phoneError;

    // Password validation
    const passwordError = validatePassword(newUser.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Username change
  const handleUsernameChange = (e) => {
    setNewUser({ ...newUser, username: e.target.value });
    setErrors({ ...errors, username: "" }); // Clear Username error
  };

  // Handle firstName change
  const handleFirstnameChange = (e) => {
    setNewUser({ ...newUser, firstName: e.target.value });
    setErrors({ ...errors, firstName: "" }); // Clear firstName error
  };

  // Handle lastName change
  const handleLastnameChange = (e) => {
    setNewUser({ ...newUser, lastName: e.target.value });
    setErrors({ ...errors, lastName: "" }); // Clear lastName error
  };

  // Handle Phone change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and limit to 10 digits
    const cleaned = value.replace(/\D/g, "").slice(0, 10);

    setNewUser((prev) => ({
      ...prev,
      phone: cleaned,
    }));

    // Real-time validation
    const error = validatePhone(cleaned);
    setErrors((prev) => ({ ...prev, phone: error }));
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    const email = value.trim();
    setNewUser((prev) => ({
      ...prev,
      email,
    }));

    // Real-time validation
    const error = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: error }));
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewUser((prev) => ({
      ...prev,
      password,
    }));

    // Real-time validation
    const error = validatePassword(password);
    setErrors((prev) => ({
      ...prev,
      password: error,
    }));
  };

  // Confirm password handler
  const handleConfirmPasswordChange = (e) => {
    setNewUser((prev) => ({
      ...prev,
      confirmPassword: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  // Handle Show password
  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleSignup = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please provide all required fields.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedUser = {
        ...newUser,
        phone: parseFloat(newUser.phone),
      };

      const { success, message } = await createUser(formattedUser);

      if (success) {
        toast({
          title: "Success!",
          description: message,
          status: "success",
          duration: 3000,
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: message,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setNewUser({
      firstName: "",
      phone: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      username: "",
      email: "",
    });
    setErrors({}); // Clear errors
  };

  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"xl"} textAlign={"center"} mb={4}>
          CREATE ACCOUNT
        </Heading>
      </VStack>
      <Box
        w={"full"}
        p={4}
        borderWidth={1}
        borderRadius={8}
        shadow={"md"}
        bg={useColorModeValue("gray.50", "gray.700")}
      >
        <VStack spacing={4}>
          <FormInput
            label="Firstname"
            type="text"
            value={newUser.firstName}
            onChange={handleFirstnameChange}
            error={errors.firstName}
            isRequired
          />
          <FormInput
            label={"LastName"}
            type="text"
            value={newUser.lastName}
            onChange={handleLastnameChange}
            error={errors.lastName}
            isRequired
          />
          <FormInput
            label={"Username"}
            type="text"
            value={newUser.username}
            onChange={handleUsernameChange}
            error={errors.username}
            isRequired
          />
          <FormInput
            label={"Email"}
            type="text"
            value={newUser.email}
            onChange={handleEmailChange}
            error={errors.email}
            isRequired
          />
          <FormInput
            label="Phone"
            placeholder="10 digit Phone Number"
            type="text"
            value={newUser.phone}
            onChange={handlePhoneChange}
            error={errors.phone}
            isRequired
          />
          {/* Password Field */}
          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={handlePasswordChange}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  variant="ghost"
                  onClick={handleShowPassword}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputRightElement>
            </InputGroup>
            {errors.password && (
              <FormHelperText color="red.500">{errors.password}</FormHelperText>
            )}
          </FormControl>

          {/* Confirm Password Field */}
          <FormControl isInvalid={!!errors.confirmPassword} isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={newUser.confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" variant="ghost" onClick={handleShowPassword}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputRightElement>
            </InputGroup>
            {errors.confirmPassword && (
              <FormHelperText color="red.500">
                {errors.confirmPassword}
              </FormHelperText>
            )}
          </FormControl>
          <Button
            colorScheme="blue"
            variant="solid"
            onClick={handleSignup}
            isLoading={isLoading}
            loadingText="Creating..."
            w={"full"}
          >
            Sign Up
          </Button>
          <Button
            colorScheme="red"
            variant="solid"
            onClick={handleReset}
            w={"full"}
          >
            Reset
          </Button>
          <Text textAlign="center">
            Already have an account?{" "}
            <Link
              to="/login"
              as="span"
              color="blue.500"
              _hover={{ textDecoration: "underline" }}
            >
              Log In
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

const FormInput = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  isRequired,
}) => (
  <FormControl isInvalid={!!error} isRequired={isRequired}>
    <FormLabel>{label}</FormLabel>
    <Input
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
    />
    {error && <FormHelperText color={"red.500"}>{error}</FormHelperText>}
  </FormControl>
);

export default SignupPage;
