import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Heading,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Button,
  useDisclosure,
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
  NumberInput,
  NumberInputField,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import api from "../utils/api";

type Product = {
  id: number;
  code: string;
  name: string;
  price_retail: number;
  price_wholesaler: number;
  price_agent: number;
  stock: number;          // Stock Awal
  stock_akhir: number;    // Stock Akhir
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<Product[]>("/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Gagal fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
      } else {
        await api.post("/products", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
      }
      fetchProducts();
      onFormClose();
    } catch (err) {
      console.error("❌ Gagal simpan produk:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      fetchProducts();
      onDeleteClose();
    } catch (err) {
      console.error("❌ Gagal hapus produk:", err);
    }
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Daftar Produk</Heading>
        <Button
          colorScheme="teal"
          onClick={() => {
            setSelectedProduct(null);
            setFormData({});
            onFormOpen();
          }}
        >
          + Tambah Produk
        </Button>
      </HStack>

      {loading ? (
        <Spinner size="xl" />
      ) : products.length === 0 ? (
        <Text>Tidak ada produk.</Text>
      ) : (
        <Table variant="striped" colorScheme="teal" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>SKU</Th>
              <Th>Nama Produk</Th>
              <Th isNumeric>Harga Retail</Th>
              <Th isNumeric>Harga Grosir</Th>
              <Th isNumeric>Harga Agen</Th>
              <Th isNumeric>Stock Awal</Th>
              <Th isNumeric>Stock Akhir</Th>
              <Th>Aksi</Th>
            </Tr>
          </Thead>

          <Tbody>
            {products.map((p, index) => (
              <Tr key={p.id}>
                <Td>{index + 1}</Td>
                <Td>{p.code}</Td>
                <Td>{p.name}</Td>
                <Td isNumeric>{p.price_retail.toLocaleString("id-ID")}</Td>
                <Td isNumeric>{p.price_wholesaler.toLocaleString("id-ID")}</Td>
                <Td isNumeric>{p.price_agent.toLocaleString("id-ID")}</Td>
                <Td isNumeric>{p.stock}</Td>
                <Td isNumeric>{p.stock_akhir}</Td>
                <Td>
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => {
                        setSelectedProduct(p);
                        setFormData(p);
                        onFormOpen();
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => {
                        setDeleteId(p.id);
                        onDeleteOpen();
                      }}
                    >
                      Hapus
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Modal Add/Edit */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProduct ? "Edit Produk" : "Tambah Produk"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>SKU</FormLabel>
              <Input
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Nama Produk</FormLabel>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Harga Retail</FormLabel>
              <NumberInput min={0} value={formData.price_retail || 0}>
                <NumberInputField
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_retail: Number(e.target.value),
                    })
                  }
                />
              </NumberInput>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Harga Grosir</FormLabel>
              <NumberInput min={0} value={formData.price_wholesaler || 0}>
                <NumberInputField
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_wholesaler: Number(e.target.value),
                    })
                  }
                />
              </NumberInput>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Harga Agen</FormLabel>
              <NumberInput min={0} value={formData.price_agent || 0}>
                <NumberInputField
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_agent: Number(e.target.value),
                    })
                  }
                />
              </NumberInput>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Stock Awal</FormLabel>
              <NumberInput min={0} value={formData.stock || 0}>
                <NumberInputField
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: Number(e.target.value),
                    })
                  }
                />
              </NumberInput>
            </FormControl>

          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onFormClose}>
              Batal
            </Button>
            <Button colorScheme="teal" onClick={handleSave} ml={3}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AlertDialog Delete */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Konfirmasi Hapus
            </AlertDialogHeader>
            <AlertDialogBody>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              bisa dibatalkan.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Batal
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ProductsPage;
