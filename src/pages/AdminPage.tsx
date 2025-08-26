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

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [user_id, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [segment, setSegment] = useState("Admin");

  // Edit state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch admin users
  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get<User[]>("/users");
      // filter hanya Admin & Super Admin
      const filteredUsers = usersRes.data.filter((u) =>
        ["Admin", "Super Admin"].includes(u.segment)
      );
      setUsers(filteredUsers);
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

  const handleAddAdmin = async () => {
    if (!user_id || !name || !password) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }

    try {
      await api.post("/users", { user_id, name, password, segment, branch_id: null });
      toast({ title: "Admin berhasil ditambahkan", status: "success", duration: 3000 });
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menambahkan admin", status: "error", duration: 3000 });
    }
  };

  const handleEditAdmin = (user: User) => {
    setEditingUser(user);
    setUserId(user.user_id);
    setName(user.name);
    setPassword("");
    setSegment(user.segment);
    onOpen();
  };

  const handleUpdateAdmin = async () => {
    if (!editingUser || !user_id || !name) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }

    try {
      await api.put(`/users/${editingUser.id}`, { user_id, name, password, segment, branch_id: null });
      toast({ title: "Admin berhasil diupdate", status: "success", duration: 3000 });
      onClose();
      setEditingUser(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal update admin", status: "error", duration: 3000 });
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast({ title: "Admin berhasil dihapus", status: "success", duration: 3000 });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menghapus admin", status: "error", duration: 3000 });
    }
  };

  const resetForm = () => {
    setUserId("");
    setName("");
    setPassword("");
    setSegment("Admin");
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
          <Text fontSize="2xl" fontWeight="bold">Data Admin</Text>
          <Button colorScheme="blue" onClick={() => { resetForm(); setEditingUser(null); onOpen(); }}>Tambah Admin</Button>
        </HStack>

        <TableContainer border="1px" borderColor="gray.200" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg="blue.50">
              <Tr>
                <Th>ID User</Th>
                <Th>Nama</Th>
                <Th>Segment</Th>
                <Th>Tanggal Dibuat</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr key={u.id} _hover={{ bg: "gray.50", cursor: "pointer" }}>
                  <Td>{u.user_id}</Td>
                  <Td>{u.name}</Td>
                  <Td>{u.segment}</Td>
                  <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing="2">
                      <Button size="xs" colorScheme="yellow" onClick={() => handleEditAdmin(u)}>Edit</Button>
                      <Button size="xs" colorScheme="red" onClick={() => handleDeleteAdmin(u.id)}>Hapus</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      {/* Modal Tambah/Edit Admin */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingUser ? "Edit Admin" : "Tambah Admin"}</ModalHeader>
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
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editingUser ? "Kosongkan jika tidak ingin diubah" : ""} />
              </FormControl>
              <FormControl>
                <FormLabel>Segment</FormLabel>
                <Select value={segment} onChange={(e) => setSegment(e.target.value)}>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={editingUser ? handleUpdateAdmin : handleAddAdmin}>
              {editingUser ? "Update" : "Simpan"}
            </Button>
            <Button variant="ghost" onClick={onClose}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
