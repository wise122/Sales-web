import React, { useEffect, useState } from "react";
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
  Input,
  Select,
  Button,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import api from "../utils/api";

type Product = {
  id: number;
  code: string;
  name: string;
  stock: number;
  stock_akhir: number;
};

const ProductsStockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [branch, setBranch] = useState("");

  // Modal Tambah Stok
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addStock, setAddStock] = useState<number>(0);

  const toast = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setProducts(res.data);
    } catch (err) {
      console.error("Error fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // open modal
  const openAddModal = (product: Product) => {
    setSelectedProduct(product);
    setAddStock(0);
    setIsOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    try {
      await api.put(
        `/products/${selectedProduct.id}`,
        {
          tambah: addStock,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      toast({
        title: "Berhasil",
        description: "Stok berhasil diperbarui",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setIsOpen(false);
      fetchProducts();
    } catch (err) {
      toast({
        title: "Gagal",
        description: "Stok gagal diperbarui",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={5}>Manajemen Stok Produk</Heading>

      <Card shadow="md" borderRadius="lg">
        <CardHeader>
          <Heading size="md">Manajemen Produk</Heading>

          <Box mt={4} display="flex" gap={3}>
            <Input
              placeholder="Pencarian Produk"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              width="250px"
            />

            <Select
              placeholder="Kategori Produk"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              width="200px"
            >
              <option value="minuman">Minuman</option>
              <option value="makanan">Makanan</option>
            </Select>


            <Button colorScheme="blue">Filter</Button>
            <Button variant="outline">Reset</Button>
          </Box>
        </CardHeader>

        <CardBody>
          {loading ? (
            <Box textAlign="center" py={6}>
              <Spinner size="xl" />
            </Box>
          ) : (
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th>No</Th>
                  <Th>Kode Produk</Th>
                  <Th>Nama Produk</Th>
                  <Th isNumeric>Stok Awal</Th>
                  <Th isNumeric>Stok Akhir</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>

              <Tbody>
                {products.map((p, index) => (
                  <Tr key={p.id}>
                    <Td>{index + 1}</Td>
                    <Td>{p.code}</Td>
                    <Td>{p.name}</Td>
                    <Td isNumeric>{p.stock}</Td>
                    <Td isNumeric>{p.stock_akhir}</Td>
                    <Td>
                      
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => openAddModal(p)}
                      >
                        Tambah
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* MODAL TAMBAH STOK */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Stok</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedProduct && (
              <>
                <FormControl mb={3}>
                  <FormLabel>Kode Produk</FormLabel>
                  <Input value={selectedProduct.code} isReadOnly />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Nama Produk</FormLabel>
                  <Input value={selectedProduct.name} isReadOnly />
                </FormControl>


                <FormControl mb={3}>
                  <FormLabel>Stok Awal</FormLabel>
                  <Input value={selectedProduct.stock} isReadOnly />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Tambah Stok</FormLabel>
                  <NumberInput
                    min={0}
                    onChange={(_, val) => setAddStock(val)}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateStock}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductsStockPage;
