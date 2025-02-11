import {
  Box,
  Button,
  Container,
  Heading,
  useColorModeValue,
  VStack,
  Input,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/react";
import React from "react";

function VideoPage() {
  const [newProduct, setNewProduct] = React.useState({
    name: "",
    friendsName: "",
    region: "",
    constituency: "",
    phone: "",
  });
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!newProduct.name.trim()) {
      newErrors.name = "Name is required.";
    }

    // Phone validation
    if (!newProduct.phone.trim()) {
      newErrors.phone = "Phone is required.";
    } else if (!/^\d*$/.test(newProduct.phone)) {
      newErrors.phone = "Phone must be a 10-digit number.";
    } else if (newProduct.phone.length !== 10) {
      newErrors.phone = "Phone must be a 10-digit number.";
    }

    // Friends Name validation
    if (!newProduct.friendsName.trim()) {
      newErrors.friendsName = "Friends Name is required.";
    } else if (!/^[A-Za-z\s]+$/.test(newProduct.friendsName)) {
      newErrors.friendsName = "Friends Name must contain only letters.";
    }

    // Region validation
    if (!newProduct.region.trim()) {
      newErrors.region = "Region is required.";
    } else if (!/^[A-Za-z\s]+$/.test(newProduct.region)) {
      newErrors.region = "Region must contain only letters.";
    }

    // Constituency validation
    if (
      newProduct.constituency &&
      !/^[A-Za-z\s]+$/.test(newProduct.constituency)
    ) {
      newErrors.constituency = "Constituency must contain only letters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleAddProduct = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(newProduct);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setNewProduct({
      name: "",
      friendsName: "",
      region: "",
      constituency: "",
      phone: "",
    });
    setErrors({});
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setNewProduct({ ...newProduct, phone: value });

    // Real-time validation for phone
    if (!/^\d*$/.test(value)) {
      setErrors({ ...errors, phone: "Phone must be a 10-digit number." });
    } else if (value.length !== 10) {
      setErrors({ ...errors, phone: "Phone must be a 10-digit number." });
    } else {
      setErrors({ ...errors, phone: "" });
    }
  };

  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"xl"} textAlign={"center"} mb={4}>
          Create New Video
        </Heading>
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
              label="Name"
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              error={errors.name}
              isRequired
            />
            <FormInput
              label="Friends Name"
              placeholder="Friends Name"
              value={newProduct.friendsName}
              onChange={(e) =>
                setNewProduct({ ...newProduct, friendsName: e.target.value })
              }
              error={errors.friendsName}
              isRequired
            />
            <FormInput
              label="Region"
              placeholder="Region"
              value={newProduct.region}
              onChange={(e) =>
                setNewProduct({ ...newProduct, region: e.target.value })
              }
              error={errors.region}
              isRequired
            />
            <FormInput
              label="Constituency"
              placeholder="Constituency"
              value={newProduct.constituency}
              onChange={(e) =>
                setNewProduct({ ...newProduct, constituency: e.target.value })
              }
              error={errors.constituency}
              isRequired
            />
            <FormInput
              label="Phone"
              placeholder="Phone"
              value={newProduct.phone}
              onChange={handlePhoneChange}
              error={errors.phone}
              type="tel"
              isRequired
            />
            <Button
              colorScheme="blue"
              onClick={handleAddProduct}
              isLoading={isLoading}
              loadingText="Creating..."
              w={"full"}
              isDisabled={
                !newProduct.name ||
                !newProduct.friendsName ||
                !newProduct.region ||
                !newProduct.constituency ||
                !newProduct.phone ||
                !!errors.phone
              }
            >
              Create Video
            </Button>
            <Button
              colorScheme="red"
              variant="solid"
              onClick={handleReset}
              w={"full"}
            >
              Reset
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

const FormInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
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
    {error && <FormErrorMessage fontSize={12}>{error}</FormErrorMessage>}
  </FormControl>
);

export default VideoPage;
