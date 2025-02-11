import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import Navbar from "./components/Navbar";
import VideoPage from "./pages/VideoPage";
import { useColorModeValue } from "@chakra-ui/react";
import "@fontsource/poppins";
import "@fontsource/roboto";

function App() {
  return (
    <Box minH={"100vh"} bg={useColorModeValue("grey.100", "gray.900")}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/createvideo" element={<VideoPage />} />
      </Routes>
    </Box>
  );
}

export default App;
