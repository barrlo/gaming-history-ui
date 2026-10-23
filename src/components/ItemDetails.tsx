import { Box, Stack, Text } from '@mantine/core';
import type { ExileItem } from '../api/exile-types';

export const ItemDetails = ({ item }: { item: ExileItem }) => {
  return (
    <Stack gap="xs">
      <Text>{`${item.baseType} · Item level ${item.ilvl}`}</Text>
      {item.rarity && <Text>{item.rarity}</Text>}
      {item.corrupted && <Text>{'Corrupted'}</Text>}
      {[...(item.properties ?? []), ...(item.requirements ?? [])].map((property, index) => {
        const values = property.values.map(([value]) => value).join(', ');
        const description = `${property.name}: ${values}${property.suffix ?? ''}`;

        return <Text key={`${property.name}-${index}`}>{description}</Text>;
      })}
      {[...(item.implicitMods ?? []), ...(item.explicitMods ?? [])].map((modifier, index) => (
        <Text key={`mod-${index}`}>{modifier.description}</Text>
      ))}
      {[...(item.enchantMods ?? []), ...(item.runeMods ?? []), ...(item.flavourText ?? [])].map((line, index) => (
        <Text key={`line-${index}`}>{line}</Text>
      ))}
      {item.sockets?.map((socket, index) => {
        const colour = socket.sColour ? ` · ${socket.sColour}` : '';
        const type = socket.type ? ` · ${socket.type}` : '';
        const description = `Socket ${index + 1} · Group ${socket.group}${colour}${type}`;

        return <Text key={`socket-${index}`}>{description}</Text>;
      })}
      {item.socketedItems?.map((socketed, index) => (
        <Box key={`socketed-${index}`}>
          <Text fw={600}>{socketed.name || socketed.typeLine}</Text>
          <ItemDetails item={socketed} />
        </Box>
      ))}
    </Stack>
  );
};
