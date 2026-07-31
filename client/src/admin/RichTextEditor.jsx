import { useRef, useState, useCallback } from "react";
import { Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Link2, Quote, Image, Eraser } from "lucide-react";
import api from "../api/client";

const EXEC = [
  { key: "bold", label: "Bold", Icon: Bold, cmd: "bold" },
  { key: "italic", label: "Italic", Icon: Italic, cmd: "italic" },
  { key: "underline", label: "Underline", Icon: Underline, cmd: "underline" },
  { key: "h2", label: "Heading 2", Icon: Heading2, cmd: "formatBlock", val: "h2" },
  { key: "h3", label: "Heading 3", Icon: Heading3, cmd: "formatBlock", val: "h3" },
  { key: "ul", label: "Bullet list", Icon: List, cmd: "insertUnorderedList" },
  { key: "ol", label: "Numbered list", Icon: ListOrdered, cmd: "insertOrderedList" },
  { key: "quote", label: "Quote", Icon: Quote, cmd: "formatBlock", val: "blockquote" },
];

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    emitChange();
  }, []);

  const emitChange = useCallback(() => {
    onChange(editorRef.current?.innerHTML || "");
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = window.prompt("Enter link URL (https://…)");
    if (url) exec("createLink", url);
  }, [exec]);

  const insertImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/admin/upload", form);
      exec("insertImage", data.url);
    } catch {
      alert("Image upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-2">
        {EXEC.map(({ key, label, Icon, cmd, val }) => (
          <button key={key} type="button" title={label} aria-label={label}
            onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}
            className="rounded-lg p-2 text-charcoal/60 transition hover:bg-white hover:text-primary hover:shadow-sm">
            <Icon size={16} />
          </button>
        ))}
        <button type="button" title="Insert link" aria-label="Insert link"
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
          className="rounded-lg p-2 text-charcoal/60 transition hover:bg-white hover:text-primary hover:shadow-sm">
          <Link2 size={16} />
        </button>
        <button type="button" title="Insert image" aria-label="Insert image"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg p-2 text-charcoal/60 transition hover:bg-white hover:text-primary hover:shadow-sm">
          {busy ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" /> : <Image size={16} />}
        </button>
        <button type="button" title="Clear formatting" aria-label="Clear formatting"
          onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
          className="rounded-lg p-2 text-charcoal/60 transition hover:bg-white hover:text-primary hover:shadow-sm">
          <Eraser size={16} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={insertImage} />
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        className="rich-text min-h-[320px] max-h-[560px] overflow-y-auto px-5 py-4 outline-none"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
