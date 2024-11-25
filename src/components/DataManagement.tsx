import React, { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, Save } from 'lucide-react';
import { exportData, importData } from '../lib/store';

interface DataManagementProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function DataManagement({ onSuccess, onError }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `salon-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : '데이터 내보내기에 실패했습니다');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const result = await importData(data);
          
          if (result.success) {
            const summary = result.summary;
            alert(
              `데이터 가져오기 성공!\n\n` +
              `- 고객: ${summary.customers}명\n` +
              `- 서비스: ${summary.services}개\n` +
              `- 예약: ${summary.appointments}건\n` +
              `- 회원권 거래: ${summary.transactions}건\n` +
              `${summary.hasPreferences ? '- 회원 선호도 정보 포함' : ''}`
            );
            onSuccess();
          }
        } catch (error) {
          onError(error instanceof Error ? error.message : '잘못된 데이터 형식입니다');
        }
      };

      reader.onerror = () => {
        onError('파일을 읽는데 실패했습니다');
      };

      reader.readAsText(file);
    } catch (error) {
      onError(error instanceof Error ? error.message : '데이터 가져오기에 실패했습니다');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center">
        <Save className="w-6 h-6 mr-2 text-purple-600" />
        데이터 관리
      </h2>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">주의사항</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>데이터를 가져오면 기존의 모든 데이터가 대체됩니다.</li>
                <li>필요한 경우 먼저 현재 데이터를 내보내기 해주세요.</li>
                <li>백업 파일은 안전한 곳에 보관해주세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary"
          disabled={importing}
        >
          <Upload className="w-4 h-4 mr-2" />
          {importing ? '가져오는 중...' : '데이터 가져오기'}
        </button>

        <button
          onClick={handleExport}
          className="btn btn-secondary"
          disabled={exporting}
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? '내보내는 중...' : '데이터 내보내기'}
        </button>
      </div>

      <div className="text-sm text-gray-500">
        <h4 className="font-medium mb-2">포함되는 데이터:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>고객 정보</li>
          <li>서비스 목록</li>
          <li>예약 내역</li>
          <li>회원권 거래 내역</li>
          <li>고객 선호도 정보</li>
        </ul>
      </div>
    </div>
  );
}