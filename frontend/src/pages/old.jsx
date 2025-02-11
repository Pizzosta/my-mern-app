import {
  Box,
  Button,
  Container,
  Heading,
  useColorModeValue,
  VStack,
  Input,
} from "@chakra-ui/react";
import React from "react";

const CreatePage = () => {
  const [newProduct, setNewProduct] = React.useState({
    name: "",
    price: "",
    description: "",
    image: "",
    startTime: "",
    endTime: "",
  });
  const handleAddProduct = () => {
    console.log(newProduct);
  };
  const handleReset = () => {
    setNewProduct({
      name: "",
      price: "",
      description: "",
      image: "",
      startTime: "",
      endTime: "",
    });
  };
  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"xl"} textAlign={"center"} mb={8}>
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
          <Input
            placeholder="Product Name"
            name="name"
            type="text"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <Input
            placeholder="Price"
            name="price"
            type="number"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />
          <Input
            placeholder="Description"
            name="description"
            type="text"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />
          <Input
            placeholder="Image URL"
            name="image"
            type="text"
            value={newProduct.image}
            onChange={(e) =>
              setNewProduct({ ...newProduct, image: e.target.value })
            }
          />
          <Input
            placeholder="Start Time"
            name="startTime"
            type="datetime-local"
            value={newProduct.startTime}
            onChange={(e) =>
              setNewProduct({ ...newProduct, startTime: e.target.value })
            }
          />
          <Input
            placeholder="End Time"
            name="endTime"
            type="datetime-local"
            value={newProduct.endTime}
            onChange={(e) =>
              setNewProduct({ ...newProduct, endTime: e.target.value })
            }
          />
          <Button
            colorScheme="blue"
            variant="solid"
            onClick={handleAddProduct}
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

export default CreatePage;
