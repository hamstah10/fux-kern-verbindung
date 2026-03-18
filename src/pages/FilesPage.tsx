import { SectionHeader, DataCard, StatusBadge } from '@/components/DataComponents';
import { mockFiles, mockVehicles, fileCategoryLabels } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { FileText, Download, Shield } from 'lucide-react';

export default function FilesPage() {
  return (
    <div className="p-6">
      <SectionHeader title="Dateien" sub="ECU-Files, Dyno Reports und Protokolle mit Checksummen-Validierung" />
      <DataCard>
        <div className="divide-y divide-border">
          {mockFiles.map((file, i) => {
            const vehicle = mockVehicles.find(v => v.id === file.vehicle_id);
            return (
              <motion.div key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 py-3 px-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {fileCategoryLabels[file.category]} · {(file.size_bytes / 1024 / 1024).toFixed(1)} MB
                    {vehicle && ` · ${vehicle.brand} ${vehicle.model}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span className="font-mono-data text-[10px]">SHA256: {file.checksum_sha256.slice(0, 12)}...</span>
                </div>
                <button className="p-2 rounded-sm hover:bg-secondary transition-colors" title="GET /api/v1/files/[ID]/signed-url">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </DataCard>
    </div>
  );
}
