import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  Button,
  HStack,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import api from "../utils/api";

interface AssetCategory {
  id: number;
  name: string;
}

export default function AssetCategoriesPage() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<AssetCategory | null>(null);
  const [editName, setEditName] = useState("");

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<AssetCategory[]>("/asset-categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal mengambil data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast({ title: "Nama kategori wajib diisi", status: "warning" });
      return;
    }
    try {
      await api.post("/asset-categories", { name: newName });
      setNewName("");
      toast({ title: "Kategori berhasil ditambahkan", status: "success" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menambahkan kategori", status: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await api.delete(`/asset-categories/${id}`);
      toast({ title: "Kategori berhasil dihapus", status: "success" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menghapus kategori", status: "error" });
    }
  };

  const handleEditOpen = (cat: AssetCategory) => {
    setEditing(cat);
    setEditName(cat.name);
    onOpen();
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast({ title: "Nama kategori wajib diisi", status: "warning" });
      return;
    }
    try {
      await api.put(`/asset-categories/${editing?.id}`, { name: editName });
      toast({ title: "Kategori berhasil diupdate", status: "success" });
      onClose();
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal mengupdate kategori", status: "error" });
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
        <Text fontSize="2xl" fontWeight="bold">
          Kategori Asset
        </Text>

        {/* Tambah kategori */}
        <HStack>
          <Input
            placeholder="Nama kategori baru"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleAdd}>
            Tambah
          </Button>
        </HStack>

        {/* Tabel daftar kategori */}
        <TableContainer border="1px" borderColor="gray.200" borderRadius="md">
          <Table size="sm">
            <Thead bg="blue.50">
              <Tr>
                <Th>ID</Th>
                <Th>Nama</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.id}</Td>
                  <Td>{c.name}</Td>
                  <Td>
                    <HStack spacing="2">
                      <Button
                        size="xs"
                        colorScheme="yellow"
                        onClick={() => handleEditOpen(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDelete(c.id)}
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

      {/* Modal edit */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Kategori</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Nama Kategori</FormLabel>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditSave}>
              Simpan
            </Button>
            <Button onClick={onClose}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
