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
  user_id: number;
  payment_method: string;
  cash: number;
  transfer: number;
  grand_total: number;
  created_at: string;
  outlet_name?: string;
  sales_name?: string;
};

type Summary = {
  totalNota: number;
  jumlahOrder: number;
  totalQty: number;
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
        console.log("Fetching sales list...");
        const res = await api.get("/users?salesOnly=true");
        console.log("Sales fetched:", res.data);
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
      console.log("Fetching orders with filters:", filters);
  
      // build query params
      const params = new URLSearchParams();
if (filters.sales) params.append("sales_id", filters.sales);   // 👈 ganti
if (filters.start) params.append("start_date", filters.start); // 👈 ganti
if (filters.end) params.append("end_date", filters.end);       // 👈 ganti
if (filters.month) params.append("month", filters.month);
if (filters.year) params.append("year", filters.year);

  
      console.log("Query params:", params.toString());
  
      // ambil data orders, outlets, users bersamaan
      const [ordersRes, outletsRes, usersRes] = await Promise.all([
        api.get(`/orders?${params.toString()}`),
        api.get("/outlets"),
        api.get("/users?salesOnly=true"),
      ]);
  
      // pastikan data berbentuk array
      const fetchedOrders: any[] = Array.isArray(ordersRes.data?.orders)
        ? ordersRes.data.orders
        : [];
      const outlets: any[] = Array.isArray(outletsRes.data) ? outletsRes.data : [];
      const users: any[] = Array.isArray(usersRes.data) ? usersRes.data : [];
  
      console.log("Fetched orders:", fetchedOrders);
      console.log("Fetched outlets:", outlets);
      console.log("Fetched users:", users);
  
      // mapping outlet_name & sales_name
      const mappedOrders = fetchedOrders.map((o) => {
        const outlet = outlets.find((out) => out.id === o.outlet_id);
        const user = users.find((u) => u.id === o.user_id);
        return {
          ...o,
          outlet_name: outlet?.store_name || "-",
          sales_name: user?.name || "-",
        };
      });
  
      // urutkan berdasarkan ID
      const sortedOrders = mappedOrders.sort((a, b) => a.id - b.id);
      setOrders(sortedOrders);
  
      // hitung summary di frontend
      const totalNota = sortedOrders.reduce((sum, o) => sum + (o.grand_total || 0), 0);
      const jumlahOrder = sortedOrders.length;
      const totalQty = 0; // kalau qty ingin ditampilkan, backend harus kirim order_items
      setSummary({ totalNota, jumlahOrder, totalQty });
  
      console.log("Summary:", { totalNota, jumlahOrder, totalQty });
    } catch (err) {
      console.error("Fetch laporan penjualan error:", err);
      setOrders([]);
      setSummary(null);
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
                  onClick={() => {
                    console.log("Navigating to order ID:", order.id);
                    navigate(`/laporan-penjualan/${order.id}`);
                  }}
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
