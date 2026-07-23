import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  categoryTitle: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    backgroundColor: '#eff6ff',
    padding: '4 8',
    borderRadius: 4,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#1e3a8a',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  text: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 5,
  },
  boldText: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  col4: {
    width: '25%',
  },
  col12: {
    width: '100%',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#cbd5e1',
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#cbd5e1',
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  statusBadge: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  healthy: { backgroundColor: '#22c55e' },
  needsAttention: { backgroundColor: '#eab308' },
  critical: { backgroundColor: '#ef4444' },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  warningText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export const ReportPDF = ({ report }: { report: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Lab Report Insight</Text>
        <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
      </View>

      {report.criticalWarnings && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>CRITICAL WARNING: {report.criticalWarnings}</Text>
        </View>
      )}

      {report.patientDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <View style={styles.row}>
            <View style={styles.col4}>
              <Text style={styles.subtitle}>Name</Text>
              <Text style={styles.boldText}>{report.patientDetails.name || 'N/A'}</Text>
            </View>
            <View style={styles.col4}>
              <Text style={styles.subtitle}>Age/Gender</Text>
              <Text style={styles.boldText}>{report.patientDetails.age || 'N/A'} / {report.patientDetails.gender || 'N/A'}</Text>
            </View>
            <View style={styles.col4}>
              <Text style={styles.subtitle}>Referred By</Text>
              <Text style={styles.boldText}>{report.patientDetails.referred_by || 'N/A'}</Text>
            </View>
            <View style={styles.col4}>
              <Text style={styles.subtitle}>Sample Date</Text>
              <Text style={styles.boldText}>{report.patientDetails.sample_date || 'N/A'}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Status</Text>
        <Text style={{ ...styles.statusBadge, ...(report.status === 'Healthy' ? styles.healthy : report.status === 'Needs Attention' ? styles.needsAttention : styles.critical) }}>
          {report.status}
        </Text>
      </View>

      {report.biomarkers && report.biomarkers.length > 0 && (() => {
        // Group biomarkers
        const groups: { [key: string]: any[] } = {};
        report.biomarkers.forEach((b: any) => {
          const cat = b.category || "Others";
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(b);
        });

        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comprehensive Test Results</Text>
            {Object.entries(groups).map(([category, tests], gIdx) => (
              <View key={gIdx} wrap={false}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Test Name</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Value</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Unit</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Status</Text></View>
                  </View>
                  {tests.map((b: any, i: number) => (
                    <View style={styles.tableRow} key={i}>
                      <View style={styles.tableCol}><Text style={styles.tableCell}>{b.testName}</Text></View>
                      <View style={styles.tableCol}><Text style={styles.tableCell}>{b.value}</Text></View>
                      <View style={styles.tableCol}><Text style={styles.tableCell}>{b.unit}</Text></View>
                      <View style={styles.tableCol}><Text style={{ ...styles.tableCell, color: b.status !== 'Normal' ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>{b.status}</Text></View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );
      })()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.text}>{report.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Insights</Text>
        <Text style={styles.text}>{report.insights}</Text>
      </View>

      {report.precautions && report.precautions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Precautions</Text>
          {report.precautions.map((p: string, i: number) => (
            <Text key={i} style={styles.text}>• {p}</Text>
          ))}
        </View>
      )}

      {report.followUps && report.followUps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-ups</Text>
          {report.followUps.map((f: string, i: number) => (
            <Text key={i} style={styles.text}>• {f}</Text>
          ))}
        </View>
      )}

      {report.diseaseCauses && report.diseaseCauses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Conditions & Potential Causes</Text>
          {report.diseaseCauses.map((dc: any, idx: number) => (
            <View key={idx} style={{ marginBottom: 15 }}>
              <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>{dc.disease}</Text>
              {dc.description && (
                <Text style={{ ...styles.text, fontStyle: 'italic', marginBottom: 4, color: '#4b5563' }}>{dc.description}</Text>
              )}
              <Text style={{ ...styles.text, fontWeight: 'bold', fontSize: 10, marginTop: 4 }}>Potential Causes:</Text>
              {dc.causes.map((cause: string, cIdx: number) => (
                <Text key={cIdx} style={styles.text}>• {cause}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {report.doctorQuestions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions for your Doctor</Text>
          {Array.isArray(report.doctorQuestions) ? (
            report.doctorQuestions.map((q: string, i: number) => (
              <Text key={i} style={styles.text}>{i + 1}. {q}</Text>
            ))
          ) : (
            report.doctorQuestions.split('\n').filter((q: string) => q.trim() !== '').map((q: string, i: number) => (
              <Text key={i} style={styles.text}>{q}</Text>
            ))
          )}
        </View>
      )}

      <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }}>
        <Text style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>
          Disclaimer: Always consult your doctor if you have any doubts. Seek immediate medical care if there are critical results. Do not use this as a substitute for professional medical advice.
        </Text>
      </View>
    </Page>
  </Document>
);
