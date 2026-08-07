import React, { useState } from 'react';
import './WeeklyBox.css';

// ---- Static data, modeled after the three box options shown in the product ----

const DIET_ICONS = ['vegan', 'vegetarian', 'gluten-free', 'lactose-free', 'sugar-free'];

const BOX_OPTIONS = [
  {
    id: 'international',
    name: 'International',
    tagline: 'A box tailored to your protocol with international, non-French brands.',
    footprint: '640 g CO2e',
    products: [
      {
        name: 'Eco-Refill Gel (dose)',
        brand: 'Mulebar',
        origin: 'GB',
        amount: '30 g',
        phase: 'DURING',
        storage: ['Freeze', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free'],
      },
      {
        name: 'Organic Energy Bar',
        brand: 'Mulebar',
        origin: 'GB',
        amount: '55 g',
        phase: 'PRE',
        storage: ['Rod', 'Room temperature'],
        timing: 'Before the effort',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'DUO ISO',
        brand: 'Mulebar',
        origin: 'GB',
        phase: 'DURING',
        storage: ['Beverage', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'Gel 100',
        brand: 'Maurten',
        origin: 'SE',
        amount: '30 g',
        phase: 'DURING',
        storage: ['Freeze', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian'],
      },
      {
        name: 'High Sodium Hydration',
        brand: 'Skratch Labs',
        origin: 'US',
        phase: 'DURING',
        storage: ['Beverage', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian'],
      },
    ],
  },
  {
    id: 'best-value',
    name: 'Best Value',
    tagline: 'A box tailored to your protocol, optimized for the best value.',
    footprint: '710 g CO2e',
    featured: true,
    products: [
      {
        name: 'Boost Gel (per dose)',
        brand: 'Authentic Nutrition',
        origin: 'FR',
        amount: '30 g',
        phase: 'DURING',
        storage: ['Freeze', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'Ultra Bar',
        brand: 'Overstim.s',
        origin: 'FR',
        amount: '55 g',
        phase: 'DURING',
        storage: ['Rod', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'Organic Olive-Lemon-Thyme Bar',
        brand: 'Baouw',
        origin: 'FR',
        amount: '55 g',
        phase: 'DURING',
        storage: ['Rod', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'Boost Gel',
        brand: 'Fenioux',
        origin: 'FR',
        amount: '30 g',
        phase: 'DURING',
        storage: ['Freeze', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'Hydrate & Perform',
        brand: 'Isostar',
        origin: 'FR',
        phase: 'DURING',
        storage: ['Beverage', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
    ],
  },
  {
    id: 'french-brands',
    name: 'French Brands',
    tagline: 'A box tailored to your protocol, focused on brands of French origin.',
    footprint: '290 g CO2e',
    products: [
      {
        name: 'Spirulina',
        brand: 'Fenioux',
        origin: 'FR',
        phase: 'PRE',
        storage: ['Freeze', 'Room temperature'],
        timing: 'Before the effort',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'Endurance (daily tablet)',
        brand: 'Isoxan Sport',
        origin: 'FR',
        phase: 'PRE',
        storage: ['Freeze', 'Room temperature'],
        timing: 'Before the effort',
        diet: ['vegan', 'vegetarian', 'gluten-free'],
      },
      {
        name: 'Magnesium Night Caps',
        brand: 'STC Nutrition',
        origin: 'FR',
        amount: '60 capsules',
        phase: 'RECOVERY',
        storage: ['Protein', 'Room temperature'],
        timing: 'After the effort',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'Boost Gel',
        brand: 'Fenioux',
        origin: 'FR',
        amount: '30 g',
        phase: 'DURING',
        storage: ['Freeze', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        name: 'Fruit Pastes',
        brand: "Overstim.s",
        origin: 'FR',
        amount: '40 g',
        phase: 'DURING',
        storage: ['Beverage', 'Room temperature'],
        timing: 'During exertion',
        diet: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
    ],
  },
];

// ---- Small presentational pieces ----

function DietIcons({ diet = [] }) {
  return (
    <span className="diet-icons" aria-label="Dietary compatibility">
      {DIET_ICONS.map((tag) => (
        <span
          key={tag}
          className={`diet-icon ${diet.includes(tag) ? 'is-active' : 'is-inactive'}`}
          title={tag.replace('-', ' ')}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              d="M12 21s-7.5-4.7-10-9.3C.4 8 2 3.8 6 3.3c2.3-.3 4.2 1 6 3 1.8-2 3.7-3.3 6-3 4 .5 5.6 4.7 4 8.4-2.5 4.6-10 9.3-10 9.3z"
              fill="currentColor"
            />
          </svg>
        </span>
      ))}
    </span>
  );
}

function ProductCard({ product }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="product-card">
      <header className="product-card__head">
        <h3 className="product-card__name">
          {product.name}
          {product.brand && (
            <span className="product-card__brand">
              {product.brand} <span className="product-card__origin">{product.origin}</span>
            </span>
          )}
        </h3>
        <DietIcons diet={product.diet} />
      </header>

      <div className="product-card__tags">
        {product.amount && <span className="tag tag--muted">{product.amount}</span>}
        <span className={`tag tag--phase tag--${product.phase.toLowerCase()}`}>
          {product.phase}
        </span>
        {product.storage.map((s) => (
          <span className="tag tag--muted" key={s}>
            {s}
          </span>
        ))}
      </div>

      <p className="product-card__timing">{product.timing}</p>

      <button
        type="button"
        className="product-card__disclosure"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Discover the science of the product
        <svg
          className={`chevron ${open ? 'chevron--open' : ''}`}
          viewBox="0 0 20 20"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <p className="product-card__science">
          Formulated to support {product.timing.toLowerCase()}, matched to your current
          training load and sodium/carbohydrate targets.
        </p>
      )}
    </article>
  );
}

function BoxColumn({ box, isChosen, onChoose, onModify, onConfirm }) {
  return (
    <section
      className={`box-column ${isChosen ? 'box-column--chosen' : ''}`}
      aria-current={isChosen ? 'true' : undefined}
    >
      {isChosen && <div className="box-column__badge">Selected</div>}

      <header className="box-column__head">
        <h2>{box.name}</h2>
        <p>{box.tagline}</p>
      </header>

      <div className="box-column__products">
        {box.products.map((product) => (
          <ProductCard key={product.name + product.brand} product={product} />
        ))}
      </div>

      <footer className="box-column__footer">
        <div className="footprint">carbon footprint: {box.footprint}</div>

        {isChosen ? (
          <>
            <button type="button" className="btn btn--ghost" onClick={() => onModify(box.id)}>
              Modify my assortment
            </button>
            <button type="button" className="btn btn--primary" onClick={() => onConfirm(box.id)}>
              Confirm box
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--outline-primary" onClick={() => onChoose(box.id)}>
            Choose
          </button>
        )}
      </footer>
    </section>
  );
}

// ---- Page ----

export default function WeeklyBox() {
  const [chosenId, setChosenId] = useState('best-value');
  const [showOverkillNotice, setShowOverkillNotice] = useState(true);

  const handleChoose = (id) => setChosenId(id);
  const handleModify = (id) => setChosenId(id);
  const handleConfirm = (id) => setChosenId(id);

  return (
    <div className="weekly-box">
      <div className="weekly-box__container">
        <a className="back-link" href="#protocol">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path d="M12 4l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to the protocol
        </a>

        <div className="eyebrow">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <rect x="3" y="7" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M3 7l7-4 7 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          Box of the week
        </div>

        <h1 className="page-title">Discover your FuelNode box</h1>
        <p className="page-subtitle">
          Three options designed for your profile, your protocol and your preferences. Choose the
          one that suits you best this week.
        </p>

        {showOverkillNotice && (
          <div className="notice notice--overkill">
            <div className="notice__icon" aria-hidden="true">✦</div>
            <div className="notice__body">
              <h2>This box is a bit overkill for your current load.</h2>
              <p>
                Based on your answers, your training volume is still light. The weekly box of 8
                products was designed for busier weeks: it will therefore provide you with more
                nutrition than your current workouts actually consume.
              </p>
              <p>
                We are offering it to you anyway, in complete transparency: it&rsquo;s an
                opportunity to discover the products, to test what suits you and to get a head
                start on the day you ramp up production.
              </p>
              <p className="notice__tip">
                Tip: If you increase your training volume in your profile, your box will
                automatically adjust to your needs.
              </p>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setShowOverkillNotice(false)}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        <div className="notice notice--waitlist">
          <span className="notice__icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="16" height="16">
              <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 6v4l3 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          FuelNode boxes are arriving soon. Join the waiting list to be notified as soon as the
          first deliveries open.
        </div>

        <div className="box-columns">
          {BOX_OPTIONS.map((box) => (
            <BoxColumn
              key={box.id}
              box={box}
              isChosen={chosenId === box.id}
              onChoose={handleChoose}
              onModify={handleModify}
              onConfirm={handleConfirm}
            />
          ))}
        </div>
      </div>
    </div>
  );
}