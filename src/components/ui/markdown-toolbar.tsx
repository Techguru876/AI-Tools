'use client'

import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Bold,
    Italic,
    Heading2,
    Heading3,
    Link,
    Quote,
    Code,
    List,
    ListOrdered,
    Image
} from 'lucide-react'

interface MarkdownToolbarProps {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
    value: string
    onChange: (value: string) => void
}

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
    // Store the last known selection to prevent losing it when clicking toolbar buttons
    const lastSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        const updateSelection = () => {
            lastSelectionRef.current = {
                start: textarea.selectionStart,
                end: textarea.selectionEnd
            }
        }

        // Track selection changes via multiple events
        textarea.addEventListener('select', updateSelection)
        textarea.addEventListener('keyup', updateSelection)
        textarea.addEventListener('mouseup', updateSelection)
        textarea.addEventListener('focus', updateSelection)

        return () => {
            textarea.removeEventListener('select', updateSelection)
            textarea.removeEventListener('keyup', updateSelection)
            textarea.removeEventListener('mouseup', updateSelection)
            textarea.removeEventListener('focus', updateSelection)
        }
    }, [textareaRef])

    const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        // Use stored selection as it's more reliable than reading at click time
        const start = lastSelectionRef.current.start
        const end = lastSelectionRef.current.end
        const selectedText = value.substring(start, end)

        const textToInsert = selectedText || placeholder
        const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end)

        onChange(newText)

        // Set cursor position after the operation
        setTimeout(() => {
            textarea.focus()
            const newCursorPos = start + before.length + textToInsert.length + after.length
            textarea.setSelectionRange(
                selectedText ? newCursorPos : start + before.length,
                selectedText ? newCursorPos : start + before.length + placeholder.length
            )
        }, 0)
    }

    const insertAtLineStart = (prefix: string) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart)

        onChange(newText)

        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + prefix.length, start + prefix.length)
        }, 0)
    }

    const tools = [
        {
            icon: Bold,
            title: 'Bold (Ctrl+B)',
            action: () => insertMarkdown('**', '**', 'bold text')
        },
        {
            icon: Italic,
            title: 'Italic (Ctrl+I)',
            action: () => insertMarkdown('*', '*', 'italic text')
        },
        { type: 'separator' as const },
        {
            icon: Heading2,
            title: 'Heading 2',
            action: () => insertAtLineStart('## ')
        },
        {
            icon: Heading3,
            title: 'Heading 3',
            action: () => insertAtLineStart('### ')
        },
        { type: 'separator' as const },
        {
            icon: Link,
            title: 'Link',
            action: () => insertMarkdown('[', '](https://)', 'link text')
        },
        {
            icon: Image,
            title: 'Image',
            action: () => insertMarkdown('![', '](https://)', 'alt text')
        },
        { type: 'separator' as const },
        {
            icon: Quote,
            title: 'Blockquote',
            action: () => insertAtLineStart('> ')
        },
        {
            icon: Code,
            title: 'Inline Code',
            action: () => insertMarkdown('`', '`', 'code')
        },
        { type: 'separator' as const },
        {
            icon: List,
            title: 'Bullet List',
            action: () => insertAtLineStart('- ')
        },
        {
            icon: ListOrdered,
            title: 'Numbered List',
            action: () => insertAtLineStart('1. ')
        },
    ]

    return (
        <div className="flex items-center gap-1 p-2 border rounded-t-lg bg-muted/30 border-b-0">
            {tools.map((tool, index) => {
                if (tool.type === 'separator') {
                    return <div key={index} className="w-px h-6 bg-border mx-1" />
                }
                const Icon = tool.icon!
                return (
                    <Button
                        key={index}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title={tool.title}
                        onMouseDown={(e) => {
                            e.preventDefault() // Prevent focus loss from textarea
                            tool.action!()
                        }}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                )
            })}
        </div>
    )
}
