import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Spinner,
  Center,
  VStack,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import api from "../utils/api";

interface Discount {
  id: number;
  product_id: number;
  product_name: string;
  discount_type: "percent" | "fixed";
  value: number;
  start_date: string;
  end_date: string;
  active: number;
}

interface Product {
  id: number;
  name: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [product_id, setProductId] = useState<number | "">("");
  const [discount_type, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState<number>(0);
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [active, setActive] = useState(1);

  // Edit state
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [discountsRes, productsRes] = await Promise.all([
        api.get<Discount[]>("/diskon"),
        api.get<Product[]>("/products"),
      ]);
      setDiscounts(discountsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal mengambil data", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setProductId("");
    setDiscountType("percent");
    setValue(0);
    setStartDate("");
    setEndDate("");
    setActive(1);
  };

  const handleAdd = async () => {
    if (!product_id || !value || !start_date || !end_date) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }
    try {
      await api.post("/diskon", {
        product_id,
        discount_type,
        value,
        start_date,
        end_date,
        active,
      });
      toast({ title: "Diskon berhasil ditambahkan", status: "success", duration: 3000 });
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menambahkan diskon", status: "error", duration: 3000 });
    }
  };

  const handleEdit = (d: Discount) => {
    setEditingDiscount(d);
    setProductId(d.product_id);
    setDiscountType(d.discount_type);
    setValue(d.value);
    setStartDate(d.start_date.slice(0, 16)); // buat datetime-local
    setEndDate(d.end_date.slice(0, 16));
    setActive(d.active);
    onOpen();
  };

  const handleUpdate = async () => {
    if (!editingDiscount) return;
    try {
      await api.put(`/discounts/${editingDiscount.id}`, {
        product_id,
        discount_type,
        value,
        start_date,
        end_date,
        active,
      });
      toast({ title: "Diskon berhasil diperbarui", status: "success", duration: 3000 });
      onClose();
      resetForm();
      setEditingDiscount(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal update diskon", status: "error", duration: 3000 });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus diskon ini?")) return;
    try {
      await api.delete(`/discounts/${id}`);
      toast({ title: "Diskon berhasil dihapus", status: "success", duration: 3000 });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menghapus diskon", status: "error", duration: 3000 });
    }
  };

  if (loading)
    return (
      <Center h="80vh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <Box p="6">
      <VStack spacing="4" align="stretch">
        <HStack justifyContent="space-between">
          <Text fontSize="2xl" fontWeight="bold">Data Diskon</Text>
          <Button colorScheme="blue" onClick={() => { resetForm(); setEditingDiscount(null); onOpen(); }}>Tambah Diskon</Button>
        </HStack>

        <TableContainer border="1px" borderColor="gray.200" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg="blue.50">
              <Tr>
                <Th>Produk</Th>
                <Th>Jenis Diskon</Th>
                <Th>Nilai</Th>
                <Th>Periode</Th>
                <Th>Status</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {discounts.map((d) => (
                <Tr key={d.id} _hover={{ bg: "gray.50", cursor: "pointer" }}>
                  <Td>{d.product_name}</Td>
                  <Td>{d.discount_type}</Td>
                  <Td>{d.discount_type === "percent" ? `${d.value}%` : `Rp ${d.value}`}</Td>
                  <Td>
                    {new Date(d.start_date).toLocaleDateString()} - {new Date(d.end_date).toLocaleDateString()}
                  </Td>
                  <Td>{d.active ? "Aktif" : "Nonaktif"}</Td>
                  <Td>
                    <HStack spacing="2">
                      <Button size="xs" colorScheme="yellow" onClick={() => handleEdit(d)}>Edit</Button>
                      <Button size="xs" colorScheme="red" onClick={() => handleDelete(d.id)}>Hapus</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      {/* Modal Add/Edit */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingDiscount ? "Edit Diskon" : "Tambah Diskon"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>Produk</FormLabel>
                <Select value={product_id} onChange={(e) => setProductId(Number(e.target.value))}>
                  <option value="">Pilih Produk</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Jenis Diskon</FormLabel>
                <Select value={discount_type} onChange={(e) => setDiscountType(e.target.value as any)}>
                  <option value="percent">Persen</option>
                  <option value="fixed">Nominal</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Nilai</FormLabel>
                <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
              </FormControl>
              <FormControl>
                <FormLabel>Tanggal Mulai</FormLabel>
                <Input type="datetime-local" value={start_date} onChange={(e) => setStartDate(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Tanggal Selesai</FormLabel>
                <Input type="datetime-local" value={end_date} onChange={(e) => setEndDate(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={active} onChange={(e) => setActive(Number(e.target.value))}>
                  <option value={1}>Aktif</option>
                  <option value={0}>Nonaktif</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={editingDiscount ? handleUpdate : handleAdd}>
              {editingDiscount ? "Update" : "Simpan"}
            </Button>
            <Button variant="ghost" onClick={onClose}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
