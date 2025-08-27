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

export default function SalesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [user_id, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [segment, setSegment] = useState("Retail");
  const [branch_id, setBranchId] = useState<number | null>(null);

  // Edit state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users & branches
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes] = await Promise.all([
        api.get<User[]>("/users"),
        api.get<Branch[]>("/cabang"),
      ]);
      // filter hanya Retail, Agent, Wholesale
      const filteredUsers = usersRes.data.filter((u) =>
        ["Retail", "Agent", "Wholesale"].includes(u.segment)
      );
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

  const handleAddSales = async () => {
    if (!user_id || !name || !password) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }

    try {
      await api.post("/users", { user_id, name, password, segment, branch_id });
      toast({ title: "Sales berhasil ditambahkan", status: "success", duration: 3000 });
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menambahkan sales", status: "error", duration: 3000 });
    }
  };

  const handleEditSales = (user: User) => {
    setEditingUser(user);
    setUserId(user.user_id);
    setName(user.name);
    setPassword("");
    setSegment(user.segment);
    setBranchId(user.branch_id);
    onOpen();
  };

  const handleUpdateSales = async () => {
    if (!editingUser || !user_id || !name) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }

    try {
      await api.put(`/users/${editingUser.id}`, { user_id, name, password, segment, branch_id });
      toast({ title: "Sales berhasil diupdate", status: "success", duration: 3000 });
      onClose();
      setEditingUser(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal update sales", status: "error", duration: 3000 });
    }
  };

  const handleDeleteSales = async (id: number) => {
    if (!confirm("Yakin ingin menghapus sales ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast({ title: "Sales berhasil dihapus", status: "success", duration: 3000 });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menghapus sales", status: "error", duration: 3000 });
    }
  };

  const resetForm = () => {
    setUserId("");
    setName("");
    setPassword("");
    setSegment("Retail");
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
          <Text fontSize="2xl" fontWeight="bold">Data Sales</Text>
          <Button colorScheme="blue" onClick={() => { resetForm(); setEditingUser(null); onOpen(); }}>Tambah Sales</Button>
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
                <Tr key={u.id} _hover={{ bg: "gray.50", cursor: "pointer" }}>
                  <Td>{u.user_id}</Td>
                  <Td>{u.name}</Td>
                  <Td>{u.segment}</Td>
                  <Td>{branches.find(b => b.id === u.branch_id)?.branch_name || "-"}</Td>
                  <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing="2">
                      <Button size="xs" colorScheme="yellow" onClick={() => handleEditSales(u)}>Edit</Button>
                      <Button size="xs" colorScheme="red" onClick={() => handleDeleteSales(u.id)}>Hapus</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      {/* Modal Tambah/Edit Sales */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingUser ? "Edit Sales" : "Tambah Sales"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>ID Karyawan</FormLabel>
                <Input value={user_id} onChange={(e) => setUserId(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Nama Sales</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editingUser ? "Kosongkan jika tidak ingin diubah" : ""} />
              </FormControl>
              <FormControl>
                <FormLabel>Segment</FormLabel>
                <Select value={segment} onChange={(e) => setSegment(e.target.value)}>
                  <option value="Retail">Retail</option>
                  <option value="Agent">Agent</option>
                  <option value="Wholesale">Wholesale</option>
                </Select>
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
            <Button colorScheme="blue" mr={3} onClick={editingUser ? handleUpdateSales : handleAddSales}>
              {editingUser ? "Update" : "Simpan"}
            </Button>
            <Button variant="ghost" onClick={onClose}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
