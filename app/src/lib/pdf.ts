import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Project, Member } from '@/types/vault';
import { formatIDR, formatDateTime } from './format';

/**
 * Export full vault report for a project
 */
export function exportProjectPDF(project: Project): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CODIROOM VAULT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('PROJECT REPORT', pageWidth / 2, 30, { align: 'center' });
  
  // Project Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${project.name}`, 14, 50);
  doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, 14, 58);
  doc.text(`Balance: ${formatIDR(project.balance)}`, 14, 66);
  doc.text(`Members: ${project.members.length}`, 14, 74);
  doc.text(`Transactions: ${project.logs.length}`, 14, 82);
  
  // Members Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MEMBERS', 14, 100);
  
  const memberHeaders = [['Name', 'Role', 'Total Spent']];
  const memberData = project.members.map(m => [
    m.name,
    m.role,
    formatIDR(m.totalSpent)
  ]);
  
  autoTable(doc, {
    head: memberHeaders,
    body: memberData,
    startY: 105,
    theme: 'grid',
    headStyles: {
      fillColor: [62, 2, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
  });
  
  // Transaction History
  const finalY = (doc as any).lastAutoTable?.finalY || 120;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSACTION HISTORY', 14, finalY + 15);
  
  const logHeaders = [['Date', 'Type', 'Context', 'Value']];
  const logData = [...project.logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(l => [
      formatDateTime(l.timestamp),
      l.type,
      l.context.substring(0, 40) + (l.context.length > 40 ? '...' : ''),
      l.value > 0 ? `+${formatIDR(l.value)}` : `-${formatIDR(Math.abs(l.value))}`
    ]);
  
  autoTable(doc, {
    head: logHeaders,
    body: logData,
    startY: finalY + 20,
    theme: 'grid',
    headStyles: {
      fillColor: [62, 2, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Codiroom Vault - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`codiroom-vault-${project.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

/**
 * Export member audit PDF
 */
export function exportMemberAuditPDF(project: Project, member: Member): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CODIROOM VAULT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('MEMBER AUDIT', pageWidth / 2, 30, { align: 'center' });
  
  // Member Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${project.name}`, 14, 50);
  doc.text(`Member: ${member.name}`, 14, 58);
  doc.text(`Role: ${member.role}`, 14, 66);
  doc.text(`Total Spent: ${formatIDR(member.totalSpent)}`, 14, 74);
  
  // Get member's transactions
  const memberLogs = project.logs.filter(l => {
    if (l.memberId === member.id) return true;
    if (!l.memberId && l.type === 'EXPENSE') {
      // Shared expense - member was participant
      return true;
    }
    return false;
  });
  
  // Transaction History
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSACTION HISTORY', 14, 95);
  
  const logHeaders = [['Date', 'Type', 'Context', 'Amount']];
  const logData = memberLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(l => {
      let amount = 0;
      if (l.memberId === member.id) {
        amount = Math.abs(l.value);
      } else if (!l.memberId && l.type === 'EXPENSE') {
        // Shared expense split
        amount = Math.abs(l.value) / l.participantCount;
      }
      
      return [
        formatDateTime(l.timestamp),
        l.type,
        l.context.substring(0, 40) + (l.context.length > 40 ? '...' : ''),
        formatIDR(amount)
      ];
    });
  
  autoTable(doc, {
    head: logHeaders,
    body: logData,
    startY: 100,
    theme: 'grid',
    headStyles: {
      fillColor: [62, 2, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Codiroom Vault - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`codiroom-vault-audit-${member.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
