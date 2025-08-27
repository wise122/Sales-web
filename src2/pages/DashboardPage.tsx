import { SimpleGrid, Box, Text, Progress, Flex } from "@chakra-ui/react";

const cards = [
  { title: "Omzet", value: "Rp 0", color: "green.400" },
  { title: "Nota", value: "0", color: "blue.400" },
  { title: "Qty Terjual", value: "0", color: "orange.400" },
  { title: "Rata-rata Transaksi", value: "Rp 0", color: "red.400" },
];

export default function Dashboard() {
  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb="4">
        Dashboard
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="4">
        {cards.map((card) => (
          <Box key={card.title} p="4" bg="white" borderRadius="md" shadow="sm">
            <Text fontSize="sm">{card.title}</Text>
            <Flex align="center" justify="space-between" mt="2">
              <Text fontSize="xl" fontWeight="bold">
                {card.value}
              </Text>
            </Flex>
            <Progress mt="2" colorScheme={card.color.split(".")[0]} value={50} />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
