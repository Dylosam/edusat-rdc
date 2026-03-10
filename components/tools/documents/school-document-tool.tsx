'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  Eraser,
  Italic,
  List,
  ListOrdered,
  Printer,
  Redo2,
  RotateCcw,
  Save,
  Underline,
  Undo2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const STORAGE_KEY = 'edusat-single-page-document-v1';

export function SchoolDocumentTool() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState('<p><br /></p>');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialContent = typeof saved === 'string' ? saved : '<p><br /></p>';

    setContent(initialContent);

    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, content);
  }, [content]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML ?? '<p><br /></p>';
    setContent(html);
  };

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, content);
    toast.success('Document sauvegardé');
  };

  const handleReset = () => {
    const blank = '<p><br /></p>';
    setContent(blank);

    if (editorRef.current) {
      editorRef.current.innerHTML = blank;
      editorRef.current.focus();
    }

    localStorage.setItem(STORAGE_KEY, blank);
    toast.success('Feuille réinitialisée');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!editorRef.current) {
      toast.error('Document introuvable');
      return;
    }

    try {
      setIsExportingPdf(true);

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule as any).default || (html2pdfModule as any);

      await html2pdf()
        .set({
          margin: [0, 0, 0, 0],
          filename: 'document-scolaire.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(document.getElementById('print-sheet'))
        .save();

      toast.success('PDF exporté');
    } catch {
      toast.error('Échec de l’export PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .word-toolbar button {
          min-width: 40px;
        }

        .sheet-shell {
          border: 1px solid hsl(var(--border));
          border-radius: 1rem;
          background: hsl(var(--muted) / 0.25);
          padding: 1rem;
          overflow: auto;
        }

        .sheet-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.12);
          position: relative;
        }

        .sheet-editor {
          min-height: 297mm;
          padding: 18mm 16mm;
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          font-size: 15px;
          line-height: 1.8;
          color: #111827;
          outline: none;
          white-space: normal;
          word-break: break-word;
        }

        .sheet-editor p {
          margin: 0 0 12px 0;
        }

        .sheet-editor ul,
        .sheet-editor ol {
          margin: 0 0 12px 24px;
        }

        .sheet-editor h1,
        .sheet-editor h2,
        .sheet-editor h3 {
          margin: 16px 0 10px 0;
          font-weight: 700;
        }

        .sheet-editor:empty:before {
          content: 'Commence à écrire ici...';
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }

        @media (max-width: 1024px) {
          .sheet-page {
            width: 100%;
            min-height: auto;
          }

          .sheet-editor {
            min-height: 70vh;
            padding: 24px;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .print-zone,
          .print-zone * {
            visibility: visible;
          }

          .print-zone {
            position: absolute;
            inset: 0;
            width: 100%;
            background: white;
          }

          .sheet-shell {
            border: none !important;
            background: white !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .sheet-page {
            box-shadow: none !important;
            width: 100% !important;
            min-height: auto !important;
          }

          .sheet-editor {
            min-height: auto !important;
            padding: 14mm 14mm 14mm 14mm !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Feuille vierge</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Écris directement sur la feuille comme dans un traitement de texte simple.
                </p>
              </div>
              <Badge variant="secondary">1 page</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="word-toolbar flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => exec('undo')}>
                <Undo2 className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('redo')}>
                <Redo2 className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('bold')}>
                <Bold className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('italic')}>
                <Italic className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('underline')}>
                <Underline className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('justifyLeft')}>
                <AlignLeft className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('justifyCenter')}>
                <AlignCenter className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('justifyRight')}>
                <AlignRight className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('insertUnorderedList')}>
                <List className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('insertOrderedList')}>
                <ListOrdered className="h-4 w-4" />
              </Button>

              <Button type="button" variant="outline" size="icon" onClick={() => exec('removeFormat')}>
                <Eraser className="h-4 w-4" />
              </Button>

              <Button type="button" variant="secondary" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>

              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>

              <Button type="button" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExportingPdf ? 'Export...' : 'Exporter PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="sheet-shell print-zone">
          <div id="print-sheet" className="sheet-page">
            <div
              ref={editorRef}
              className="sheet-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
            />
          </div>
        </div>
      </div>
    </>
  );
}