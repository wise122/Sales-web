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

export default function AdminCabangPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [user_id, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [branch_id, setBranchId] = useState<number | null>(null);

  // Edit state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users Admin Cabang
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes] = await Promise.all([
        api.get<User[]>("/users"),
        api.get<Branch[]>("/cabang"),
      ]);

      const filteredUsers = usersRes.data.filter((u) => u.segment === "Admin Cabang");
      setUsers(filteredUsers);
      setBranches(branchesRes.data);
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

  const handleAdd = async () => {
    if (!user_id || !name || !password || !branch_id) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }
    try {
      await api.post("/users", {
        user_id,
        name,
        password,
        segment: "Admin Cabang",
        branch_id,
      });
      toast({ title: "Admin Cabang berhasil ditambahkan", status: "success", duration: 3000 });
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menambahkan", status: "error", duration: 3000 });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUserId(user.user_id);
    setName(user.name);
    setPassword("");
    setBranchId(user.branch_id);
    onOpen();
  };

  const handleUpdate = async () => {
    if (!editingUser || !user_id || !name || !branch_id) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }
    try {
      await api.put(`/users/${editingUser.id}`, {
        user_id,
        name,
        password,
        segment: "Admin Cabang",
        branch_id,
      });
      toast({ title: "Admin Cabang berhasil diupdate", status: "success", duration: 3000 });
      onClose();
      setEditingUser(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal update", status: "error", duration: 3000 });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus admin cabang ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast({ title: "Admin Cabang berhasil dihapus", status: "success", duration: 3000 });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menghapus", status: "error", duration: 3000 });
    }
  };

  const resetForm = () => {
    setUserId("");
    setName("");
    setPassword("");
    setBranchId(null);
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
            Data Admin Cabang
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => {
              resetForm();
              setEditingUser(null);
              onOpen();
            }}
          >
            Tambah Admin Cabang
          </Button>
        </HStack>

        <TableContainer border="1px" borderColor="gray.200" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg="blue.50">
              <Tr>
                <Th>ID User</Th>
                <Th>Nama</Th>
                <Th>Cabang</Th>
                <Th>Tanggal Dibuat</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr key={u.id} _hover={{ bg: "gray.50", cursor: "pointer" }}>
                  <Td>{u.user_id}</Td>
                  <Td>{u.name}</Td>
                  <Td>{u.branch_name ?? "-"}</Td>
                  <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing="2">
                      <Button size="xs" colorScheme="yellow" onClick={() => handleEdit(u)}>
                        Edit
                      </Button>
                      <Button size="xs" colorScheme="red" onClick={() => handleDelete(u.id)}>
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

      {/* Modal Tambah/Edit Admin Cabang */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingUser ? "Edit Admin Cabang" : "Tambah Admin Cabang"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>ID User</FormLabel>
                <Input value={user_id} onChange={(e) => setUserId(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Nama</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? "Kosongkan jika tidak ingin diubah" : ""}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cabang</FormLabel>
                <Select
                  placeholder="Pilih cabang"
                  value={branch_id ?? ""}
                  onChange={(e) => setBranchId(Number(e.target.value))}
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
              onClick={editingUser ? handleUpdate : handleAdd}
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
