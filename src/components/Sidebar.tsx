import React, { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Icon,
  Divider,
  Collapse,
  HStack,
  Badge,
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
import { IconType } from "react-icons";

interface MenuItem {
  label: string;
  icon: IconType;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { label: "Produk", icon: FiPackage, path: "/produk" },
  { label: "User", icon: FiUsers, path: "/users" },
  { label: "Outlet", icon: FiMapPin, path: "/outlets" },
  { label: "Promo", icon: FiPercent, path: "/promo" },
  {
    label: "Gift",
    icon: FiGift,
    children: [
      { label: "Voucher", icon: FiGift, path: "/gift/voucher" },
      { label: "Hadiah", icon: FiGift, path: "/gift/hadiah" },
    ],
  },
];

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  return (
    <Box
      w="250px"
      h="100vh"
      bg="gray.800"
      color="white"
      p={4}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {/* Menu utama */}
      <VStack align="stretch" spacing={2}>
        {menuItems.map((item) => (
          <Box key={item.label}>
            <HStack
              p={2}
              borderRadius="md"
              _hover={{ bg: "gray.700", cursor: "pointer" }}
              onClick={() =>
                item.children ? toggleMenu(item.label) : console.log(item.path)
              }
              justify="space-between"
            >
              <HStack>
                <Icon as={item.icon} boxSize={5} />
                <Text>{item.label}</Text>
              </HStack>
              {item.children && (
                <Icon
                  as={openMenu === item.label ? FiChevronUp : FiChevronDown}
                />
              )}
            </HStack>

            {/* Submenu */}
            {item.children && (
              <Collapse in={openMenu === item.label} animateOpacity>
                <VStack pl={8} align="stretch" spacing={1}>
                  {item.children.map((child) => (
                    <HStack
                      key={child.label}
                      p={2}
                      borderRadius="md"
                      _hover={{ bg: "gray.700", cursor: "pointer" }}
                      onClick={() => console.log(child.path)}
                    >
                      <Icon as={child.icon} boxSize={4} />
                      <Text fontSize="sm">{child.label}</Text>
                      <Badge colorScheme="green">New</Badge>
                    </HStack>
                  ))}
                </VStack>
              </Collapse>
            )}
          </Box>
        ))}
      </VStack>

      <Divider my={4} />

      {/* Tombol Logout */}
      <Button
        variant="ghost"
        colorScheme="red"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiLogOut} />}
      >
        Logout
      </Button>
    </Box>
  );
}
