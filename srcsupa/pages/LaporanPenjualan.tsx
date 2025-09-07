import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Select,
  Input,
  HStack,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

type Order = {
  id: number;
  outlet_id: number;
  payment_method: string;
  cash: number;
  transfer: number;
  grand_total: number;
  created_at: string;
  sales_name: string;
  outlet_name: string;
};

type Summary = {
  totalNota: number;
  jumlahOrder: number;
  totalQty: number;
  totalInsentif?: number;
};

type Sales = {
  id: number;
  name: string;
  user_code: string;
};

export default function LaporanPenjualan() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [salesList, setSalesList] = useState<Sales[]>([]);
  const [filters, setFilters] = useState({
    sales: "",
    start: "",
    end: "",
    month: "",
    year: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ambil data sales buat filter
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get("/users?salesOnly=true");
        setSalesList(res.data || []);
      } catch (err) {
        console.error("Fetch sales error:", err);
      }
    };
    fetchSales();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.sales) params.append("sales", filters.sales);
      if (filters.start) params.append("start", filters.start);
      if (filters.end) params.append("end", filters.end);
      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);

      const [ordersRes, summaryRes] = await Promise.all([
        api.get(`/orders?${params.toString()}`),
        api.get(`/orders/summary?${params.toString()}`),
      ]);

      const sortedOrders = (ordersRes.data.orders || []).sort(
        (a: Order, b: Order) => a.id - b.id
      );

      setOrders(sortedOrders);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error("Fetch laporan penjualan error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Box p="6">
      <Heading size="lg" mb="6">
        Laporan Penjualan
      </Heading>

      {/* Filter */}
      <HStack spacing="4" mb="6" flexWrap="wrap">
        <Select
          placeholder="Pilih Sales"
          value={filters.sales}
          onChange={(e) => setFilters({ ...filters, sales: e.target.value })}
          w="200px"
        >
          {salesList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Input
          type="date"
          value={filters.start}
          onChange={(e) => setFilters({ ...filters, start: e.target.value })}
        />
        <Input
          type="date"
          value={filters.end}
          onChange={(e) => setFilters({ ...filters, end: e.target.value })}
        />

        <Select
          placeholder="Bulan"
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          w="120px"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        <Select
          placeholder="Tahun"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          w="120px"
        >
          {["2023", "2024", "2025"].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>

        <Button colorScheme="blue" onClick={fetchOrders} isLoading={loading}>
          Filter
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setFilters({ sales: "", start: "", end: "", month: "", year: "" });
            fetchOrders();
          }}
        >
          Reset
        </Button>
      </HStack>

      {/* Ringkasan */}
      {summary && (
        <SimpleGrid columns={[1, 3]} spacing="6" mb="8">
          <Stat>
            <StatLabel>Total Nota</StatLabel>
            <StatNumber>Rp {summary.totalNota.toLocaleString()}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Jumlah Order</StatLabel>
            <StatNumber>{summary.jumlahOrder}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Qty</StatLabel>
            <StatNumber>{summary.totalQty}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}

      {/* Loading */}
      {loading ? (
        <Box textAlign="center" py="10">
          <Spinner size="xl" />
          <Text mt="2">Memuat data...</Text>
        </Box>
      ) : (
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Tanggal</Th>
              <Th>Outlet</Th>
              <Th>Sales</Th>
              <Th>Metode Bayar</Th>
              <Th isNumeric>Cash</Th>
              <Th isNumeric>Transfer</Th>
              <Th isNumeric>Grand Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <Tr
                  key={order.id}
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() => navigate(`/laporan-penjualan/${order.id}`)}
                >
                  <Td>{order.id}</Td>
                  <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                  <Td>{order.outlet_name}</Td>
                  <Td>{order.sales_name}</Td>
                  <Td>{order.payment_method}</Td>
                  <Td isNumeric>Rp {order.cash.toLocaleString()}</Td>
                  <Td isNumeric>Rp {order.transfer.toLocaleString()}</Td>
                  <Td isNumeric fontWeight="bold">
                    Rp {order.grand_total.toLocaleString()}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={8}>
                  <Text textAlign="center" color="gray.500">
                    Belum ada data penjualan
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
