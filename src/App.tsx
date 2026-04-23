import {
  EssentialHeader,
  CollectionHeader,
  FashionHeader,
  LuxeVaultHeader,
  ImpulseHeader,
  CardMarketHeader,
} from './headers'
import type { MenuItem } from './headers'

const menuItems: MenuItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    children: [
      { label: 'Category A', href: '/a' },
      { label: 'Category B', href: '/b' },
      { label: 'Category C', href: '/c' },
    ],
  },
  { label: 'About', href: '/about' },
]

const nestedMenuItems: MenuItem[] = [
  {
    label: 'Collections',
    children: [
      {
        label: 'Spring 2026',
        children: [
          { label: 'Dresses', href: '/spring/dresses' },
          { label: 'Jackets', href: '/spring/jackets' },
        ],
      },
      {
        label: 'Summer 2026',
        children: [
          { label: 'Swimwear', href: '/summer/swimwear' },
          { label: 'Accessories', href: '/summer/accessories' },
        ],
      },
    ],
  },
  { label: 'Designers', href: '/designers' },
  { label: 'Editorial', href: '/editorial' },
]

const luxuryMenuItems: MenuItem[] = [
  { label: 'BAGS', href: '/bags' },
  { label: 'JEWELRY', href: '/jewelry' },
  { label: 'WATCHES', href: '/watches' },
]

const gameMenuItems: MenuItem[] = [
  { label: 'PTCG', href: '/ptcg' },
  { label: 'MTG', href: '/mtg' },
  { label: 'YGO', href: '/ygo' },
]

function App() {
  return (
    <div className="space-y-0">
      {/* Section 1: Essential */}
      <section className="border-b border-gray-200">
        <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Essential — Functional / Zero Decoration
        </div>
        <EssentialHeader
          logo={<span className="text-base font-normal">Essential</span>}
          menuItems={menuItems}
          headerBg="#ffffff"
          headerText="#1f2937"
          onSearch={(q: string) => console.log('search:', q)}
          cartCount={2}
        />
      </section>

      {/* Section 2: Collection */}
      <section className="border-b border-gray-200">
        <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Collection — Editorial / Curatorial
        </div>
        <CollectionHeader
          logo={<span className="italic">Collection</span>}
          menuItems={nestedMenuItems}
          headerBg="#ffffff"
          headerText="#1a1a1a"
          onSearch={(q: string) => console.log('search:', q)}
          cartCount={1}
        />
      </section>

      {/* Section 3: Fashion */}
      <section className="border-b border-gray-200">
        <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Fashion — Bold / Neon / Energetic
        </div>
        <FashionHeader
          logo={<span>FASHION</span>}
          menuItems={menuItems}
          headerBg="#0a0a0a"
          headerText="#ffffff"
          onSearch={(q: string) => console.log('search:', q)}
          cartCount={5}
        />
      </section>

      {/* Section 4: Luxe Vault */}
      <section className="border-b border-gray-200">
        <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Luxe Vault — Dark / Gold / Refined
        </div>
        <LuxeVaultHeader
          logo={<span>LUXE</span>}
          menuItems={luxuryMenuItems}
          headerBg="#0a0a0a"
          headerText="#f5f3ef"
          onSearch={(q: string) => console.log('search:', q)}
          cartCount={1}
        />
      </section>

      {/* Section 5: Impulse */}
      <section className="border-b border-gray-200">
        <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Impulse — Urgent / Promo / High Energy
        </div>
        <ImpulseHeader
          logo={<span>FLASH</span>}
          menuItems={menuItems}
          headerBg="#ffffff"
          headerText="#1f2937"
          onSearch={(q: string) => console.log('search:', q)}
          cartCount={3}
        />
      </section>

      {/* Section 6: Card Market */}
      <section className="border-b border-gray-200">
        <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Card Market — Gaming / Rarity / Community
        </div>
        <CardMarketHeader
          logo={<span className="font-bold tracking-tight">TCG</span>}
          menuItems={gameMenuItems}
          headerBg="#1a1a2e"
          headerText="#e2e8f0"
          onSearch={(q: string) => console.log('search:', q)}
          cartCount={7}
          userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
        />
      </section>
    </div>
  )
}

export default App
