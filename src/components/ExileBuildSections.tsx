import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import { Accordion, Box, Button, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import type { ExileBuild, ExileItem } from '../api/exile-types';
import styles from './ExileBuildSections.module.css';

type SectionProps = {
  availability: string;
  children: ReactNode;
  empty: boolean;
  initiallyOpen?: boolean;
  title: string;
};

const BuildSection = ({ availability, children, empty, initiallyOpen = false, title }: SectionProps) => {
  const contentId = useId();
  const mobile = useMediaQuery('(max-width: 61.99em)');
  const [opened, setOpened] = useState(initiallyOpen);

  return (
    <Box aria-label={title} className={styles.section} component="section">
      {mobile ? (
        <Button
          aria-controls={contentId}
          aria-expanded={opened}
          className={styles.sectionButton}
          fullWidth
          justify="space-between"
          onClick={() => setOpened(!opened)}
          rightSection={opened ? <IconChevronDown aria-hidden="true" /> : <IconChevronRight aria-hidden="true" />}
          variant="transparent"
        >
          {title}
        </Button>
      ) : (
        <Title order={2}>{title}</Title>
      )}
      {(!mobile || opened) && (
        <Stack gap="md" id={contentId} mt="md">
          {availability === 'partial' && (
            <Text c="dimmed">{'Some data was unavailable during this collection. Only recorded data is shown.'}</Text>
          )}
          {availability === 'unavailable' ? (
            <Text c="dimmed">{'Unavailable for this collection.'}</Text>
          ) : empty && availability === 'available' ? (
            <Text c="dimmed">{'None recorded for this collection.'}</Text>
          ) : (
            !empty && children
          )}
        </Stack>
      )}
    </Box>
  );
};

const ItemDetails = ({ item }: { item: ExileItem }) => {
  return (
    <Stack gap="xs">
      <Text>{`${item.baseType} · Item level ${item.ilvl} · ${item.identified ? 'Identified' : 'Unidentified'}`}</Text>
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

const gemMetadata = (gem: { level: number | null; quality: number | null }) => {
  return `Level ${gem.level ?? 'unavailable'} · Quality ${gem.quality === null ? 'unavailable' : `${gem.quality}%`}`;
};

export const ExileBuildSections = ({ build }: { build: ExileBuild }) => {
  return (
    <Stack gap="lg">
      <BuildSection
        availability={build.equipment.availability}
        empty={!build.equipment.entries.length}
        initiallyOpen
        title="Equipped items"
      >
        <Text c="dimmed" size="sm">
          {'Expand any item to see its recorded details.'}
        </Text>
        <Accordion multiple variant="default">
          {build.equipment.entries.map((item, index) => (
            <Accordion.Item key={`${item.id ?? item.inventoryId}-${index}`} value={`item-${index}`}>
              <Accordion.Control>
                <SimpleGrid cols={2}>
                  <Text c="dimmed" size="sm">
                    {item.inventoryId ?? 'Equipment'}
                  </Text>
                  <Text size="sm">{item.name || item.typeLine}</Text>
                </SimpleGrid>
              </Accordion.Control>
              <Accordion.Panel>
                <ItemDetails item={item} />
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </BuildSection>
      <BuildSection
        availability={build.skills.availability}
        empty={!build.skills.entries.length}
        title="Skills & linked supports"
      >
        <Text c="dimmed" size="sm">
          {'Supports stay with their linked skill group.'}
        </Text>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {build.skills.entries.map((group) => (
            <Stack gap="xs" key={group.id}>
              {group.skills.map((skill, index) => (
                <Box key={`${skill.name}-${index}`}>
                  <Text className={styles.skill} fw={600}>
                    {skill.name}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {gemMetadata(skill)}
                  </Text>
                </Box>
              ))}
              {group.supports.map((support, index) => (
                <Text key={`${support.name}-${index}`} pl="md" size="sm">
                  {support.name}
                  {build.game === 'poe' && 'level' in support ? ` · ${gemMetadata(support)}` : ''}
                </Text>
              ))}
              {!group.supports.length && (
                <Text c="dimmed" size="sm">
                  {'No linked supports recorded.'}
                </Text>
              )}
            </Stack>
          ))}
        </SimpleGrid>
      </BuildSection>
      {build.character.ascendancy.status !== 'none' && (
        <BuildSection
          availability={build.ascendancySkills.availability}
          empty={!build.ascendancySkills.entries.length}
          title="Ascendancy skills"
        >
          <Text c="dimmed" size="sm">
            {build.character.ascendancy.name ?? 'Ascendancy unavailable'}
          </Text>
          {build.ascendancySkills.entries.map((passive) => (
            <Box key={passive.id}>
              <Text>{passive.name ?? `Allocation ${passive.id}`}</Text>
              {passive.definitionStatus === 'unavailable' && <Text c="dimmed">{'Definition unavailable'}</Text>}
              {passive.stats.map((stat, index) => (
                <Text key={index} size="sm">
                  {stat}
                </Text>
              ))}
            </Box>
          ))}
        </BuildSection>
      )}
      <BuildSection
        availability={build.passiveSkills.availability}
        empty={!build.passiveSkills.entries.length}
        title="Passive skills"
      >
        <Text c="dimmed" size="sm">
          {'Allocated points · List view'}
        </Text>
        {build.passiveSkills.entries.map((passive) => (
          <Box key={passive.id}>
            <Text>{passive.name ?? `Allocation ${passive.id}`}</Text>
            {passive.definitionStatus === 'unavailable' && <Text c="dimmed">{'Definition unavailable'}</Text>}
            {passive.stats.map((stat, index) => (
              <Text key={index} size="sm">
                {stat}
              </Text>
            ))}
            {passive.setIds.length > 0 && (
              <Text c="dimmed" size="sm">{`Allocation sets: ${passive.setIds.join(', ')}`}</Text>
            )}
            {passive.selectedEffectId && (
              <Text c="dimmed" size="sm">{`Selected effect: ${passive.selectedEffectId}`}</Text>
            )}
          </Box>
        ))}
      </BuildSection>
    </Stack>
  );
};
