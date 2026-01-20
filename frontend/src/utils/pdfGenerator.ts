import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAuditReport = (auditData: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(37, 99, 235); // primary-600
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE AUDITORÍA", 15, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, pageWidth - 15, 25, { align: 'right' });

    // Organization Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detalles de la Auditoría", 15, 55);

    doc.setDrawColor(229, 231, 235);
    doc.line(15, 58, pageWidth - 15, 58);

    // Audit Metadata Table
    autoTable(doc, {
        startY: 65,
        head: [['Atributo', 'Valor']],
        body: [
            ['Título', auditData.title],
            ['Tipo', auditData.type.toUpperCase()],
            ['Estado', auditData.status.toUpperCase()],
            ['Fecha Planificada', new Date(auditData.plannedDate).toLocaleDateString()],
            ['Auditor Responsable', auditData.auditor || 'No asignado'],
            ['Alcance', auditData.scope || 'General'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [243, 244, 246], textColor: [75, 85, 99], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
    });

    // Content Section
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Ejecutivo", 15, finalY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summary = "Esta auditoría se realizó para verificar el cumplimiento de los procesos internos según la norma ISO 9001:2015. Se evaluaron los controles operativos y la documentación asociada.";
    doc.text(doc.splitTextToSize(summary, pageWidth - 30), 15, finalY + 8);

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Auditorías Online - Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Save
    doc.save(`Informe_Auditoria_${auditData.title.replace(/\s+/g, '_')}.pdf`);
};
