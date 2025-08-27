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

export default function ManagementPage() {
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

  // Fetch users & branches
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes] = await Promise.all([
        api.get<User[]>("/proxy/users"),
        api.get<Branch[]>("/proxy/cabang"),
      ]);
      // filter khusus Management
      setUsers(usersRes.data.filter((u) => u.segment === "Management"));
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

  const handleAddManagement = async () => {
    if (!user_id || !name || !password) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }

    try {
      await api.post("/proxy/users", {
        user_id,
        name,
        password,
        segment: "Management",
        branch_id,
      });
      toast({ title: "Management berhasil ditambahkan", status: "success", duration: 3000 });
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menambahkan management", status: "error", duration: 3000 });
    }
  };

  const handleEditManagement = (user: User) => {
    setEditingUser(user);
    setUserId(user.user_id);
    setName(user.name);
    setPassword(""); // kosongkan password
    setBranchId(user.branch_id);
    onOpen();
  };

  const handleUpdateManagement = async () => {
    if (!editingUser || !user_id || !name) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }

    try {
      await api.put(`/proxy/users/${editingUser.id}`, {
        user_id,
        name,
        password,
        segment: "Management",
        branch_id,
      });
      toast({ title: "Management berhasil diupdate", status: "success", duration: 3000 });
      onClose();
      setEditingUser(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal update management", status: "error", duration: 3000 });
    }
  };

  const handleDeleteManagement = async (id: number) => {
    if (!confirm("Yakin ingin menghapus management ini?")) return;
    try {
      await api.delete(`/proxy/users/${id}`);
      toast({ title: "Management berhasil dihapus", status: "success", duration: 3000 });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menghapus management", status: "error", duration: 3000 });
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
          <Text fontSize="2xl" fontWeight="bold">Data Management</Text>
          <Button colorScheme="blue" onClick={() => { resetForm(); setEditingUser(null); onOpen(); }}>Tambah Management</Button>
        </HStack>

        <TableContainer border="1px" borderColor="gray.200" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg="blue.50">
              <Tr>
                <Th>ID Karyawan</Th>
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
                  <Td>{branches.find(b => b.id === u.branch_id)?.branch_name || "-"}</Td>
                  <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing="2">
                      <Button size="xs" colorScheme="yellow" onClick={() => handleEditManagement(u)}>Edit</Button>
                      <Button size="xs" colorScheme="red" onClick={() => handleDeleteManagement(u.id)}>Hapus</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      {/* Modal Tambah/Edit Management */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingUser ? "Edit Management" : "Tambah Management"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>ID Karyawan</FormLabel>
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
                <Select value={branch_id || ""} onChange={(e) => setBranchId(Number(e.target.value) || null)}>
                  <option value="">Pilih Cabang</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.branch_name}</option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={editingUser ? handleUpdateManagement : handleAddManagement}>
              {editingUser ? "Update" : "Simpan"}
            </Button>
            <Button variant="ghost" onClick={onClose}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
