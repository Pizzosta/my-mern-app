/*
import {
  Container,
  Flex,
  Text,
  HStack,
  Button,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaRegSquarePlus } from "react-icons/fa6";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { AiOutlineVideoCameraAdd } from "react-icons/ai";
import { useUserStore } from "../store/user";
import { useState } from "react";

const Navbar = () => {
  const { logout, user } = useUserStore();
  console.log("Navbar user:", user); // Debug
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { success, message } = await logout();
      toast({
        title: success ? "Success" : "Error",
        description: message,
        status: success ? "success" : "error",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Container maxW="1140px" px={4}>
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        flexDir={{ base: "column", sm: "row" }}
      >
        <Text
          fontSize={{ base: "22", sm: "28" }}
          fontWeight="bold"
          textTransform="uppercase"
          textAlign="center"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          <Link to="/">KAWODZE 🛒</Link>
        </Text>
        <HStack spacing={2} alignItems="center">
          {!user ? (
            <>
              <Button as={Link} to="/login" variant="ghost">
                Login
              </Button>
              <Button as={Link} to="/signup" variant="ghost">
                Signup
              </Button>
            </>
          ) : (
            <Button
              onClick={handleLogout}
              colorScheme="red"
              isLoading={isLoggingOut}
              loadingText="Logging out"
            >
            </Button>
          )}
          <Button as={Link} to="/create" aria-label="Create Product">
            <FaRegSquarePlus fontSize={20} />
          </Button>
          <Button as={Link} to="/createvideo" aria-label="Create Video">
            <AiOutlineVideoCameraAdd fontSize={20} />
          </Button>
          <Button
            onClick={toggleColorMode}
            aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          >
            {colorMode === "light" ? <IoMoon fontSize={20} /> : <LuSun fontSize={20} />}
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
*/

import {
  Container,
  Flex,
  Text,
  HStack,
  Button,
  useColorMode,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaRegSquarePlus } from "react-icons/fa6";
import { AiOutlineLogout, AiOutlineVideoCameraAdd } from "react-icons/ai";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { useUserStore } from "../store/user";
import { useState } from "react";
import { Link } from "react-router-dom";

// Update the Navbar component
const Navbar = () => {
  const { logout, user } = useUserStore();
  console.log("Navbar user:", user); // Debug
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { success, message } = await logout();
      toast({
        title: success ? "Success" : "Error",
        description: message,
        status: success ? "success" : "error",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Container maxW="1140px" px={4}>
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        flexDir={{ base: "column", sm: "row" }}
      >
        <Text
          fontSize={{ base: "22", sm: "28" }}
          fontWeight="bold"
          textTransform="uppercase"
          textAlign="center"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          <Link to="/">KAWODZE 🛒</Link>
        </Text>
        <HStack spacing={2} alignItems="center">
          {!user ? (
            <>
              <Button as={Link} to="/login" variant="ghost">
                Login
              </Button>
              <Button as={Link} to="/signup" variant="ghost">
                Signup
              </Button>
            </>
          ) : (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                leftIcon={
                  <Avatar
                    size="xs"
                    name={user?.username}
                    src={user?.profilePicture}
                  />
                }
                colorScheme="blue"
                variant="ghost"
              >
                {user?.username}
              </MenuButton>
              <MenuList>
                <MenuItem isDisabled fontSize="sm" fontWeight="bold">
                  Signed in as {user?.email}
                </MenuItem>
                <MenuDivider />
                <MenuItem as={Link} to="/profile">
                  Profile
                </MenuItem>
                <MenuItem as={Link} to="/settings">
                  Settings
                </MenuItem>
                <MenuDivider />
                {/*<MenuItem
                  onClick={handleLogout}
                  icon={<AiOutlineLogout />}
                  color="red.500"
                  isLoading={isLoggingOut}
                >
                  Logout
                </MenuItem>*/}
                <MenuItem
                  onClick={handleLogout}
                  icon={<AiOutlineLogout />}
                  color="red.500"
                  isDisabled={isLoggingOut} // Optional: disable during logout
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </MenuItem>
              </MenuList>
            </Menu>
          )}
          <Button as={Link} to="/create" aria-label="Create Product">
            <FaRegSquarePlus fontSize={20} />
          </Button>
          <Button as={Link} to="/createvideo" aria-label="Create Video">
            <AiOutlineVideoCameraAdd fontSize={20} />
          </Button>
          <Button
            onClick={toggleColorMode}
            aria-label={`Switch to ${
              colorMode === "light" ? "dark" : "light"
            } mode`}
          >
            {colorMode === "light" ? (
              <IoMoon fontSize={20} />
            ) : (
              <LuSun fontSize={20} />
            )}
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
