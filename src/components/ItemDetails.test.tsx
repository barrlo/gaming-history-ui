import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { ItemDetails } from './ItemDetails';
import type { ExileItem } from '../api/exile-types';

describe('ItemDetails', () => {
  it('should display recorded item properties, requirements, mods, sockets and socketed items', () => {
    const item: ExileItem = {
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
    };
    renderWithProviders(<ItemDetails item={item} />);

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
  });

  it('should handle omitted details and unnamed socketed items', () => {
    const item: ExileItem = {
      baseType: 'Shield',
      frameTypeId: 'normal',
      identified: false,
      ilvl: 12,
      name: '',
      socketedItems: [
        { baseType: 'Gem', frameTypeId: 'gem', identified: true, ilvl: 1, name: '', typeLine: 'Support gem' },
      ],
      sockets: [{ group: 0 }],
      typeLine: 'Shield',
    };
    renderWithProviders(<ItemDetails item={item} />);

    expect(screen.getByText('Shield · Item level 12')).toBeInTheDocument();
    expect(screen.queryByText(/identified/i)).not.toBeInTheDocument();
    expect(screen.getByText('Socket 1 · Group 0')).toBeInTheDocument();
    expect(screen.getByText('Support gem')).toBeInTheDocument();
  });
});
