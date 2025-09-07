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
  const toast = useToast();

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
    if (!newName) return;
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
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDelete(c.id)}
                    >
                      Hapus
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </Box>
  );
}
