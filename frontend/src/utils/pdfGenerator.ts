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

    // Stats Calculation
    const totalChecks = auditData.checklists?.length || 0;
    const compliant = auditData.checklists?.filter((c: any) => c.isCompliant === true).length || 0;
    const nonCompliant = auditData.checklists?.filter((c: any) => c.isCompliant === false).length || 0;
    const progress = totalChecks > 0 ? Math.round(((compliant + nonCompliant) / totalChecks) * 100) : 0;
    const complianceRate = (compliant + nonCompliant) > 0 ? Math.round((compliant / (compliant + nonCompliant)) * 100) : 0;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Ejecución", 15, finalY);

    // Stats Row
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Progreso de Auditoría: ${progress}%`, 15, finalY + 8);
    doc.text(`Nivel de Cumplimiento: ${complianceRate}%`, 15, finalY + 14);
    doc.text(`Cumple: ${compliant} | No Cumple: ${nonCompliant} | Total: ${totalChecks}`, 15, finalY + 20);

    // Checklist Table
    const checklistBody = auditData.checklists?.map((item: any) => [
        item.section,
        item.question,
        item.isCompliant === true ? 'CUMPLE' : item.isCompliant === false ? 'NO CUMPLE' : 'PENDIENTE',
        item.auditorNotes || '-'
    ]) || [];

    autoTable(doc, {
        startY: finalY + 25,
        head: [['Sec', 'Requisito / Pregunta', 'Estado', 'Notas']],
        body: checklistBody,
        theme: 'grid',
        headStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 25, fontStyle: 'bold' },
            3: { cellWidth: 50 }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                const status = data.cell.raw;
                if (status === 'CUMPLE') data.cell.styles.textColor = [22, 163, 74];
                if (status === 'NO CUMPLE') data.cell.styles.textColor = [220, 38, 38];
            }
        }
    });

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
