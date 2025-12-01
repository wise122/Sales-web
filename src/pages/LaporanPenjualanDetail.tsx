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
  Button,
  Input,
  Select,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

type Product = {
  id: number;
  name: string;
  price_retail: number;
};

type OrderItem = {
  id?: number;
  product_id: number;
  quantity: number;
  price: number;
  discount_percent: number;
  subtotal: number;
  products?: { name: string };
};

type OrderDetail = {
  id: number;
  outlet_id: number;
  user_id: number;
  payment_method: string;
  cash: number;
  transfer: number;
  grand_total: number;
  created_at: string;
  items: OrderItem[];
};

export default function LaporanPenjualanEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deletedItemIds, setDeletedItemIds] = useState<number[]>([]);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH DATA -------------------
  useEffect(() => {
    const load = async () => {
      try {
        const resOrder = await api.get(`/orders/${id}`);
        setOrder(resOrder.data.order);

        const resProducts = await api.get(`/products`);
        setProducts(resProducts.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const recalcTotals = (items: OrderItem[]) => {
    return items.reduce((acc, item) => acc + item.subtotal, 0);
  };

  // ---------------- HANDLERS -------------------
  const updateItem = (index: number, field: string, value: any) => {
    if (!order) return;

    const items = [...order.items];
    let item = { ...items[index], [field]: value };

    // hitung subtotal
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const disc = Number(item.discount_percent) || 0;

    const afterDisc = price - (price * disc) / 100;
    item.subtotal = qty * afterDisc;

    items[index] = item;

    setOrder({
      ...order,
      items,
      grand_total: recalcTotals(items),
    });
  };

  const deleteItem = (index: number) => {
    if (!order) return;
  
    const item = order.items[index];
  
    console.log("🗑️ Delete item index:", index);
    console.log("🗑️ Item yang akan dihapus:", item);
  
    // hanya push item lama (punya ID)
    if (item.id) {
      setDeletedItemIds((prev) => [...prev, item.id!]);
    }
  
    const items = order.items.filter((_, i) => i !== index);
  
    setOrder({
      ...order,
      items,
      grand_total: recalcTotals(items),
    });
  };
  
  

  const addItem = () => {
    if (!order || products.length === 0) return;

    const p = products[0];

    const newItem: OrderItem = {
      product_id: p.id,
      quantity: 1,
      price: p.price_retail,
      discount_percent: 0,
      subtotal: p.price_retail,
      products: { name: p.name },
    };

    const items = [...order.items, newItem];

    setOrder({
      ...order,
      items,
      grand_total: recalcTotals(items),
    });
  };

  const saveChanges = async () => {
    if (!order) return;
  
    const payload = {
      items: order.items.map((i) => ({
        id: i.id,
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.price,
        discount_percent: i.discount_percent,
        subtotal: i.subtotal,
      })),
      deleted_item_ids: deletedItemIds,  // <-- WAJIB ADA
      grand_total: order.grand_total,
    };
  
    console.log("🔥 DEBUG PAYLOAD DIKIRIM KE BACKEND:", payload);
  
    try {
      await api.put(`/orders/${order.id}`, payload);
      alert("Order berhasil diperbarui");
      navigate(`/laporan-penjualan`);
    } catch (err) {
      console.error(err);
      alert("Gagal update order");
    }
  };
  
  

  // ---------------- UI ------------------
  if (loading) return <Spinner />;

  if (!order)
    return (
      <Box p="6">
        <Text>Order tidak ditemukan</Text>
      </Box>
    );

  return (
    <Box p="6">
      <Heading size="lg" mb="6">
        Edit Penjualan #{order.id}
      </Heading>

      <Button leftIcon={<AddIcon />} colorScheme="green" mb="4" onClick={addItem}>
        Tambah Item
      </Button>

      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Produk</Th>
            <Th isNumeric>Qty</Th>
            <Th isNumeric>Harga</Th>
            <Th isNumeric>Diskon %</Th>
            <Th isNumeric>Subtotal</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>

        <Tbody>
          {order.items.map((item, index) => (
            <Tr key={index}>
              <Td>
                <Select
                  value={item.product_id}
                  onChange={(e) => {
                    const p = products.find((x) => x.id === Number(e.target.value));
                    if (p) {
                      updateItem(index, "product_id", p.id);
                      updateItem(index, "price", p.price_retail);
                      updateItem(index, "products", { name: p.name });
                    }
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Td>

              <Td isNumeric>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", Number(e.target.value))
                  }
                />
              </Td>

              <Td isNumeric>
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, "price", Number(e.target.value))
                  }
                />
              </Td>

              <Td isNumeric>
                <Input
                  type="number"
                  value={item.discount_percent}
                  onChange={(e) =>
                    updateItem(index, "discount_percent", Number(e.target.value))
                  }
                />
              </Td>

              <Td isNumeric fontWeight="bold">
                Rp {item.subtotal.toLocaleString()}
              </Td>

              <Td>
                <IconButton
                  colorScheme="red"
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  onClick={() => deleteItem(index)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt="6">
        Grand Total: Rp {order.grand_total.toLocaleString()}
      </Heading>

      <HStack mt="6">
        <Button colorScheme="blue" onClick={saveChanges}>
          Simpan Perubahan
        </Button>
        <Button onClick={() => navigate(-1)}>Batal</Button>
      </HStack>
    </Box>
  );
}
