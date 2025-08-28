import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

type OrderItem = {
  id: number;
  product_name: string;
  qty: number;
  price: number;
  subtotal: number;
};

type OrderDetail = {
  id: number;
  outlet_name: string;
  payment_method: string;
  cash: number;
  transfer: number;
  grand_total: number;
  created_at: string;
  items: OrderItem[];
};

export default function LaporanPenjualanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await api.get(`/orders/${id}`); // ✅ API: GET /orders/:id
        setOrder(res.data || null);
      } catch (err) {
        console.error("Gagal ambil detail order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  if (loading) {
    return (
      <Box p="6">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p="6">
        <Text>Data order tidak ditemukan.</Text>
        <Button mt="4" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </Box>
    );
  }

  return (
    <Box p="6">
      <Heading size="lg" mb="6">
        Detail Penjualan #{order.id}
      </Heading>

      {/* Info Ringkas */}
      <SimpleGrid columns={[1, 2, 3]} spacing="6" mb="8">
        <Stat>
          <StatLabel>Tanggal</StatLabel>
          <StatNumber fontSize="md">
            {new Date(order.created_at).toLocaleString()}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Outlet</StatLabel>
          <StatNumber fontSize="md">{order.outlet_name}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Metode Bayar</StatLabel>
          <StatNumber fontSize="md">{order.payment_method}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Cash</StatLabel>
          <StatNumber>Rp {order.cash.toLocaleString()}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Transfer</StatLabel>
          <StatNumber>Rp {order.transfer.toLocaleString()}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Grand Total</StatLabel>
          <StatNumber color="green.600" fontWeight="bold">
            Rp {order.grand_total.toLocaleString()}
          </StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Tabel Items */}
      <Heading size="md" mb="4">
        Daftar Produk
      </Heading>
      <Table variant="striped" size="sm">
        <Thead>
          <Tr>
            <Th>Produk</Th>
            <Th isNumeric>Qty</Th>
            <Th isNumeric>Harga</Th>
            <Th isNumeric>Subtotal</Th>
          </Tr>
        </Thead>
        <Tbody>
          {order.items.length > 0 ? (
            order.items.map((item) => (
              <Tr key={item.id}>
                <Td>{item.product_name}</Td>
                <Td isNumeric>{item.qty}</Td>
                <Td isNumeric>Rp {item.price.toLocaleString()}</Td>
                <Td isNumeric fontWeight="bold">
                  Rp {item.subtotal.toLocaleString()}
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={4}>
                <Text textAlign="center" color="gray.500">
                  Tidak ada item di order ini
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      <Button mt="6" onClick={() => navigate(-1)}>
        ← Kembali
      </Button>
    </Box>
  );
}
