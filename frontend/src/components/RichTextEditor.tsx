import React, { useState } from 'react';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link,
    Image,
    Code
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Escribe aquí...',
    minHeight = '300px'
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    const toolbarButtons = [
        { icon: Bold, command: 'bold', title: 'Negrita' },
        { icon: Italic, command: 'italic', title: 'Cursiva' },
        { icon: Underline, command: 'underline', title: 'Subrayado' },
        { icon: List, command: 'insertUnorderedList', title: 'Lista' },
        { icon: ListOrdered, command: 'insertOrderedList', title: 'Lista numerada' },
        { icon: AlignLeft, command: 'justifyLeft', title: 'Alinear izquierda' },
        { icon: AlignCenter, command: 'justifyCenter', title: 'Centrar' },
        { icon: AlignRight, command: 'justifyRight', title: 'Alinear derecha' },
    ];

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                {toolbarButtons.map((btn, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleFormat(btn.command)}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title={btn.title}
                    >
                        <btn.icon size={18} className="text-gray-700" />
                    </button>
                ))}

                <div className="w-px bg-gray-300 mx-1" />

                <button
                    type="button"
                    onClick={() => {
                        const url = prompt('URL del enlace:');
                        if (url) handleFormat('createLink', url);
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Insertar enlace"
                >
                    <Link size={18} className="text-gray-700" />
                </button>

                <button
                    type="button"
                    onClick={() => handleFormat('formatBlock', '<pre>')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Bloque de código"
                >
                    <Code size={18} className="text-gray-700" />
                </button>

                <div className="w-px bg-gray-300 mx-1" />

                {/* Heading dropdown */}
                <select
                    onChange={(e) => handleFormat('formatBlock', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    defaultValue=""
                >
                    <option value="">Normal</option>
                    <option value="<h1>">Título 1</option>
                    <option value="<h2>">Título 2</option>
                    <option value="<h3>">Título 3</option>
                    <option value="<h4>">Título 4</option>
                </select>
            </div>

            {/* Editor */}
            <div
                contentEditable
                onInput={handleContentChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                dangerouslySetInnerHTML={{ __html: value }}
                className={`p-4 outline-none ${isFocused ? 'ring-2 ring-primary-500' : ''}`}
                style={{ minHeight }}
                data-placeholder={placeholder}
            />

            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};
