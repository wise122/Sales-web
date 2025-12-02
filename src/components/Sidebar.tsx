import React, { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Icon,
  Divider,
  Collapse,
  HStack,
  Button,
} from "@chakra-ui/react";
import {
  FiPackage,
  FiUsers,
  FiMapPin,
  FiPercent,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiFileText,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

type SubMenuItem = {
  label: string;
  path: string;
  allowSegment?: string[];
};

type MenuItem = {
  label: string;
  icon: React.ElementType;
  path?: string;
  subMenu?: SubMenuItem[];
};

const menuItems: MenuItem[] = [
  { label: "Produk", icon: FiPackage, path: "/produk" },
  { label: "Master Stok", icon: FiPackage, path: "/stok" },

  {
    label: "Data Karyawan",
    icon: FiUsers,
    subMenu: [
      { label: "Sales", path: "/sales", allowSegment: ["Admin", "Admin Cabang","Super Admin"] },
      { label: "Admin", path: "/admin", allowSegment: ["Admin","Super Admin"] },
      { label: "Admin Cabang", path: "/admin-cabang", allowSegment: ["Admin","Super Admin"] },
    ],
  },

  {
    label: "Outlet",
    icon: FiMapPin,
    subMenu: [
      { label: "Agent", path: "/toko/agent" },
      { label: "Wholesaler", path: "/toko/wholesale" },
      { label: "Retail", path: "/toko/retail" },
    ],
  },

  { label: "Cabang", icon: FiMapPin, path: "/cabang" },
  { label: "Set Discount", icon: FiPercent, path: "/diskon" },

  {
    label: "Asset/Inventaris",
    icon: FiPackage,
    subMenu: [
      { label: "Asset", path: "/asset" },
      { label: "Kategori Asset", path: "/kategori-asset" },
    ],
  },

  {
    label: "Laporan",
    icon: FiFileText,
    subMenu: [{ label: "Penjualan", path: "/laporan-penjualan" }],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  // Ambil user segment dari localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userSegment: string | undefined = user.segment;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box
      w="240px"
      bg="white"
      p="4"
      borderRight="1px"
      borderColor="gray.200"
      shadow="sm"
      h="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb="6" textAlign="center">
          Pusantara
        </Text>

        <VStack spacing="2" align="stretch">
          {menuItems.map((item) => {
            const hasSubMenu = !!item.subMenu;

            // FILTER subMenu untuk Data Karyawan
            let filteredSubMenu = item.subMenu;
            if (item.label === "Data Karyawan") {
              filteredSubMenu = item.subMenu?.filter((sub) => {
                if (!sub.allowSegment) return true; // default: tampil semua
                return userSegment && sub.allowSegment.includes(userSegment);
              });
            }

            const isActive =
              item.path && location.pathname === item.path
                ? true
                : filteredSubMenu?.some((sub) => sub.path === location.pathname);

            return (
              <Box key={item.label}>
                {/* Item utama */}
                <HStack
                  p="3"
                  borderRadius="md"
                  cursor="pointer"
                  bg={isActive ? "blue.100" : "transparent"}
                  color={isActive ? "blue.600" : "gray.800"}
                  _hover={{ bg: isActive ? "blue.200" : "gray.100" }}
                  onClick={() => {
                    if (hasSubMenu) {
                      setOpenSubMenu(
                        openSubMenu === item.label ? null : item.label
                      );
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  transition="0.2s"
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text fontWeight={isActive ? "bold" : "medium"} flex="1">
                    {item.label}
                  </Text>
                  {hasSubMenu && (
                    <Icon
                      as={
                        openSubMenu === item.label ? FiChevronUp : FiChevronDown
                      }
                    />
                  )}
                </HStack>

                {/* Submenu */}
                {hasSubMenu && (
                  <Collapse in={openSubMenu === item.label}>
                    <VStack spacing="1" align="stretch" pl="8" mt="1">
                      {filteredSubMenu?.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <HStack
                            key={sub.label}
                            p="2"
                            borderRadius="md"
                            cursor="pointer"
                            bg={isSubActive ? "blue.50" : "transparent"}
                            _hover={{ bg: "blue.100" }}
                            onClick={() => navigate(sub.path)}
                            transition="0.2s"
                          >
                            <Text fontSize="sm" fontWeight="medium">
                              {sub.label}
                            </Text>
                          </HStack>
                        );
                      })}
                    </VStack>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </VStack>
      </Box>

      {/* Footer Logout */}
      <Box>
        <Divider my="4" />
        <Button
          w="full"
          leftIcon={<FiLogOut />}
          colorScheme="red"
          variant="outline"
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Text fontSize="xs" color="gray.500" textAlign="center" mt="4">
          © 2025 Pusantara
        </Text>
      </Box>
    </Box>
  );
}
