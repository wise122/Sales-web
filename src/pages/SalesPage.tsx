// src/pages/SalesPage.tsx
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
import { useAuth } from "../context/AuthContext";

interface User {
  id: number;
  user_id: string;
  name: string;
  segment: string;
  branch_id: number | null;
  branch_name: string | null;
  created_at: string;
}

interface Branch {
  id: number;
  branch_name: string;
}

export default function SalesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<number | null>(
    user?.branch_id ? Number(user.branch_id) : null
  );
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [user_id, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [segment, setSegment] = useState("Retail");

  // Edit state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resUsers = await api.get<User[]>("/users");
      let filteredUsers = resUsers.data.filter((u) =>
        ["Retail", "Agent", "Wholesale"].includes(u.segment)
      );
      if (user?.branch_id) {
        filteredUsers = filteredUsers.filter(
          (u) => u.branch_id === user.branch_id
        );
      }
      setUsers(filteredUsers);
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal mengambil data",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get<Branch[]>("/cabang");
      if (user?.segment === "Admin Cabang") {
        const myBranch = res.data.find((b) => b.id === Number(user.branch_id));
        if (myBranch) setBranches([myBranch]);
      } else {
        setBranches(res.data);
      }
      
      if (!branchId && res.data.length > 0) setBranchId(res.data[0].id);
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal mengambil data cabang",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchData();
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setUserId("");
    setName("");
    setPassword("");
    setSegment("Retail");
    setEditingUser(null);
    setBranchId(user?.branch_id ? Number(user.branch_id) : null);
  };
  

  const handleAddSales = async () => {
    if (!user_id || !name || !password || !branchId) {
      toast({
        title: "Isi semua field wajib",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await api.post("/users", {
        user_id,
        name,
        password,
        segment,
        branch_id: branchId,
      });
      toast({
        title: "Sales berhasil ditambahkan",
        status: "success",
        duration: 3000,
      });
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal menambahkan sales",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditSales = (u: User) => {
    setEditingUser(u);
    setUserId(u.user_id);
    setName(u.name);
    setPassword("");
    setSegment(u.segment);
    setBranchId(u.branch_id);
    onOpen();
  };

  const handleUpdateSales = async () => {
    if (!editingUser || !user_id || !name || !branchId) {
      toast({
        title: "Isi semua field wajib",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await api.put(`/users/${editingUser.id}`, {
        user_id,
        name,
        password,
        segment,
        branch_id: branchId,
      });
      toast({
        title: "Sales berhasil diupdate",
        status: "success",
        duration: 3000,
      });
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal update sales",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteSales = async (id: number) => {
    if (!confirm("Yakin ingin menghapus sales ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast({
        title: "Sales berhasil dihapus",
        status: "success",
        duration: 3000,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal menghapus sales",
        status: "error",
        duration: 3000,
      });
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
          <Text fontSize="2xl" fontWeight="bold">
            Data Sales
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => {
              resetForm();
              onOpen();
            }}
          >
            Tambah Sales
          </Button>
        </HStack>

        <TableContainer border="1px" borderColor="gray.200" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg="blue.50">
              <Tr>
                <Th>ID Karyawan</Th>
                <Th>Nama Sales</Th>
                <Th>Segment</Th>
                <Th>Cabang</Th>
                <Th>Tanggal Dibuat</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr
                  key={u.id}
                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                >
                  <Td>{u.user_id}</Td>
                  <Td>{u.name}</Td>
                  <Td>{u.segment}</Td>
                  <Td>{u.branch_name || "-"}</Td>
                  <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing="2">
                      <Button
                        size="xs"
                        colorScheme="yellow"
                        onClick={() => handleEditSales(u)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDeleteSales(u.id)}
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

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingUser ? "Edit Sales" : "Tambah Sales"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>ID Karyawan</FormLabel>
                <Input
                  value={user_id}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nama Sales</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    editingUser ? "Kosongkan jika tidak ingin diubah" : ""
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Segment</FormLabel>
                <Select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                >
                  <option value="Retail">Retail</option>
                  <option value="Agent">Agent</option>
                  <option value="Wholesale">Wholesale</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Cabang</FormLabel>
                <Select
                  placeholder="Pilih cabang"
                  value={branchId ?? ""}
                  onChange={(e) =>
                    setBranchId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  isDisabled={user?.segment === "Admin Cabang"}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={editingUser ? handleUpdateSales : handleAddSales}
            >
              {editingUser ? "Update" : "Simpan"}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
