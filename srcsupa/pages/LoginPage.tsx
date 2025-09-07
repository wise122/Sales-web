import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

interface LoginForm {
  user_id: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<LoginForm>({ user_id: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      const res = await api.post("/auth/login", form);
      const { user, accessToken, refreshToken, expiresIn } = res.data;
  
      // 🔒 Validasi hanya Admin
      if (user.segment !== "Admin") {
        setError("Hanya Admin yang bisa login");
        toast({
          title: "Login ditolak",
          description: "Akses hanya untuk Admin.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }
  
      // lanjut login kalau Admin
      login({ user, accessToken, refreshToken, expiresIn });
  
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${user.name}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login gagal:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Flex minH="100vh" align="center" justify="center" bg="blue.50">
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        w="full"
        maxW="md"
        border="1px"
        borderColor="blue.100"
      >
        <Heading textAlign="center" mb={6} color="blue.500">
          Login
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!error && !form.user_id}>
              <FormLabel>User ID</FormLabel>
              <Input
                type="text"
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                focusBorderColor="blue.400"
                placeholder="Masukkan User ID"
                required
              />
              <FormErrorMessage>{!form.user_id && error}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!error && !form.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                focusBorderColor="blue.400"
                placeholder="Masukkan Password"
                required
              />
              <FormErrorMessage>{!form.password && error}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="Memproses..."
            >
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default LoginPage;
