import { useState } from "react";
import "./ProtocolComponents.css";

function ScienceCard({ card }) {
  const [expanded, setExpanded] = useState(false);

  if (!card) return null;
  const { product_name, layer_0, layer_1, layer_2 } = card;

  return (
    <div className="card science-card">
      <h3 className="science-card__title">{product_name || "Product"}</h3>
      {layer_0 && <p className="science-card__headline">{layer_0}</p>}

      {expanded && (
        <div className="science-card__expanded">
          {layer_1 && <p className="science-card__layer">{layer_1}</p>}
          {layer_2 && <p className="science-card__layer science-card__layer--deep">{layer_2}</p>}
        </div>
      )}

      {(layer_1 || layer_2) && (
        <button
          type="button"
          className="science-card__toggle"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Learn more"}
        </button>
      )}
    </div>
  );
}

export default function ScienceCards({ cards }) {
  if (!cards || cards.length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">The Science</h2>
        <p className="protocol-empty">No science cards available.</p>
      </section>
    );
  }

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">The Science</h2>
      <div className="card-grid card-grid--science">
        {cards.map((card, index) => (
          <ScienceCard card={card} key={card?.product_name || index} />
        ))}
      </div>
    </section>
  );
}
