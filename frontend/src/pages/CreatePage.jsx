import {
  Box,
  Button,
  Container,
  Heading,
  useColorModeValue,
  VStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { useProductStore } from "../store/product"; // Import the store

const CreatePage = () => {
  const [newProduct, setNewProduct] = React.useState({
    name: "",
    price: "",
    description: "",
    image: "",
    startTime: "",
    endTime: "",
  });

  const toast = useToast(); // Initialize the toast

  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const { createProduct } = useProductStore(); // Destructure createProduct from the store

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!newProduct.name.trim()) {
      newErrors.name = "Name is required.";
    }

    // Description validation
    if (!newProduct.description.trim()) {
      newErrors.description = "Description is required.";
    }

    // Image validation
    if (!newProduct.image.trim()) {
      newErrors.image = "Image is required.";
    }

    // Start Time validation
    if (!newProduct.startTime.trim()) {
      newErrors.startTime = "Start Time is required.";
    }

    // End Time validation
    if (!newProduct.endTime.trim()) {
      newErrors.endTime = "End Time is required.";
    } else if (newProduct.endTime <= newProduct.startTime) {
      newErrors.endTime = "End Time must be after Start Time.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle price input change
  const handlePriceChange = (e) => {
    let value = e.target.value;

    // Allow only numbers and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setNewProduct({ ...newProduct, price: value });
      setErrors({ ...errors, price: "" }); // Clear errors when valid input
    } else if (!/^\d*\.?\d*$/.test(value)) {
      setErrors({
        ...errors,
        price:
          "Price must be a valid number with not more than 2 decimal places.",
      });
      return;
    } // Stop execution if non-numeric input
    else {
      setErrors({
        ...errors,
        price: "Price cannot be more than 2 decimal places.",
      });
      return; // Stop execution if invalid
    }

    // Real-time validation for price
    if (value.trim() === "") {
      setErrors({ ...errors, price: "Price is required." });
    } else if (parseFloat(value) < 1) {
      setErrors({ ...errors, price: "Price must be more than 1 Cedis." });
    }
  };

  // Function to format the current time for the datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localISOTime = new Date(now - offset).toISOString().slice(0, 16); // Remove seconds and milliseconds
    return localISOTime;
  };

  // Set the initial start time to the current time
  React.useEffect(() => {
    const currentTime = getCurrentDateTime();
    setNewProduct((prev) => ({ ...prev, startTime: currentTime }));
  }, []);

  // Handle start time change
  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;
    setNewProduct((prev) => ({
      ...prev,
      startTime,
      endTime: startTime >= prev.endTime ? "" : prev.endTime, // Reset end time if it's before the new start time
    }));
    setErrors({ ...errors, startTime: "" }); // Clear start time error
  };

  // Handle end time change
  const handleEndTimeChange = (e) => {
    const endTime = e.target.value;
    setNewProduct((prev) => ({ ...prev, endTime }));
    setErrors({ ...errors, endTime: "" }); // Clear end time error
  };

  // Handle name change
  const handleNameChange = (e) => {
    setNewProduct({ ...newProduct, name: e.target.value });
    setErrors({ ...errors, name: "" }); // Clear name error
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    setNewProduct({ ...newProduct, description: e.target.value });
    setErrors({ ...errors, description: "" }); // Clear description error
  };

  // Handle image change
  const handleImageChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.value });
    setErrors({ ...errors, image: "" }); // Clear image error
  };

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
      // Convert price to a float number with 2 decimal places
      const formattedProduct = {
        ...newProduct,
        price: parseFloat(newProduct.price).toFixed(2),
      };

      // Ensure price is a number
      formattedProduct.price = parseFloat(formattedProduct.price);

      // Call the createProduct function from the store
      const { success, message } = await createProduct(formattedProduct);

      // Log the success and message
      console.log("Success:", success, "Message:", message);
      //console.log(formattedProduct);

      if (success) {
        toast({
          title: "Success",
          description: message || "Product created successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        handleReset(); // If the product was created successfully, reset the form
      } else {
        toast({
          title: "Error",
          description: message || "Failed to create product.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const currentTime = getCurrentDateTime();
    setNewProduct({
      name: "",
      price: "",
      description: "",
      image: "",
      startTime: currentTime,
      endTime: "",
    });
    setErrors({}); // Clear errors
  };

  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"xl"} textAlign={"center"} mb={4}>
          Create New Product
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
            label="Name"
            placeholder="Product Name"
            type="text"
            value={newProduct.name}
            onChange={handleNameChange}
            error={errors.name}
            isRequired
          />
          <FormInput
            label="Price"
            placeholder="1 Cedis and above"
            type="text"
            value={newProduct.price}
            onChange={handlePriceChange}
            error={errors.price}
            isRequired
          />
          <FormInput
            label={"Description"}
            placeholder="Description"
            type="textarea"
            value={newProduct.description}
            onChange={handleDescriptionChange}
            error={errors.description}
            isRequired
          />
          <FormInput
            label={"Image"}
            placeholder="Image URL"
            type="text"
            value={newProduct.image}
            onChange={handleImageChange}
            error={errors.image}
            isRequired
          />
          <FormInput
            label={"Start Time"}
            type="datetime-local"
            value={newProduct.startTime}
            min={getCurrentDateTime()} // Only allow future times
            onChange={handleStartTimeChange}
            error={errors.startTime}
            isRequired
          />
          <FormInput
            label={"End Time"}
            type="datetime-local"
            value={newProduct.endTime}
            min={newProduct.startTime} // Only allow times after the start time
            onChange={handleEndTimeChange}
            error={errors.endTime}
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
            Create Product
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
    </Container>
  );
};

const FormInput = ({
  label,
  placeholder,
  type,
  value,
  onChange,
  error,
  isRequired,
  min,
}) => (
  <FormControl isInvalid={!!error} isRequired={isRequired}>
    <FormLabel>{label}</FormLabel>
    {type === "textarea" ? (
      <Textarea placeholder={placeholder} value={value} onChange={onChange} />
    ) : (
      <Input
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        min={min} // Pass the min attribute
      />
    )}
    {error && <FormHelperText color={"red.500"}>{error}</FormHelperText>}
  </FormControl>
);

export default CreatePage;
