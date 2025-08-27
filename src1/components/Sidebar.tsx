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
  FiGift,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

type SubMenuItem = {
  label: string;
  path: string;
};

type MenuItem = {
  label: string;
  icon: React.ElementType;   // ✅ pakai ElementType, bukan IconType
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
      { label: "SALES", path: "/sales" },
      { label: "MANAGEMENT", path: "/management" },
      { label: "ADMIN", path: "/admin" },
    ],
  },
  {
    label: "Data Toko",
    icon: FiMapPin,
    subMenu: [
      { label: "Agent", path: "/toko/agent" },
      { label: "Wholesaler", path: "/toko/wholesale" },
      { label: "Retail", path: "/toko/retail" },
    ],
  },
  { label: "Set Discount", icon: FiPercent, path: "/set-discount" },
  { label: "Set Bonus", icon: FiGift, path: "/set-bonus" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
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
      {/* Menu utama */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb="6" textAlign="center">
          Pusantara
        </Text>

        <VStack spacing="2" align="stretch">
          {menuItems.map((item) => {
            const isActive =
              item.path && location.pathname === item.path
                ? true
                : item.subMenu?.some((sub) => sub.path === location.pathname);

            const hasSubMenu = !!item.subMenu;

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
                  transition="all 0.2s"
                >
                  <Icon as={item.icon} boxSize={5} />   {/* ✅ no error now */}
                  <Text
                    fontWeight={isActive ? "bold" : "medium"}
                    flex="1"
                    noOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {hasSubMenu && (
                    <Icon
                      as={openSubMenu === item.label ? FiChevronUp : FiChevronDown}
                    />
                  )}
                </HStack>

                {/* Submenu */}
                {hasSubMenu && (
                  <Collapse in={!!(openSubMenu === item.label)} animateOpacity>
                    <VStack spacing="1" align="stretch" pl="8" mt="1">
                      {item.subMenu!.map((sub) => {
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
                            transition="all 0.2s"
                          >
                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
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

      {/* Logout section */}
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
