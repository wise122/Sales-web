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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
};

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
  order_items?: OrderItem[];
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

  const downloadReport = () => {
    if (orders.length === 0) {
      alert("Tidak ada data untuk diunduh");
      return;
    }

    // Flatten data untuk Excel: setiap order_item jadi baris
    const exportData: any[] = [];
    orders.forEach((order) => {
      if (order.order_items?.length) {
        order.order_items.forEach((item) => {
          exportData.push({
            ID: order.id,
            Tanggal: new Date(order.created_at).toLocaleDateString(),
            Outlet: order.outlet_name,
            Sales: order.sales_name,
            "Metode Bayar": order.payment_method,
            "Nama Barang": item.product_name,
            Qty: item.quantity,
            Harga: item.price,
            Subtotal: item.quantity * item.price,
            "Grand Total": order.grand_total,
          });
        });
      } else {
        exportData.push({
          ID: order.id,
          Tanggal: new Date(order.created_at).toLocaleDateString(),
          Outlet: order.outlet_name,
          Sales: order.sales_name,
          "Metode Bayar": order.payment_method,
          "Nama Barang": "-",
          Qty: 0,
          Harga: 0,
          Subtotal: 0,
          "Grand Total": order.grand_total,
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `laporan-penjualan-${Date.now()}.xlsx`);
  };

  // Ambil data sales untuk filter
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
      if (filters.sales) params.append("sales_id", filters.sales);
      if (filters.start) params.append("start_date", filters.start);
      if (filters.end) params.append("end_date", filters.end);
      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);

      const [ordersRes, outletsRes, usersRes] = await Promise.all([
        api.get(`/orders?${params.toString()}`),
        api.get("/outlets"),
        api.get("/users?salesOnly=true"),
      ]);

      const fetchedOrders: any[] = Array.isArray(ordersRes.data?.orders)
        ? ordersRes.data.orders
        : [];
        console.log("Order sample:", fetchedOrders[0]);
      const outlets: any[] = Array.isArray(outletsRes.data) ? outletsRes.data : [];
      const users: any[] = Array.isArray(usersRes.data) ? usersRes.data : [];

      const mappedOrders = fetchedOrders.map((o) => ({
        ...o,
        order_items: o.order_items || [],
      }));

      const sortedOrders = mappedOrders.sort((a, b) => a.id - b.id);
      setOrders(sortedOrders);

      // Hitung summary frontend
      const totalNota = sortedOrders.reduce((sum, o) => sum + (o.grand_total || 0), 0);
      const jumlahOrder = sortedOrders.length;
      const totalQty = sortedOrders.reduce(
        (sum: number, o: Order) =>
          sum + (o.order_items?.reduce((s: number, i: OrderItem) => s + i.quantity, 0) || 0),
        0
      );
      
      setSummary({ totalNota, jumlahOrder, totalQty });
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
      <Heading size="lg" mb="6">Laporan Penjualan</Heading>

      {/* Filter */}
      <HStack spacing="4" mb="6" flexWrap="wrap">
        <Select
          placeholder="Pilih Sales"
          value={filters.sales}
          onChange={(e) => setFilters({ ...filters, sales: e.target.value })}
          w="200px"
        >
          {salesList.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>

        <Input type="date" value={filters.start} onChange={(e) => setFilters({ ...filters, start: e.target.value })} />
        <Input type="date" value={filters.end} onChange={(e) => setFilters({ ...filters, end: e.target.value })} />


        <Button colorScheme="blue" onClick={fetchOrders} isLoading={loading}>Filter</Button>
        <Button
          variant="outline"
          onClick={() => {
            setFilters({ sales: "", start: "", end: "", month: "", year: "" });
            fetchOrders();
          }}
        >
          Reset
        </Button>
        <Button colorScheme="green" onClick={downloadReport} isDisabled={orders.length === 0}>Download Laporan</Button>
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
      <Th>Nama Barang</Th>
      <Th isNumeric>Qty</Th>
      <Th isNumeric>Harga</Th>
      <Th isNumeric>Subtotal</Th>
      <Th isNumeric>Grand Total</Th>
      <Th>Aksi</Th> {/* ➕ Tambahan */}
    </Tr>
  </Thead>

  <Tbody>
    {orders.length > 0 ? (
      orders.flatMap((order) => {
        if (order.order_items && order.order_items.length > 0) {
          return order.order_items.map((item, index) => (
            <Tr key={`${order.id}-${item.id}`}>
              <Td>{index === 0 ? order.id : ""}</Td>
              <Td>{index === 0 ? new Date(order.created_at).toLocaleDateString() : ""}</Td>
              <Td>{index === 0 ? order.outlet_name : ""}</Td>
              <Td>{index === 0 ? order.sales_name : ""}</Td>
              <Td>{index === 0 ? order.payment_method : ""}</Td>

              <Td>{item.product_name}</Td>
              <Td isNumeric>{item.quantity}</Td>
              <Td isNumeric>Rp {item.price.toLocaleString()}</Td>
              <Td isNumeric>Rp {(item.quantity * item.price).toLocaleString()}</Td>

              <Td isNumeric>
                {index === 0 ? `Rp ${order.grand_total.toLocaleString()}` : ""}
              </Td>

              {/* Tombol Edit hanya muncul di baris pertama order */}
              <Td>
                {index === 0 && (
                  <Button
                    size="xs"
                    colorScheme="blue"
                    onClick={() => navigate(`/laporan-penjualan/${order.id}`)}

                  >
                    Edit
                  </Button>
                )}
              </Td>
            </Tr>
          ));
        } else {
          return (
            <Tr key={order.id}>
              <Td>{order.id}</Td>
              <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
              <Td>{order.outlet_name}</Td>
              <Td>{order.sales_name}</Td>
              <Td>{order.payment_method}</Td>

              <Td>-</Td>
              <Td isNumeric>0</Td>
              <Td isNumeric>0</Td>
              <Td isNumeric>0</Td>
              <Td isNumeric>Rp {order.grand_total.toLocaleString()}</Td>

              <Td>
                <Button
                  size="xs"
                  colorScheme="blue"
                  onClick={() => navigate(`/orders/edit/${order.id}`)}
                >
                  Edit
                </Button>
              </Td>
            </Tr>
          );
        }
      })
    ) : (
      <Tr>
        <Td colSpan={11}>
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
