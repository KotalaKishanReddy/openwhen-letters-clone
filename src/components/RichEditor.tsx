'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useCallback } from 'react'
import {
  Bold, Italic, UnderlineIcon, Strikethrough, AlignLeft,
  AlignCenter, AlignRight, Heading1, Heading2, List, ListOrdered,
  Quote, ImageIcon, Link2, Highlighter
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { content: string; onChange: (html: string) => void }

export default function RichEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false })
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'ProseMirror focus:outline-none' }
    }
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL')
    if (url && editor) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addLink = useCallback(() => {
    const url = window.prompt('URL')
    if (url && editor) editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  const TB = ({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode
  }) => (
    <button type="button" title={title} onClick={onClick}
      className={cn(
        'p-1.5 rounded hover:bg-beige transition text-brown-light hover:text-brown',
        active && 'bg-beige text-brown'
      )}>
      {children}
    </button>
  )

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-beige border-b border-brown/10">
        <TB title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={14}/></TB>
        <TB title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={14}/></TB>
        <TB title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><UnderlineIcon size={14}/></TB>
        <TB title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough size={14}/></TB>
        <div className="w-px h-4 bg-brown/15 mx-1"/>
        <TB title="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}><Heading1 size={14}/></TB>
        <TB title="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 size={14}/></TB>
        <div className="w-px h-4 bg-brown/15 mx-1"/>
        <TB title="Align left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft size={14}/></TB>
        <TB title="Align center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter size={14}/></TB>
        <TB title="Align right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight size={14}/></TB>
        <div className="w-px h-4 bg-brown/15 mx-1"/>
        <TB title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={14}/></TB>
        <TB title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={14}/></TB>
        <TB title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote size={14}/></TB>
        <div className="w-px h-4 bg-brown/15 mx-1"/>
        <TB title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}><Highlighter size={14}/></TB>
        <TB title="Add image" onClick={addImage}><ImageIcon size={14}/></TB>
        <TB title="Add link" onClick={addLink}><Link2 size={14}/></TB>
        <div className="w-px h-4 bg-brown/15 mx-1"/>
        <input type="color" title="Text color"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          className="w-6 h-6 rounded cursor-pointer border border-brown/15" />
      </div>
      <EditorContent editor={editor} className="min-h-[200px]"/>
    </div>
  )
}
