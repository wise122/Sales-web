// src/pages/OutletsPage.tsx
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
import { useAuth } from "../context/AuthContext"; // ✅ pakai AuthContext

interface Outlet {
  id: number;
  store_name: string;
  owner_name: string;
  branch_id: number;
  branch_name: string;
  segment: string;
  created_at: string;
}

interface Branch {
  id: number;
  branch_code: string;
  branch_name: string;
}

export default function OutletsPage() {
  const { user } = useAuth(); // ✅ ambil user dari context
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [store_name, setStoreName] = useState("");
  const [owner_name, setOwnerName] = useState("");
  const [branch_id, setBranch] = useState<string>("");
  const [segment, setSegment] = useState("Retail");

  // Edit state
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resOutlets = await api.get<Outlet[]>("/outlets");
      setOutlets(resOutlets.data);

      setBranchLoading(true);
      const resBranches = await api.get("/cabang");
      const dataBranches: Branch[] = Array.isArray(resBranches.data)
        ? resBranches.data
        : resBranches.data?.data || [];
      setBranches(dataBranches);
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal mengambil data", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
      setBranchLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // default cabang untuk Admin Cabang
    if (user?.segment === "Admin Cabang" && user.branch_id) {
      setBranch(String(user.branch_id));
    }
  }, [user]);

  const handleAddOutlet = async () => {
    if (!store_name || !owner_name || !branch_id) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }

    try {
      await api.post("/outlets", {
        store_name,
        owner_name,
        branch_id: Number(branch_id),
        segment,
      });
      toast({
        title: "Outlet berhasil ditambahkan",
        status: "success",
        duration: 3000,
      });
      onClose();
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menambahkan outlet", status: "error", duration: 3000 });
    }
  };

  const handleEditOutlet = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setStoreName(outlet.store_name);
    setOwnerName(outlet.owner_name);
    setBranch(String(outlet.branch_id));
    setSegment(outlet.segment);
    onOpen();
  };

  const handleUpdateOutlet = async () => {
    if (!editingOutlet || !store_name || !owner_name || !branch_id) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }

    try {
      await api.put(`/outlets/${editingOutlet.id}`, {
        store_name,
        owner_name,
        branch_id: Number(branch_id),
        segment,
      });
      toast({
        title: "Outlet berhasil diupdate",
        status: "success",
        duration: 3000,
      });
      onClose();
      setEditingOutlet(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal update outlet", status: "error", duration: 3000 });
    }
  };

  const handleDeleteOutlet = async (id: number) => {
    if (!confirm("Yakin ingin menghapus outlet ini?")) return;
    try {
      await api.delete(`/outlets/${id}`);
      toast({
        title: "Outlet berhasil dihapus",
        status: "success",
        duration: 3000,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menghapus outlet", status: "error", duration: 3000 });
    }
  };

  const resetForm = () => {
    setStoreName("");
    setOwnerName("");
    if (user?.segment === "Admin Cabang" && user.branch_id) {
      setBranch(String(user.branch_id));
    } else {
      setBranch("");
    }
    setSegment("Retail");
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
            Data Outlet
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => {
              resetForm();
              setEditingOutlet(null);
              onOpen();
            }}
          >
            Tambah Outlet
          </Button>
        </HStack>

        <TableContainer border="1px" borderColor="gray.200" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg="blue.50">
              <Tr>
                <Th>Nama Toko</Th>
                <Th>Pemilik</Th>
                <Th>Cabang</Th>
                <Th>Segment</Th>
                <Th>Tanggal Dibuat</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {outlets
                .filter((o) => o.segment === "Retail")
                .map((o) => (
                  <Tr key={o.id} _hover={{ bg: "gray.50", cursor: "pointer" }}>
                    <Td>{o.store_name}</Td>
                    <Td>{o.owner_name}</Td>
                    <Td>{o.branch_name}</Td>
                    <Td>{o.segment}</Td>
                    <Td>{new Date(o.created_at).toLocaleDateString()}</Td>
                    <Td>
                      <HStack spacing="2">
                        <Button
                          size="xs"
                          colorScheme="yellow"
                          onClick={() => handleEditOutlet(o)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() => handleDeleteOutlet(o.id)}
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

      {/* Modal Tambah/Edit Outlet */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingOutlet ? "Edit Outlet" : "Tambah Outlet"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>Nama Toko</FormLabel>
                <Input
                  value={store_name}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nama Pemilik</FormLabel>
                <Input
                  value={owner_name}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cabang</FormLabel>
                <Select
                  value={branch_id}
                  onChange={(e) => setBranch(e.target.value)}
                  isDisabled={
                    branchLoading ||
                    branches.length === 0 ||
                    user?.segment === "Admin Cabang"
                  }
                  placeholder={
                    branchLoading ? "Memuat cabang..." : "Pilih Cabang"
                  }
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name}
                    </option>
                  ))}
                </Select>
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
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={editingOutlet ? handleUpdateOutlet : handleAddOutlet}
            >
              {editingOutlet ? "Update" : "Simpan"}
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
