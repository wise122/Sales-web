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
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import api from "../utils/api";

interface Asset {
  id: number;
  asset_name: string;
  asset_code: string;
  purchase_date: string;
  value: number;
  description: string;
  category: { id: number; name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  // form state
  const [asset_name, setAssetName] = useState("");
  const [asset_code, setAssetCode] = useState("");
  const [purchase_date, setPurchaseDate] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [editing, setEditing] = useState<Asset | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resAssets = await api.get("/assets");
      const resCategories = await api.get("/asset-categories");
      setAssets(resAssets.data);
      setCategories(resCategories.data);
    } catch (err) {
      toast({ title: "Gagal fetch data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setAssetName("");
    setAssetCode("");
    setPurchaseDate("");
    setValue("");
    setDescription("");
    setCategoryId("");
    setEditing(null);
  };

  const handleSave = async () => {
    if (!asset_name || !asset_code || !purchase_date || !value) {
      toast({ title: "Isi semua field wajib", status: "error" });
      return;
    }

    try {
      if (editing) {
        await api.put(`/assets/${editing.id}`, {
          asset_name,
          asset_code,
          purchase_date,
          value: Number(value),
          description,
          category_id: category_id ? Number(category_id) : null,
        });
        toast({ title: "Asset berhasil diupdate", status: "success" });
      } else {
        await api.post("/assets", {
          asset_name,
          asset_code,
          purchase_date,
          value: Number(value),
          description,
          category_id: category_id ? Number(category_id) : null,
        });
        toast({ title: "Asset berhasil ditambahkan", status: "success" });
      }
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      toast({ title: "Gagal simpan asset", status: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus asset ini?")) return;
    try {
      await api.delete(`/assets/${id}`);
      toast({ title: "Asset berhasil dihapus", status: "success" });
      fetchData();
    } catch (err) {
      toast({ title: "Gagal hapus asset", status: "error" });
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
          <Text fontSize="2xl" fontWeight="bold">Data Asset</Text>
          <Button
            colorScheme="blue"
            onClick={() => {
              resetForm();
              onOpen();
            }}
          >
            Tambah Asset
          </Button>
        </HStack>

        <TableContainer border="1px" borderColor="gray.200" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg="blue.50">
              <Tr>
                <Th>Nama Asset</Th>
                <Th>Kode</Th>
                <Th>Tgl Beli</Th>
                <Th>Nilai</Th>
                <Th>Kategori</Th>
                <Th>Deskripsi</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {assets.map((a) => (
                <Tr key={a.id}>
                  <Td>{a.asset_name}</Td>
                  <Td>{a.asset_code}</Td>
                  <Td>{new Date(a.purchase_date).toLocaleDateString()}</Td>
                  <Td>{a.value.toLocaleString()}</Td>
                  <Td>{a.category?.name || "—"}</Td>
                  <Td>{a.description || "—"}</Td>
                  <Td>
                    <HStack spacing="2">
                      <Button
                        size="xs"
                        colorScheme="yellow"
                        onClick={() => {
                          setEditing(a);
                          setAssetName(a.asset_name);
                          setAssetCode(a.asset_code);
                          setPurchaseDate(a.purchase_date);
                          setValue(String(a.value));
                          setDescription(a.description);
                          setCategoryId(a.category?.id ? String(a.category.id) : "");
                          onOpen();
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDelete(a.id)}
                      >
                        Hapus
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? "Edit Asset" : "Tambah Asset"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>Nama Asset</FormLabel>
                <Input value={asset_name} onChange={(e) => setAssetName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Kode Asset</FormLabel>
                <Input value={asset_code} onChange={(e) => setAssetCode(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Tanggal Pembelian</FormLabel>
                <Input type="date" value={purchase_date} onChange={(e) => setPurchaseDate(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Nilai</FormLabel>
                <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Kategori</FormLabel>
                <Select value={category_id} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Deskripsi</FormLabel>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              {editing ? "Update" : "Simpan"}
            </Button>
            <Button onClick={onClose}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
