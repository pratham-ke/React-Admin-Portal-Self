import React, { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    // Inject Jodit CSS from CDN to avoid bundler import issues.
    const cssId = 'jodit-cdn-css';
    let linkEl: HTMLLinkElement | null = document.getElementById(cssId) as HTMLLinkElement | null;
    let injected = false;
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = cssId;
      linkEl.rel = 'stylesheet';
      // Use an official CDN path compatible with the installed version; adjust if mismatched.
      linkEl.href = 'https://cdn.jsdelivr.net/npm/jodit@3.23.2/build/jodit.min.css';
      document.head.appendChild(linkEl);
      injected = true;
    }
    if (!textareaRef.current) return;
    const config = {
      readonly: false,
      height: 300,
      placeholder: placeholder || "",
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      toolbarSticky: false,
      toolbarAdaptive: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "eraser",
        "selectall",
        "|",
        "ul",
        "ol",
        "outdent",
        "indent",
        "|",
        "link",
        "image",
        "table",
        "|",
        "align",
        "font",
        "fontsize",
        "brush",
        "|",
        "source",
        "fullsize",
        "preview",
      ],
    } as any;

    // dynamically import Jodit at runtime to avoid bundler export-shape issues
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('jodit');
        const possible = (mod as any) ?? {};
        const JoditCtor = possible.default ?? possible.Jodit ?? possible;
        if (!JoditCtor) {
          console.error('RichTextEditor: could not find Jodit constructor on imported module', mod);
          return;
        }
        if (cancelled) return;
        const el = textareaRef.current;
        if (!el) {
          // Textarea not mounted - abort initialization. This can happen during strict-mode double-invoke or fast unmounts.
          console.warn('RichTextEditor: textarea ref is null, skipping editor initialization');
          return;
        }
        // construct editor using the actual element
        try {
          editorRef.current = new JoditCtor(el, config);
        } catch (ctorErr) {
          console.error('RichTextEditor: Jodit constructor threw', ctorErr);
          return;
        }

        // set initial value if editor created
        try {
          if (editorRef.current) editorRef.current.value = value ?? "";
        } catch (valErr) {
          console.warn('RichTextEditor: failed to set initial value', valErr);
        }

        const onChangeHandler = () => {
          const html = editorRef.current?.value as string;
          onChange(html);
        };

        if (editorRef.current?.events?.on) {
          editorRef.current.events.on("change", onChangeHandler);
        }
      } catch (err) {
        console.error('RichTextEditor: failed to dynamically import jodit', err);
      }
    })();
    // Note: all editor setup (value and events) happens inside the dynamic import block above.

    return () => {
      cancelled = true;
      try {
        if (editorRef.current) {
          editorRef.current.events?.off && editorRef.current.events.off("change");
          editorRef.current.destruct && editorRef.current.destruct();
          editorRef.current = null;
        }
      } catch (e) {
        // ignore
      }
      // remove injected css if we added it
      try {
        if (injected && linkEl && linkEl.parentNode) linkEl.parentNode.removeChild(linkEl);
      } catch (e) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep external value in sync
  useEffect(() => {
    if (editorRef.current && (editorRef.current.value ?? "") !== (value ?? "")) {
      editorRef.current.value = value ?? "";
    }
  }, [value]);

  return <div className="rounded border overflow-hidden"><textarea ref={textareaRef} /></div>;
};

export default RichTextEditor;
