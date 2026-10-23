import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/render';
import { ExileBuildSections } from './ExileBuildSections';
import { poeBuilds } from '../mocks/poe-builds';
import { poe2Builds } from '../mocks/poe2-builds';

describe('ExileBuildSections', () => {
  it('should preserve section order and expand equipment independently', async () => {
    const user = userEvent.setup();
    const build = structuredClone(poeBuilds.latest[0].build);
    build.equipment.entries = [
      {
        baseType: 'Wand',
        frameTypeId: 'rare',
        identified: true,
        ilvl: 80,
        inventoryId: 'Weapon',
        name: 'Ember branch',
        typeLine: 'Wand',
      },
      { baseType: 'Shield', frameTypeId: 'normal', identified: false, ilvl: 12, name: '', typeLine: 'Shield' },
    ];
    renderWithProviders(<ExileBuildSections build={build} />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    const weapon = screen.getByRole('button', { name: 'Weapon Ember branch' });
    const shield = screen.getByRole('button', { name: 'Equipment Shield' });

    expect(headings).toHaveLength(4);
    expect(headings[0]).toHaveTextContent('Equipped items');
    expect(headings[1]).toHaveTextContent('Skills & linked supports');
    expect(headings[2]).toHaveTextContent('Ascendancy skills');
    expect(headings[3]).toHaveTextContent('Passive skills');
    expect(weapon).toHaveAttribute('aria-expanded', 'false');
    expect(shield).toHaveAttribute('aria-expanded', 'false');

    await user.click(weapon);

    expect(weapon).toHaveAttribute('aria-expanded', 'true');
    expect(shield).toHaveAttribute('aria-expanded', 'false');

    await waitFor(() => expect(screen.getByText('Wand · Item level 80')).toBeVisible());

    expect(screen.getByText('Shield · Item level 12')).not.toBeVisible();

    await user.click(shield);

    await waitFor(() => expect(screen.getByText('Wand · Item level 80')).toBeVisible());
    await waitFor(() => expect(screen.getByText('Shield · Item level 12')).toBeVisible());

    expect(weapon).toHaveAttribute('aria-expanded', 'true');
    expect(shield).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Shield · Item level 12')).toBeInTheDocument();
  });

  it('should distinguish partial, unavailable and confirmed empty sections', () => {
    const build = structuredClone(poeBuilds.latest[0].build);
    build.equipment = { availability: 'partial', entries: [] };
    build.skills = { availability: 'available', entries: [] };
    build.passiveSkills = { availability: 'unavailable', entries: [] };
    build.ascendancySkills = { availability: 'unavailable', entries: [] };
    build.character.ascendancy = { name: null, status: 'unavailable' };
    renderWithProviders(<ExileBuildSections build={build} />);

    expect(
      within(screen.getByRole('region', { name: 'Equipped items' })).getByText(/Some data was unavailable/),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Skills & linked supports' })).getByText(
        'None recorded for this collection.',
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Passive skills' })).getByText('Unavailable for this collection.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Ascendancy skills' })).toBeInTheDocument();
  });

  it('should display zero quality as a valid PoE skill and support value', () => {
    const build = structuredClone(poeBuilds.latest[0].build);
    build.skills = {
      availability: 'available',
      entries: [
        {
          id: 'skills',
          skills: [{ level: 3, name: 'Fireball', quality: 0 }],
          supports: [{ level: 3, name: 'Support', quality: 0 }],
        },
      ],
    };
    renderWithProviders(<ExileBuildSections build={build} />);

    expect(screen.getByText('Level 3 · Quality 0%')).toBeInTheDocument();
    expect(screen.getByText('Support · Level 3 · Quality 0%')).toBeInTheDocument();
  });

  it('should distinguish unavailable applicable gem metadata from zero and empty supports', () => {
    const build = structuredClone(poeBuilds.latest[0].build);
    build.skills = {
      availability: 'available',
      entries: [
        {
          id: 'skills',
          skills: [{ level: null, name: 'Fireball', quality: null }],
          supports: [{ level: null, name: 'Support', quality: null }],
        },
        { id: 'solo', skills: [{ level: 2, name: 'Dash', quality: 20 }], supports: [] },
      ],
    };
    renderWithProviders(<ExileBuildSections build={build} />);

    expect(screen.getByText('Level unavailable · Quality unavailable')).toBeInTheDocument();
    expect(screen.getByText('Support · Level unavailable · Quality unavailable')).toBeInTheDocument();
    expect(screen.getByText('No linked supports recorded.')).toBeInTheDocument();
  });

  it('should display PoE2 skill metadata with name-only supports', () => {
    const build = structuredClone(poe2Builds.latest[0].build);
    build.skills = {
      availability: 'available',
      entries: [
        {
          id: 'skills',
          skills: [{ level: 18, name: 'Flame Wall', quality: 20 }],
          supports: [{ name: 'Arcane Tempo' }],
        },
      ],
    };
    renderWithProviders(<ExileBuildSections build={build} />);

    expect(screen.getByText('Arcane Tempo', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('Level 18 · Quality 20%')).toBeInTheDocument();
    expect(screen.queryByText(/Arcane Tempo.*(Level|Quality)/)).not.toBeInTheDocument();
  });

  it('should retain unresolved allocations and their set and mastery identifiers', () => {
    const build = structuredClone(poeBuilds.latest[0].build);
    build.ascendancySkills = {
      availability: 'partial',
      entries: [
        { definitionStatus: 'unavailable', id: 'asc-1', name: null, selectedEffectId: null, setIds: [], stats: [] },
      ],
    };
    build.character.ascendancy = { name: null, status: 'unavailable' };
    build.passiveSkills = {
      availability: 'partial',
      entries: [
        {
          definitionStatus: 'unavailable',
          id: 'tree-1',
          name: null,
          selectedEffectId: 'effect-2',
          setIds: ['set-1'],
          stats: ['Recorded effect'],
        },
        {
          definitionStatus: 'resolved',
          id: 'tree-2',
          name: 'Life',
          selectedEffectId: null,
          setIds: [],
          stats: ['+10 life'],
        },
      ],
    };
    renderWithProviders(<ExileBuildSections build={build} />);

    expect(screen.getByText('Allocation asc-1')).toBeInTheDocument();
    expect(screen.getByText('Ascendancy unavailable')).toBeInTheDocument();
    expect(screen.getByText('Allocation tree-1')).toBeInTheDocument();
    expect(screen.getByText('Allocation sets: set-1')).toBeInTheDocument();
    expect(screen.getByText('Selected effect: effect-2')).toBeInTheDocument();
    expect(screen.getByText('Recorded effect')).toBeInTheDocument();
    expect(screen.getByText('+10 life')).toBeInTheDocument();
  });
});
