// src/pages/BranchesPage.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
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
  useDisclosure,
  useToast,
  HStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import api from "../utils/api"; // pastikan api instance sudah dibuat

interface Branch {
  id: number;
  branch_code: string;
  branch_name: string;
  address: string;
  created_at: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Tambah/Edit
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEdit, setIsEdit] = useState(false);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");

  // AlertDialog Hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const toast = useToast();

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get<Branch[]>("/cabang");
      setBranches(res.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal mengambil data cabang", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openAddModal = () => {
    setIsEdit(false);
    setBranchId(null);
    setBranchCode("");
    setBranchName("");
    setAddress("");
    onOpen();
  };

  const openEditModal = (branch: Branch) => {
    setIsEdit(true);
    setBranchId(branch.id);
    setBranchCode(branch.branch_code);
    setBranchName(branch.branch_name);
    setAddress(branch.address);
    onOpen();
  };

  const handleSaveBranch = async () => {
    if (!branchCode || !branchName || !address) {
      toast({ title: "Isi semua field wajib", status: "error", duration: 3000 });
      return;
    }
    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/cabang/${branchId}` : "/cabang";
      await api.request({ method, url, data: { branch_code: branchCode, branch_name: branchName, address } });
      toast({ title: isEdit ? "Cabang diperbarui" : "Cabang ditambahkan", status: "success", duration: 3000 });
      onClose();
      fetchBranches();
    } catch (err: any) {
      console.error(err);
      toast({ title: err?.response?.data?.message || "Terjadi kesalahan", status: "error", duration: 3000 });
    }
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/cabang/${deleteId}`);
      toast({ title: "Cabang dihapus", status: "info", duration: 3000 });
      fetchBranches();
    } catch (err) {
      console.error(err);
      toast({ title: "Gagal menghapus cabang", status: "error", duration: 3000 });
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <Box p="6">
      <Text fontSize="2xl" fontWeight="bold" mb="4">Daftar Cabang</Text>

      <Button colorScheme="blue" mb="4" onClick={openAddModal}>+ Tambah Cabang</Button>

      {loading ? (
        <Spinner />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Kode</Th>
              <Th>Nama</Th>
              <Th>Alamat</Th>
              <Th>Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {branches.map((branch) => (
              <Tr key={branch.id}>
                <Td>{branch.branch_code}</Td>
                <Td>{branch.branch_name}</Td>
                <Td>{branch.address}</Td>
                <Td>
                  <HStack>
                    <Button size="sm" colorScheme="yellow" onClick={() => openEditModal(branch)}>Edit</Button>
                    <Button size="sm" colorScheme="red" onClick={() => openDeleteConfirm(branch.id)}>Hapus</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? "Edit Cabang" : "Tambah Cabang"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="3">
              <FormLabel>Kode Cabang</FormLabel>
              <Input value={branchCode} onChange={(e) => setBranchCode(e.target.value)} />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>Nama Cabang</FormLabel>
              <Input value={branchName} onChange={(e) => setBranchName(e.target.value)} />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>Alamat</FormLabel>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Batal</Button>
            <Button colorScheme="blue" onClick={handleSaveBranch}>{isEdit ? "Update" : "Simpan"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AlertDialog Konfirmasi Hapus */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={() => setIsDeleteOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Konfirmasi Hapus</AlertDialogHeader>
            <AlertDialogBody>
              Apakah Anda yakin ingin menghapus cabang ini? Tindakan ini tidak bisa dibatalkan.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>Batal</Button>
              <Button colorScheme="red" ml={3} onClick={handleDelete}>Hapus</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
