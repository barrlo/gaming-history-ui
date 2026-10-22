// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/render';
import { ExileBuildSections } from './ExileBuildSections';
import { poeBuilds } from '../mocks/poe-builds';
import { poe2Builds } from '../mocks/poe2-builds';

describe('ExileBuildSections', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('should expand equipment independently and render every recorded property', async () => {
    const user = userEvent.setup();
    const build = structuredClone(poeBuilds.latest[0].build);
    build.equipment.entries = [
      {
        baseType: 'Wand',
        corrupted: true,
        enchantMods: ['Enchant'],
        explicitMods: [{ description: 'Explicit' }],
        flavourText: ['Flavour'],
        frameTypeId: 'rare',
        identified: true,
        ilvl: 80,
        implicitMods: [{ description: 'Implicit' }],
        inventoryId: 'Weapon',
        name: 'Ember branch',
        properties: [{ name: 'Damage', suffix: ' fire', values: [['20', 0]] }],
        rarity: 'Rare',
        requirements: [{ name: 'Level', values: [['70', 0]] }],
        runeMods: ['Rune'],
        socketedItems: [
          { baseType: 'Gem', frameTypeId: 'gem', identified: true, ilvl: 1, name: 'Socketed gem', typeLine: 'Gem' },
        ],
        sockets: [{ group: 1, sColour: 'R', type: 'gem' }],
        typeLine: 'Wand',
      },
      {
        baseType: 'Shield',
        frameTypeId: 'normal',
        identified: false,
        ilvl: 12,
        name: '',
        sockets: [{ group: 0 }],
        typeLine: 'Shield',
      },
    ];
    renderWithProviders(<ExileBuildSections build={build} />);
    const weapon = screen.getByRole('button', { name: 'Weapon Ember branch' });
    const shield = screen.getByRole('button', { name: 'Equipment Shield' });

    expect(weapon).toHaveAttribute('aria-expanded', 'false');
    expect(shield).toHaveAttribute('aria-expanded', 'false');

    await user.click(weapon);
    await user.click(shield);

    expect(weapon).toHaveAttribute('aria-expanded', 'true');
    expect(shield).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Damage: 20 fire')).toBeInTheDocument();
    expect(screen.getByText('Level: 70')).toBeInTheDocument();
    expect(screen.getByText('Corrupted')).toBeInTheDocument();
    expect(screen.getByText('Rare')).toBeInTheDocument();
    expect(screen.getByText('Implicit')).toBeInTheDocument();
    expect(screen.getByText('Explicit')).toBeInTheDocument();
    expect(screen.getByText('Enchant')).toBeInTheDocument();
    expect(screen.getByText('Rune')).toBeInTheDocument();
    expect(screen.getByText('Flavour')).toBeInTheDocument();
    expect(screen.getByText('Socketed gem')).toBeInTheDocument();
    expect(screen.getByText('Socket 1 · Group 1 · R · gem')).toBeInTheDocument();
    expect(screen.getByText('Shield · Item level 12 · Unidentified')).toBeInTheDocument();
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

  it('should show zero quality and unavailable applicable metadata without inventing PoE2 support metadata', () => {
    const build = structuredClone(poeBuilds.latest[0].build);
    build.skills = {
      availability: 'available',
      entries: [
        {
          id: 'skills',
          skills: [{ level: null, name: 'Fireball', quality: 0 }],
          supports: [{ level: 3, name: 'Support', quality: null }],
        },
        { id: 'solo', skills: [{ level: 2, name: 'Dash', quality: null }], supports: [] },
      ],
    };
    const { rerender } = renderWithProviders(<ExileBuildSections build={build} />);

    expect(screen.getByText('Level unavailable · Quality 0%')).toBeInTheDocument();
    expect(screen.getByText('Support · Level 3 · Quality unavailable')).toBeInTheDocument();
    expect(screen.getByText('No linked supports recorded.')).toBeInTheDocument();

    const second = structuredClone(poe2Builds.latest[0].build);
    second.skills = {
      availability: 'available',
      entries: [
        {
          id: 'skills',
          skills: [{ level: 18, name: 'Flame Wall', quality: 20 }],
          supports: [{ name: 'Arcane Tempo' }],
        },
      ],
    };
    rerender(<ExileBuildSections build={second} />);

    expect(screen.getByText('Arcane Tempo', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('Level 18 · Quality 20%')).toBeInTheDocument();
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

  it('should open only equipment initially on mobile and allow independent section toggles', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: true,
        media: '',
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      }),
    );
    renderWithProviders(<ExileBuildSections build={poeBuilds.latest[0].build} />);
    const equipment = screen.getByRole('button', { name: 'Equipped items' });
    const skills = screen.getByRole('button', { name: 'Skills & linked supports' });

    expect(equipment).toHaveAttribute('aria-expanded', 'true');
    expect(skills).toHaveAttribute('aria-expanded', 'false');

    await user.click(skills);

    expect(skills).toHaveAttribute('aria-expanded', 'true');
    expect(equipment).toHaveAttribute('aria-expanded', 'true');

    await user.click(equipment);

    expect(equipment).toHaveAttribute('aria-expanded', 'false');
    expect(skills).toHaveAttribute('aria-expanded', 'true');
  });
});
