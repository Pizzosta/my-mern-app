import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import Navbar from "./components/Navbar";
import VideoPage from "./pages/VideoPage";
import { useColorModeValue } from "@chakra-ui/react";
import "@fontsource/poppins";
import Footer from "./components/Footer";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthCheck } from "./hooks/useAuthCheck";

function App() {
  useAuthCheck();
  return (
    <Box minH={"100vh"} bg={useColorModeValue("grey.100", "gray.900")}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/createvideo" element={<VideoPage />} />
      </Routes>
      <Footer />
    </Box>
  );
}

export default App;
