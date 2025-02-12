import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import { useState } from "react";
import React from "react";

const ProductCard = ({ product }) => {
  const [updatedProduct, setUpdatedProduct] = useState(product);

  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");

  const { deleteProduct, updateProduct } = useProductStore();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!updatedProduct.name.trim()) {
      newErrors.name = "Name is required.";
    }

    // Description validation
    if (!updatedProduct.description.trim()) {
      newErrors.description = "Description is required.";
    }

    // Image validation
    if (!updatedProduct.image.trim()) {
      newErrors.image = "Image is required.";
    }

    // Start Time validation
    if (!updatedProduct.startTime.trim()) {
      newErrors.startTime = "Start Time is required.";
    }

    // End Time validation
    if (!updatedProduct.endTime.trim()) {
      newErrors.endTime = "End Time is required.";
    } else if (updatedProduct.endTime <= updatedProduct.startTime) {
      newErrors.endTime = "End Time must be after Start Time.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle price input change
  const handlePriceChange = (e) => {
    let value = e.target.value;

    // Allow only numbers and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setUpdatedProduct({ ...updatedProduct, price: value });
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
    setUpdatedProduct((prev) => ({ ...prev, startTime: currentTime }));
  }, []);

  // Handle start time change
  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;
    setUpdatedProduct((prev) => ({
      ...prev,
      startTime,
      endTime: startTime >= prev.endTime ? "" : prev.endTime, // Reset end time if it's before the new start time
    }));
    setErrors({ ...errors, startTime: "" }); // Clear start time error
  };

  // Handle end time change
  const handleEndTimeChange = (e) => {
    const endTime = e.target.value;
    setUpdatedProduct((prev) => ({ ...prev, endTime }));
    setErrors({ ...errors, endTime: "" }); // Clear end time error
  };

  // Handle name change
  const handleNameChange = (e) => {
    setUpdatedProduct({ ...updatedProduct, name: e.target.value });
    setErrors({ ...errors, name: "" }); // Clear name error
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    setUpdatedProduct({ ...updatedProduct, description: e.target.value });
    setErrors({ ...errors, description: "" }); // Clear description error
  };

  // Handle image change
  const handleImageChange = (e) => {
    setUpdatedProduct({ ...updatedProduct, image: e.target.value });
    setErrors({ ...errors, image: "" }); // Clear image error
  };

  const handleDeleteProduct = async (id) => {
    const { success, message } = await deleteProduct(id);
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateProduct = async (id, updatedProduct) => {
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
        ...updatedProduct,
        price: parseFloat(updatedProduct.price).toFixed(2),
      };

      // Ensure price is a number
      formattedProduct.price = parseFloat(formattedProduct.price);

      // Call the updateProduct function from the store
      const { success, message } = await updateProduct(id, formattedProduct);
      onClose();

      if (success) {
        toast({
          title: "Success",
          description: message || "Product created successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
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

  return (
    <Box
      shadow="lg"
      rounded="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
      bg={bg}
    >
      <Image
        src={product.image}
        alt={product.name}
        h={48}
        w="full"
        objectFit="cover"
      />

      <Box p={4}>
        <Heading as="h3" size="md" mb={2}>
          {product.name}
        </Heading>

        <Text fontWeight="bold" fontSize="xl" color={textColor} mb={4}>
          ${product.price}
        </Text>
        <Text fontSize="sm" fontWeight="bold" color={textColor} mb={2}>
          Start Time: {new Date(product.startTime).toLocaleString()}
        </Text>

        <Text fontSize="sm" fontWeight="bold" color={textColor} mb={2}>
          End Time: {new Date(product.endTime).toLocaleString()}
        </Text>

        <HStack spacing={2}>
          <IconButton icon={<EditIcon />} onClick={onOpen} colorScheme="blue" />
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => handleDeleteProduct(product._id)}
            colorScheme="red"
          />
        </HStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Update Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormInput
                label="Name"
                placeholder="Product Name"
                name="name"
                value={updatedProduct.name}
                onChange={handleNameChange}
                error={errors.name}
                isRequired
              />
              <FormInput
                label="Price"
                placeholder="Price"
                name="price"
                type="text"
                value={updatedProduct.price}
                onChange={handlePriceChange}
                error={errors.price}
                isRequired
              />
              <Textarea
                label={"Description"}
                placeholder="Description"
                name="description"
                value={updatedProduct.description}
                onChange={handleDescriptionChange}
                error={errors.description}
                isRequired
              />
              <FormInput
                label={"Image"}
                placeholder="Image URL"
                name="image"
                value={updatedProduct.image}
                onChange={handleImageChange}
                error={errors.image}
                isRequired
              />
              <FormInput
                label={"Start Time"}
                placeholder="Start Time"
                name="startTime"
                type="datetime-local"
                value={updatedProduct.startTime}
                min={getCurrentDateTime()} // Only allow future times
                onChange={handleStartTimeChange}
                error={errors.startTime}
                isRequired
              />
              <FormInput
                label={"End Time"}
                placeholder="End Time"
                name="endTime"
                type="datetime-local"
                value={updatedProduct.endTime}
                min={updatedProduct.startTime} // Only allow times after the start time
                onChange={handleEndTimeChange}
                error={errors.endTime}
                isRequired
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateProduct(product._id, updatedProduct)}
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Update
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
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

export default ProductCard;
