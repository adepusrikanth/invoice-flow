'use client';

import { useCallback, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures an HTML element and downloads it as PDF, or opens print dialog.
 */
export function usePreviewPdf() {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const downloadPdf = useCallback(async (element: HTMLElement | null, filename: string) => {
    if (!element) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight,
        height: element.scrollHeight,
      });
      const imgW = canvas.width;
      const imgH = canvas.height;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const a4W = 210;
      const a4H = 297;
      const pxToMm = 25.4 / 96;
      const imgWmm = imgW * pxToMm;
      const imgHmm = imgH * pxToMm;
      const scale = Math.min(a4W / imgWmm, a4H / imgHmm, 1);
      const w = imgWmm * scale;
      const h = imgHmm * scale;
      const x = (a4W - w) / 2;
      const y = (a4H - h) / 2;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', Math.max(0, x), Math.max(0, y), w, h);
      pdf.save(filename.replace(/\s/g, '-') + '.pdf');
    } catch (e) {
      console.error('PDF download failed:', e);
    } finally {
      setDownloading(false);
    }
  }, []);

  const printPreview = useCallback(async (getHtml: () => Promise<string>) => {
    setPrinting(true);
    try {
      const html = await getHtml();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      iframe.src = url;
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 500);
        }
        setPrinting(false);
      };
    } catch (e) {
      console.error('Print failed:', e);
      setPrinting(false);
    }
  }, []);

  return { downloadPdf, printPreview, downloading, printing };
}
