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
import { Link } from "react-router-dom";
import { useUserStore } from "../store/user"; // Import the store

const SignupPage = () => {
  const [newUser, setNewUser] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const toast = useToast(); // Initialize the toast

  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { createUser } = useUserStore(); // Destructure createUser from the store

  // Simplified phone validation
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) return "Phone must be 10 digits";
    if (!/^\d+$/.test(cleaned)) return "Only numbers allowed";
    return "";
  };

  // Simplified Email validation
  const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email format";
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
    setNewUser({ ...newUser, password: e.target.value });
    setErrors({ ...errors, password: "" }); // Clear password error
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

  const handleAddProduct = async () => {
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
        phone: parseInt(newUser.phone, 10), // Convert to number
      };

      const { success, message } = await createUser(formattedUser);

      if (success) {
        toast({
          title: "Success!",
          description: message,
          status: "success",
          duration: 3000,
        });
        handleReset();
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

  /*// Validation function
  const validateForm = () => {
    const newErrors = {};

    // Firstname validation
    if (!newUser.firstName.trim()) {
      newErrors.firstName = "Firstname is required.";
    }

    // LastName validation
    if (!newUser.lastName.trim()) {
      newErrors.lastName = "LastName is required.";
    }

    // Password validation
    if (!newUser.password) {
      newErrors.password = "Password is required.";
    }

    // ConfirmPassword validation
    if (newUser.password !== newUser.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // Username validation
    if (!newUser.username.trim()) {
      newErrors.username = "Username is required.";
    }

    // Email validation
    if (!newUser.email.trim()) {
      newErrors.email = "Email is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle Email change
  const handleEmailChange = (e) => {
    let value = e.target.value;

    // Real-time validation & checks email format
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      setNewUser({ ...newUser, email: e.target.value });
      setErrors({ ...errors, email: "" }); // Clear Email error
    } else {
      setErrors({ ...errors, email: "Please fill a valid email address." });
      return; // Stop execution if invalid
    }

    //Validation for email
    if (value.trim() === "") {
      setErrors({ ...errors, email: "Email is required." });
    }
  };

  // Handle Phone input change
  const handlePhoneChange = (e) => {
    let value = e.target.value;

    // Real-time validation & checks for only numbers
    if (/^\d{10}$/.test(value)) {
      setNewUser({ ...newUser, phone: value });
      setErrors({ ...errors, phone: "" }); // Clear errors when valid input
    } else if (!/^\d*$/.test(value)) {
      setErrors({
        ...errors,
        phone: "Phone must be a valid number with not more than 10 digits.",
      });
      return;
    } // Stop execution if non-numeric input
    else {
      setErrors({
        ...errors,
        phone: "Phone cannot be more than 10 digits.",
      });
      return; // Stop execution if invalid
    }

    //Validation for phone
    if (value.trim() === "") {
      setErrors({ ...errors, phone: "Phone is required." });
    } else if (value.length !== 10) {
      setErrors({ ...errors, phone: "Phone must be 10 digits." });
    }
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

  // Handle password change
  const handlePasswordChange = (e) => {
    setNewUser({ ...newUser, password: e.target.value });
    setErrors({ ...errors, password: "" }); // Clear password error
  };

  // Handle password change
  const handleConfirmPasswordChange = (e) => {
    setNewUser({ ...newUser, password: e.target.value });
    setErrors({ ...errors, password: "" }); // Clear password error
  };

  // Handle Show password
  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleAddProduct = async () => {
    if (!validateForm()) {
      setIsLoading(false); // Reset loading state
      toast({
        title: "Invalid Form",
        description: "Please provide all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return; // Stop if validation fails
    }

    setIsLoading(true);
    try {
      // Convert phone to a string and remove non-digits
      const formattedUser = {
        ...newUser,
        phone: toString(newUser.phone).replace(/\D/g, ""),
      };

      // Ensure phone is a number
      formattedUser.phone = toString(formattedUser.phone);

      // Call the createUser function from the store
      const { success, message } = await createUser(formattedUser);

      // Log the success and message
      console.log("Success:", success, "Message:", message);
      //console.log(formattedUser);

      if (success) {
        toast({
          title: "Success",
          description: message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        handleReset(); // If the user was created successfully, reset the form
      } else {
        toast({
          title: "Error",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };*/

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
            placeholder="Firstname"
            type="text"
            value={newUser.firstName}
            onChange={handleFirstnameChange}
            error={errors.firstName}
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
          <FormInput
            label={"LastName"}
            placeholder="LastName"
            type="text"
            value={newUser.lastName}
            onChange={handleLastnameChange}
            error={errors.lastName}
            isRequired
          />

          {/* Password Field */}
          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={handlePasswordChange}
              />
              <InputRightElement width="4.5rem">
                <Button
                  //variant="ghost"
                  //position="absolute"
                  //right="2"
                  //top="2"
                  h="1.75rem"
                  size="sm"
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
                placeholder="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={newUser.confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleShowPassword}>
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

          {/*<FormInput
            label={"ConfrimPassword"}
            placeholder="Confrim Password"
            type={showPassword ? "text" : "password"}
            value={newUser.confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={errors.confirmPassword}
            isRequired
          />*/}
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
          <Button
            colorScheme="blue"
            variant="solid"
            onClick={handleAddProduct}
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
