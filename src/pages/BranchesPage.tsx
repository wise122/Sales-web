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
  Link,
  TableContainer,
} from "@chakra-ui/react";
import api from "../utils/api";

interface Branch {
  id: number;
  branch_code: string;
  branch_name: string;
  address: string;
  maps_url?: string;
  contact?: string;
  contact_person?: string;
  created_at: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEdit, setIsEdit] = useState(false);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [contact, setContact] = useState("");
  const [contactPerson, setContactPerson] = useState("");

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
    setMapsUrl("");
    setContact("");
    setContactPerson("");
    onOpen();
  };

  const openEditModal = (branch: Branch) => {
    setIsEdit(true);
    setBranchId(branch.id);
    setBranchCode(branch.branch_code);
    setBranchName(branch.branch_name);
    setAddress(branch.address);
    setMapsUrl(branch.maps_url || "");
    setContact(branch.contact || "");
    setContactPerson(branch.contact_person || "");
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
      await api.request({
        method,
        url,
        data: {
          branch_code: branchCode,
          branch_name: branchName,
          address,
          maps_url: mapsUrl,
          contact,
          contact_person: contactPerson,
        },
      });
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
      <Text fontSize="2xl" fontWeight="bold" mb="4">
        Daftar Cabang
      </Text>

      <Button colorScheme="blue" mb="4" onClick={openAddModal}>
        + Tambah Cabang
      </Button>

      {loading ? (
        <Spinner />
      ) : (
        <TableContainer
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          boxShadow="sm"
          bg="white"
        >
          <Table variant="simple" size="sm">
            <Thead bg="gray.100">
              <Tr>
                <Th>Kode</Th>
                <Th>Nama</Th>
                <Th>Alamat</Th>
                <Th>Maps</Th>
                <Th>Kontak</Th>
                <Th>Narahubung</Th>
                <Th textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {branches.map((branch) => (
                <Tr
                  key={branch.id}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.2s"
                >
                  <Td fontWeight="semibold">{branch.branch_code}</Td>
                  <Td>{branch.branch_name}</Td>
                  <Td>{branch.address}</Td>
                  <Td>
                    {branch.maps_url ? (
                      <Link color="blue.500" href={branch.maps_url} isExternal>
                        Lihat
                      </Link>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td>{branch.contact || "-"}</Td>
                  <Td>{branch.contact_person || "-"}</Td>
                  <Td textAlign="center">
                    <HStack spacing={2} justify="center">
                      <Button size="xs" colorScheme="yellow" onClick={() => openEditModal(branch)}>
                        Edit
                      </Button>
                      <Button size="xs" colorScheme="red" onClick={() => openDeleteConfirm(branch.id)}>
                        Hapus
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
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
            <FormControl mb="3">
              <FormLabel>Maps Kantor (URL)</FormLabel>
              <Input
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://goo.gl/maps/..."
              />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>Kontak Cabang</FormLabel>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+62..." />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>Narahubung</FormLabel>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Nama narahubung"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button colorScheme="blue" onClick={handleSaveBranch}>
              {isEdit ? "Update" : "Simpan"}
            </Button>
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
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Batal
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleDelete}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
