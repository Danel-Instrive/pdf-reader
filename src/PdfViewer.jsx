import React, { useState, useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PdfViewer() {
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (pdf) {
      pdf.getPage(currentPage).then((page) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        page.render(renderContext);
      });
    }
  }, [pdf, currentPage, scale]);

  const loadPDF = (file) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const pdfData = new Uint8Array(fileReader.result);
      pdfjs.getDocument(pdfData).promise.then((pdf) => {
        setPdf(pdf);
      });
    };
    fileReader.readAsArrayBuffer(file);
  };

  const goToPage = (pageNumber) => {
    if (pdf) {
      const maxPages = pdf.numPages;
      const page = Math.min(Math.max(pageNumber, 1), maxPages);
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  const handleZoomIn = () => {
    setScale(scale + 0.1);
  };

  const handleZoomOut = () => {
    setScale(scale - 0.1);
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        ref={inputRef}
        onChange={(e) => loadPDF(e.target.files[0])}
      />
      {pdf && (
        <div>
          <canvas ref={canvasRef} />
          <div>
            <button disabled={currentPage === 1} onClick={prevPage}>
              Prev
            </button>
            <button disabled={currentPage === pdf.numPages} onClick={nextPage}>
              Next
            </button>
            <button onClick={handleZoomIn}>+</button>
            <button onClick={handleZoomOut}>-</button>
            <span>
              Page {currentPage} of {pdf.numPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PdfViewer;
