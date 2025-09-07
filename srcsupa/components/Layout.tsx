// components/Layout.tsx
import React, { ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Flex minH="100vh">
      {/* Sidebar tetap di kiri */}
      <Sidebar />
      
      {/* Konten utama */}
      <Box flex="1" p="6" bg="gray.50">
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
