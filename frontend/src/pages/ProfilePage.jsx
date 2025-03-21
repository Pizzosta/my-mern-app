import { Box, Heading, FormControl, FormLabel, Input, Button, Alert, Image, AlertIcon } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useUserStore } from "../store/user";

const ProfilePage = () => {
  const { user, updateUser } = useUserStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    email: "",
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState(null); // For display
  const [profilePictureFile, setProfilePictureFile] = useState(null); // For upload
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        username: user.username || "",
        email: user.email || "",
      });
      if (user.profilePicture) {
        setProfilePicturePreview(user.profilePicture); // Assume this is a URL from the server
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file); // Store raw file for upload
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicturePreview(event.target.result); // Store preview URL
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updates = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
      };

      // Pass the raw file to updateUser, not the preview URL
      const result = await updateUser(user._id, updates, profilePictureFile);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>You need to be logged in to view your profile.</div>;
  }

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <Heading as="h1" size="lg" mb={4}>
        Profile
      </Heading>

      {success && <Alert rounded="lg" status="success"> <AlertIcon /> Profile updated successfully!</Alert>}
      {error && <Alert rounded="lg" status="error"> <AlertIcon /> {error}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Profile Picture</FormLabel>
          <Input type="file" accept="image/*" onChange={handleFileChange} isDisabled={loading} />
          {profilePicturePreview && (
            <Image src={profilePicturePreview} alt="Preview" mt={2} maxW="200px" objectFit="cover" />
          )}
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            isDisabled={loading}
          />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="lastName">Last Name</FormLabel>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            isDisabled={loading}
          />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="phone">Phone</FormLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            isDisabled={loading}
          />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="username">Username</FormLabel>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            isDisabled={loading}
          />
        </FormControl>

        <FormControl mb={6} isRequired>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            isDisabled={loading}
          />
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={loading} isDisabled={loading}>
          Update Profile
        </Button>
      </form>
    </Box>
  );
};

export default ProfilePage;