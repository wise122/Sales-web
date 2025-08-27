import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Badge,
} from "@chakra-ui/react";
import api from "../utils/api";

type Product = {
  id: number;
  name: string;
  stock: number;
  stock_sales: number;
  stock_akhir: number;
  editedStock?: number; // stok sementara untuk input
};

const ProductsStockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const toast = useToast();

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<Product[]>("/proxy/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // tambahkan field editedStock biar tidak hilang data asli
      const dataWithEdited = res.data.map((p) => ({
        ...p,
        editedStock: p.stock_akhir,
      }));
      setProducts(dataWithEdited);
    } catch (err) {
      console.error("❌ Gagal fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update stok
  const handleUpdateStock = async (id: number, newStock: number) => {
    setUpdatingId(id);
    try {
      await api.put(
        `/products/${id}`,
        { stock_akhir: newStock },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      toast({
        title: "Berhasil",
        description: "Stok berhasil diperbarui",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      fetchProducts();
    } catch (err) {
      console.error("❌ Gagal update stok:", err);
      toast({
        title: "Error",
        description: "Gagal update stok",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box p={6}>
      <Card shadow="md" borderRadius="lg">
        <CardHeader>
          <Heading size="md" color="teal.600">
            📦 Update Stok Produk
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Kelola stok produk dengan lebih mudah
          </Text>
        </CardHeader>

        <CardBody>
          {loading ? (
            <Box textAlign="center" py={6}>
              <Spinner size="xl" />
            </Box>
          ) : products.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              Tidak ada produk tersedia.
            </Text>
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Nama Produk</Th>
                  <Th isNumeric>Stok Akhir</Th>
                  <Th isNumeric>Update Stok</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((p) => (
                  <Tr key={p.id}>
                    <Td fontWeight="medium">{p.name}</Td>
                    <Td isNumeric>
                      <Badge
                        colorScheme={p.stock_akhir > 10 ? "green" : "red"}
                        fontSize="0.9em"
                        px={3}
                        py={1}
                        borderRadius="md"
                      >
                        {p.stock_akhir}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <NumberInput
                          value={p.editedStock}
                          min={0}
                          onChange={(_, valNumber) =>
                            setProducts((prev) =>
                              prev.map((prod) =>
                                prod.id === p.id
                                  ? { ...prod, editedStock: valNumber }
                                  : prod
                              )
                            )
                          }
                          size="sm"
                          width="90px"
                        >
                          <NumberInputField />
                        </NumberInput>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() =>
                            handleUpdateStock(p.id, p.editedStock ?? p.stock_akhir)
                          }
                          isLoading={updatingId === p.id}
                        >
                          Simpan
                        </Button>
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default ProductsStockPage;
