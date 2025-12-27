import { Check, MoreVertical, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Button from '../atomos/Button';

/**
 * @typedef MenuItem
 * @description Define la estructura de un único elemento dentro del menú desplegable.
 * @property {string} label - El texto que se mostrará para el item.
 * @property {ReactNode} [icon] - Un ícono opcional para mostrar a la izquierda del texto.
 * @property {() => void} [onClick] - Función que se ejecuta al hacer clic (para botones o checkboxes).
 * @property {string} [href] - URL a la que dirigir (para items que son enlaces).
 * @property {'button' | 'link' | 'checkbox'} [type] - El tipo de item, para manejar su comportamiento y renderizado.
 * @property {boolean} [isChecked] - Para items tipo 'checkbox', indica si está marcado o no.
 * @property {boolean} [isSeparator] - Si es true, renderiza una línea separadora en lugar de un item.
 * @property {string} [target] - Atributo target para los enlaces (ej: '_blank').
 * @property {string} [rel] - Atributo rel para los enlaces (ej: 'noopener noreferrer').
 * @property {string} [title] - Tooltip para el item.
 */
export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
  isSeparator?: boolean;
  type?: 'button' | 'link' | 'checkbox';
  isChecked?: boolean;
};

/**
 * @typedef MenuDropboxProps
 * @description Define las props que acepta el componente MenuDropbox.
 * @property {ReactNode} [triggerIcon] - Permite reemplazar el ícono por defecto (tres puntos) que abre el menú.
 * @property {string} [triggerTitle] - Tooltip que se muestra al pasar el mouse sobre el ícono que abre el menú.
 * @property {MenuItem[]} items - El array de objetos MenuItem que define el contenido del menú.
 * @property {string} [buttonClassName] - Clases CSS adicionales para el botón que abre el menú.
 * @property {boolean} [closeOnSelect=true] - Si es `false`, el menú no se cerrará al seleccionar un item (útil para checkboxes).
 * @property {ReactNode} [footer] - Un elemento React para mostrar en el pie del menú (ej: un botón de Guardar).
 */
type MenuDropboxProps = {
  triggerIcon?: ReactNode;
  triggerTitle?: string;
  items: MenuItem[];
  triggerIconClassName?: string;
  buttonClassName?: string;
  className?: string;
  closeOnSelect?: boolean; // Prop to control closing behavior
  footer?: ReactNode;
};

/**
 * Componente de menú desplegable reutilizable.
 * Puede renderizar botones, enlaces y checkboxes.
 */
export default function MenuDropbox({
  items,
  triggerIcon,
  triggerIconClassName,
  triggerTitle = 'Más acciones',
  buttonClassName = '',
  className,
  closeOnSelect = true, // Por defecto, el menú se cierra al seleccionar un item.
  footer,
}: MenuDropboxProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook de efecto para cerrar el menú si el usuario hace clic fuera de él.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Si el clic fue fuera del contenedor del menú (referenciado por dropdownRef)...
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // ...cierra el menú.
        setIsDropdownOpen(false);
      }
    }
    // Se añade el listener al documento.
    document.addEventListener('mousedown', handleClickOutside);
    // Función de limpieza: se remueve el listener cuando el componente se desmonta.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  /**
   * Maneja el clic en un item del menú.
   * @param {MenuItem} item - El objeto del item que fue clickeado.
   */
  const handleItemClick = (item: MenuItem) => {
    // Ejecuta la función onClick definida para el item, si existe.
    if (item.onClick) {
      item.onClick();
    }

    // Cierra el menú bajo ciertas condiciones.
    // Si `closeOnSelect` es true y el item NO es un checkbox, se cierra.
    if (closeOnSelect && item.type !== 'checkbox') {
      setIsDropdownOpen(false);
    } else if (item.href) {
      // Si es un enlace, siempre se cierra para navegar a la nueva página.
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón que abre y cierra el menú */}
      <Button
        variant="blanco"
        className={`rounded-l-none text-primary-textoTitle border-x ${buttonClassName}`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        title={triggerTitle}
      >
        {/* Usa el ícono pasado por props, o los tres puntos por defecto */}
        {triggerIcon || <MoreVertical className="w-5 h-5" />}
      </Button>

      {/* Contenido del menú, se muestra solo si isDropdownOpen es true */}
      {isDropdownOpen && (
        <div
          className={`absolute right-0 mt-2 z-20 rounded-md shadow-lg border ${className || 'w-60 bg-primary-150/85 backdrop-blur-sm border-primary-100 text-slate-200'}`}
        >
          <ul className="py-1 max-h-60 overflow-y-auto">
            {/* Itera sobre el array de items para renderizar cada uno */}
            {items.map((item, index) => {
              // --- 1. Renderiza un separador ---
              if (item.isSeparator) {
                return (
                  <li key={`separator-${index}`} className="border-b border-gray-200/20 my-1" />
                );
              }

              // --- 2. Renderiza un checkbox ---
              if (item.type === 'checkbox') {
                return (
                  <li
                    key={item.label}
                    title={item.title}
                    className="flex items-center px-4 py-2 hover:bg-black/10 cursor-pointer select-none"
                    onClick={() => handleItemClick(item)}
                  >
                    {item.isChecked ? (
                      <Check className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 bg-white p-0.5 focus:ring-blue-500 pointer-events-none" />
                    ) : (
                      <X className="mr-3 h-4 w-4 rounded border-gray-300 text-red-600 bg-white p-0.5 focus:ring-red-500 pointer-events-none" />
                    )}
                    <input
                      type="checkbox"
                      hidden
                      checked={item.isChecked}
                      readOnly // El input es de solo lectura, el clic se maneja en el `li` para mayor área de pulsación.
                      className="mr-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                    />
                    <span className="flex-grow">{item.label}</span>
                  </li>
                );
              }

              // Contenido base para enlaces y botones (ícono + label)
              const content = (
                <div className="flex items-center w-full">
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </div>
              );

              // --- 3. Renderiza un enlace (<a>) ---
              if (item.href) {
                return (
                  <li
                    key={item.label}
                    title={item.title}
                    className="flex items-center px-4 py-2 hover:bg-black/10 cursor-pointer"
                  >
                    <a
                      href={item.href}
                      target={item.target}
                      rel={item.rel}
                      className="inline-flex items-center w-full"
                      onClick={() => handleItemClick(item)}
                    >
                      {content}
                    </a>
                  </li>
                );
              }

              // --- 4. Renderiza un botón (<li> con onClick) por defecto ---
              return (
                <li
                  key={item.label}
                  title={item.title}
                  className="flex items-center px-4 py-2 hover:bg-black/10 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  {content}
                </li>
              );
            })}
          </ul>
          {/* Renderiza el pie de página si se proporciona */}
          {footer && <div className="border-t border-slate-600 p-2">{footer}</div>}
        </div>
      )}
    </div>
  );
}
