import { useEffect, useRef, useState } from "react";

/**
 * A custom-styled single-select combobox - built from scratch rather than
 * a native <select> because a native select's open option list is
 * rendered by the OS/browser and can't be meaningfully styled (no
 * checkmarks, no hover states beyond the browser's own, no animation, no
 * control over spacing/radius). Behavior mirrors a native select closely
 * on purpose: value/onChange work exactly like a controlled <select>, so
 * swapping one in for the other never touches whatever owns the state.
 *
 * Keyboard model: focus stays on the trigger button the whole time
 * (never moves into the menu) - ArrowUp/Down move a highlighted index,
 * Enter/Space commits it, Escape closes. This avoids the extra
 * focus-management complexity of moving real DOM focus into a listbox
 * for what's a small, single-select list.
 */
export default function StyledSelect({ id, value, onChange, options, placeholder, icon, t }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const menuId = `${id}-listbox`;

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const openMenu = () => {
    const currentIndex = options.indexOf(value);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
    setOpen(true);
  };

  const commit = (option) => {
    onChange(option);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0) commit(options[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className="ob-styled-select" ref={containerRef}>
      <button
        type="button"
        id={id}
        className={"ob-styled-select__trigger" + (open ? " ob-styled-select__trigger--open" : "")}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-activedescendant={open && activeIndex >= 0 ? `${menuId}-option-${activeIndex}` : undefined}
      >
        {icon && (
          <span className="ob-styled-select__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span
          className={
            "ob-styled-select__value" + (!value ? " ob-styled-select__value--placeholder" : "")
          }
        >
          {value ? t(value) : t(placeholder || "— Choose —")}
        </span>
        <svg
          className={"ob-styled-select__chevron" + (open ? " ob-styled-select__chevron--open" : "")}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 5.25L7 9.25L11 5.25"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul id={menuId} className="ob-styled-select__menu" role="listbox" aria-labelledby={id}>
          {options.map((option, index) => {
            const isSelected = value === option;
            const isActive = index === activeIndex;
            return (
              <li
                key={option}
                id={`${menuId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                className={
                  "ob-styled-select__option" +
                  (isSelected ? " ob-styled-select__option--selected" : "") +
                  (isActive ? " ob-styled-select__option--active" : "")
                }
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(option)}
              >
                <span className="ob-styled-select__check" aria-hidden="true">
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6.2L4.5 8.7L10 3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="ob-styled-select__option-text">{t(option)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
