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
            ['Norma ISO', auditData.isoStandard || 'N/A'],
            ['Fecha Planificada', new Date(auditData.plannedDate).toLocaleDateString()],
            ['Auditor Responsable', auditData.leadAuditor?.fullName || 'No asignado'],
            ['Alcance', auditData.scope || 'General'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [243, 244, 246], textColor: [75, 85, 99], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
    });

    // Content Section
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Stats Calculation using new status field
    const totalChecks = auditData.checklists?.length || 0;
    const compliant = auditData.checklists?.filter((c: any) => c.status === 'compliant').length || 0;
    const nonCompliant = auditData.checklists?.filter((c: any) => c.status === 'non_compliant').length || 0;
    const observation = auditData.checklists?.filter((c: any) => c.status === 'observation').length || 0;
    const improvement = auditData.checklists?.filter((c: any) => c.status === 'improvement_opportunity').length || 0;
    const pending = totalChecks - compliant - nonCompliant - observation - improvement;

    const completed = compliant + nonCompliant + observation + improvement;
    const progress = totalChecks > 0 ? Math.round((completed / totalChecks) * 100) : 0;
    const complianceRate = completed > 0 ? Math.round((compliant / completed) * 100) : 0;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Ejecución", 15, finalY);

    // Stats Row
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Progreso de Auditoría: ${progress}%`, 15, finalY + 8);
    doc.text(`Nivel de Cumplimiento: ${complianceRate}%`, 15, finalY + 14);

    // Graphical Breakdown - Simple bar chart
    const chartY = finalY + 25;
    const chartHeight = 40;
    const barWidth = 35;
    const spacing = 10;

    // Draw bars
    const maxCount = Math.max(compliant, nonCompliant, observation, improvement, 1);

    // Conforme (Green)
    const confHeight = (compliant / maxCount) * chartHeight;
    doc.setFillColor(34, 197, 94);
    doc.rect(15, chartY + chartHeight - confHeight, barWidth, confHeight, 'F');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`${compliant}`, 15 + barWidth / 2, chartY + chartHeight + 5, { align: 'center' });
    doc.text('Conforme', 15 + barWidth / 2, chartY + chartHeight + 10, { align: 'center' });

    // No Conforme (Red)
    const ncHeight = (nonCompliant / maxCount) * chartHeight;
    doc.setFillColor(239, 68, 68);
    doc.rect(15 + barWidth + spacing, chartY + chartHeight - ncHeight, barWidth, ncHeight, 'F');
    doc.text(`${nonCompliant}`, 15 + barWidth + spacing + barWidth / 2, chartY + chartHeight + 5, { align: 'center' });
    doc.text('No Conforme', 15 + barWidth + spacing + barWidth / 2, chartY + chartHeight + 10, { align: 'center' });

    // Observación (Yellow)
    const obsHeight = (observation / maxCount) * chartHeight;
    doc.setFillColor(234, 179, 8);
    doc.rect(15 + (barWidth + spacing) * 2, chartY + chartHeight - obsHeight, barWidth, obsHeight, 'F');
    doc.text(`${observation}`, 15 + (barWidth + spacing) * 2 + barWidth / 2, chartY + chartHeight + 5, { align: 'center' });
    doc.text('Observación', 15 + (barWidth + spacing) * 2 + barWidth / 2, chartY + chartHeight + 10, { align: 'center' });

    // Oportunidad (Blue)
    const impHeight = (improvement / maxCount) * chartHeight;
    doc.setFillColor(59, 130, 246);
    doc.rect(15 + (barWidth + spacing) * 3, chartY + chartHeight - impHeight, barWidth, impHeight, 'F');
    doc.text(`${improvement}`, 15 + (barWidth + spacing) * 3 + barWidth / 2, chartY + chartHeight + 5, { align: 'center' });
    doc.text('Oportunidad', 15 + (barWidth + spacing) * 3 + barWidth / 2, chartY + chartHeight + 10, { align: 'center' });

    // Checklist Table
    const checklistBody = auditData.checklists?.map((item: any) => {
        let statusText = 'PENDIENTE';
        if (item.status === 'compliant') statusText = 'CONFORME';
        else if (item.status === 'non_compliant') statusText = 'NO CONFORME';
        else if (item.status === 'observation') statusText = 'OBSERVACIÓN';
        else if (item.status === 'improvement_opportunity') statusText = 'OPORTUNIDAD';

        return [
            item.section,
            item.question,
            statusText,
            item.auditorNotes || '-'
        ];
    }) || [];

    autoTable(doc, {
        startY: chartY + chartHeight + 20,
        head: [['Sec', 'Requisito / Pregunta', 'Estado', 'Notas']],
        body: checklistBody,
        theme: 'grid',
        headStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30, fontStyle: 'bold' },
            3: { cellWidth: 50 }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                const status = data.cell.raw;
                if (status === 'CONFORME') data.cell.styles.textColor = [34, 197, 94];
                if (status === 'NO CONFORME') data.cell.styles.textColor = [239, 68, 68];
                if (status === 'OBSERVACIÓN') data.cell.styles.textColor = [234, 179, 8];
                if (status === 'OPORTUNIDAD') data.cell.styles.textColor = [59, 130, 246];
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
