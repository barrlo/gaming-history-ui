import { Accordion, Box, SimpleGrid, Stack, Text } from '@mantine/core';
import { BuildSection } from './BuildSection';
import { ItemDetails } from './ItemDetails';
import type { ExileBuild } from '../api/exile-types';
import styles from './ExileBuildSections.module.css';

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
