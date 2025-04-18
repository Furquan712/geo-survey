"use client";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DynamicChartGroup from "./DynamicChartGroup"; // your existing component

export default function ReportsPage({ submissions }) {
  const reportRef = useRef();

  const downloadPDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("form-report.pdf");
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download PDF Report
        </button>
      </div>

      <div ref={reportRef} className="bg-white text-black p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Form Analysis Report</h1>
        <DynamicChartGroup submissions={submissions} />
      </div>
    </div>
  );
}
