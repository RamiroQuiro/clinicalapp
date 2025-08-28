
import React, { useState, useEffect, useRef } from 'react';

// Este es un componente contenedor para cargar ReactQuill solo en el cliente

const RichTextEditor = (props) => {
    const [Editor, setEditor] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            import('react-quill').then((mod) => {
                // También importamos el CSS aquí para que solo se cargue en el cliente
                import('react-quill/dist/quill.snow.css');
                setEditor(() => mod.default);
            });
        }
    }, []);

    if (!isMounted || !Editor) {
        // Muestra un placeholder o un spinner mientras carga el editor
        return <div style={{ height: '200px', border: '1px solid #ccc', borderRadius: '4px' }}>Cargando editor...</div>;
    }

    return <Editor {...props} />;
};

export default RichTextEditor;
