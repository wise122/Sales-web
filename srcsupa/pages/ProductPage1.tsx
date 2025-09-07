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
} from "@chakra-ui/react";
import api from "../utils/api";

type Product = {
  id: number;
  code: string;
  name: string;
  stock: number;
  stock_sales: number;
  price_retail: number;
  price_wholesaler: number;
  price_agent: number;
  stock_akhir: number;
  stock_akhir_sales: number;
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products dari API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<Product[]>("/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Gagal fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Daftar Produk
      </Heading>

      {loading ? (
        <Spinner size="xl" />
      ) : products.length === 0 ? (
        <Text>Tidak ada produk.</Text>
      ) : (
        <Table variant="striped" colorScheme="teal" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Kode</Th>
              <Th>Nama Produk</Th>
              <Th isNumeric>Stock</Th>
              <Th isNumeric>Stock Sales</Th>
              <Th isNumeric>Harga Retail</Th>
              <Th isNumeric>Harga Grosir</Th>
              <Th isNumeric>Harga Agen</Th>
              <Th isNumeric>Stock Akhir</Th>
              <Th isNumeric>Stock Akhir Sales</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((p) => (
              <Tr key={p.id}>
                <Td>{p.id}</Td>
                <Td>{p.code}</Td>
                <Td>{p.name}</Td>
                <Td isNumeric>{p.stock}</Td>
                <Td isNumeric>{p.stock_sales}</Td>
                <Td isNumeric>{p.price_retail.toLocaleString("id-ID")}</Td>
                <Td isNumeric>{p.price_wholesaler.toLocaleString("id-ID")}</Td>
                <Td isNumeric>{p.price_agent.toLocaleString("id-ID")}</Td>
                <Td isNumeric>{p.stock_akhir}</Td>
                <Td isNumeric>{p.stock_akhir_sales}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default ProductsPage;
