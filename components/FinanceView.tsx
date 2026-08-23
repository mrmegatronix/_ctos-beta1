
import React, { useState, useRef, useEffect } from 'react';
import CashUpView from "./CashUpView";
import { CashUpRecord, TeamMember, Invoice } from '../types';
import { formatDate, generateId } from '../utils';
import { db } from '../services/database';
import { DollarSign, CreditCard, Wallet, TrendingUp, AlertTriangle, Calculator, FileText, Camera, Upload, X, Check, Table } from 'lucide-react';
import { exportToGoogleSheets } from '../services/googleService';

interface FinanceViewProps {
  records: CashUpRecord[];
  staff: TeamMember[];
}

const FinanceView: React.FC<FinanceViewProps> = ({ records, staff }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'entry' | 'invoices'>('history');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Invoice Form State
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
      type: 'invoice',
      date: new Date(),
      status: 'pending'
  });

  useEffect(() => {
      setInvoices(db.getInvoices());
  }, []);

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Unknown';

  const startCamera = async () => {
      setIsCameraOpen(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Could not access camera. Please check permissions.");
          setIsCameraOpen(false);
      }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setIsCameraOpen(false);
  };

  const captureImage = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg');
              setCapturedImage(dataUrl);
              stopCamera();
          }
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setCapturedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const saveInvoice = () => {
      if (!newInvoice.supplierName || !newInvoice.amount) return;
      
      const invoice: Invoice = {
          id: generateId(),
          supplierName: newInvoice.supplierName,
          reference: newInvoice.reference || 'N/A',
          amount: Number(newInvoice.amount),
          date: new Date(newInvoice.date || new Date()),
          type: newInvoice.type as 'invoice' | 'delivery',
          status: 'pending',
          imageUrl: capturedImage || undefined
      };
      
      db.saveInvoice(invoice);
      setInvoices(db.getInvoices());
      
      // Reset form
      setNewInvoice({ type: 'invoice', date: new Date(), status: 'pending' });
      setCapturedImage(null);
  };

  const weeklyCash = records.reduce((sum, r) => sum + r.cashTotal, 0);
  const weeklyEftpos = records.reduce((sum, r) => sum + r.eftposTotal, 0);
  const totalTakings = weeklyCash + weeklyEftpos;

  const handleExportSheets = async () => {
    setIsExporting(true);
    try {
      const headers = ['Date', 'Manager', 'Expected Cash', 'Actual Cash', 'Variance', 'EFTPOS', 'Notes'];
      const values = [
        headers,
        ...records.map(r => [
          formatDate(r.date),
          staff.find(s => s.id === r.managerId)?.name || 'Unknown',
          r.expectedCash.toFixed(2),
          r.actualCash.toFixed(2),
          r.variance.toFixed(2),
          r.eftposTotal.toFixed(2),
          r.notes || ''
        ])
      ];
      
      const result = await exportToGoogleSheets('', 'Sheet1!A1', values);
      alert(`Exported successfully! Spreadsheet ID: ${result.spreadsheetId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to export to Google Sheets. Ensure you are connected to Google.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm ">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-50 ">Finance & Cash Up</h2>
          <p className="text-slate-400 ">Daily takings, reconciliation, and invoices.</p>
        </div>
        <div className="flex bg-gray-100  rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  shadow-lg text-slate-50 ' : 'text-slate-400 '}`}
            >
              History
            </button>
            <button 
              onClick={() => setActiveTab('entry')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'entry' ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  shadow-lg text-slate-50 ' : 'text-slate-400 '}`}
            >
              New Entry
            </button>
            <button 
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'invoices' ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  shadow-lg text-slate-50 ' : 'text-slate-400 '}`}
            >
              Invoices & Delivery
            </button>
        </div>
      </div>

      {activeTab === 'history' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  p-6 rounded-xl border border-gray-200 dark:border-slate-700  shadow-lg">
                 <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5"/></div>
                    <span className="text-sm text-slate-400">Total Cash</span>
                 </div>
                 <div className="text-2xl font-bold text-slate-50 ">${weeklyCash.toFixed(2)}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  p-6 rounded-xl border border-gray-200 dark:border-slate-700  shadow-lg">
                 <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><CreditCard className="w-5 h-5"/></div>
                    <span className="text-sm text-slate-400">Total Eftpos</span>
                 </div>
                 <div className="text-2xl font-bold text-slate-50 ">${weeklyEftpos.toFixed(2)}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  p-6 rounded-xl border border-gray-200 dark:border-slate-700  shadow-lg">
                 <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg"><TrendingUp className="w-5 h-5"/></div>
                    <span className="text-sm text-slate-400">Total Takings</span>
                 </div>
                 <div className="text-2xl font-bold text-slate-50 ">${totalTakings.toFixed(2)}</div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  rounded-xl border border-gray-200 dark:border-slate-700  overflow-hidden">
             <div className="p-6 border-b border-gray-200 dark:border-slate-700  flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                 <h3 className="text-lg font-bold text-slate-50 ">Recent Cash Ups</h3>
                 <button 
                   onClick={handleExportSheets}
                   disabled={isExporting}
                   className="flex items-center space-x-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                 >
                   <Table className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
                   <span>{isExporting ? 'Exporting...' : 'Export to Sheets'}</span>
                 </button>
             </div>
             <table className="w-full text-left">
                <thead className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm text-xs uppercase text-slate-400  border-b border-gray-200 dark:border-slate-700 ">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Staff</th>
                        <th className="px-6 py-4">Eftpos</th>
                        <th className="px-6 py-4">Cash</th>
                        <th className="px-6 py-4">Variance</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {records.map(rec => (
                        <tr key={rec.id} className="hover:bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-50 ">{formatDate(rec.date)}</td>
                            <td className="px-6 py-4 text-sm text-slate-400  flex items-center">
                                <span className="w-6 h-6 rounded-full bg-gray-200  flex items-center justify-center text-xs mr-2 font-bold">{getStaffName(rec.staffId).charAt(0)}</span>
                                {getStaffName(rec.staffId)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-50 ">${rec.eftposTotal.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-slate-50 ">${rec.cashTotal.toFixed(2)}</td>
                            <td className={`px-6 py-4 text-sm font-bold ${rec.variance === 0 ? 'text-green-500' : rec.variance < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                {rec.variance === 0 ? '-' : `$${rec.variance.toFixed(2)}`}
                            </td>
                            <td className="px-6 py-4">
                                {rec.variance === 0 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Balanced</span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> Review
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'entry' && (
        <CashUpView />
      )}

      {activeTab === 'invoices' && (
          <div className="space-y-8">
              {/* Scan / Upload Section */}
              <div className="bg-indigo-50  border border-indigo-100  rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-50  mb-4 flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-indigo-500" /> Scan or Upload Invoice
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left: Capture Interface */}
                      <div className="space-y-4">
                          <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center border-2 border-dashed border-gray-400 ">
                              {isCameraOpen ? (
                                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                              ) : capturedImage ? (
                                  <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                              ) : (
                                  <div className="text-center p-6">
                                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                      <p className="text-slate-400 text-sm">Camera inactive</p>
                                  </div>
                              )}
                              
                              {capturedImage && (
                                  <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                                      <X className="w-4 h-4" />
                                  </button>
                              )}
                          </div>
                          
                          <div className="flex gap-2">
                              {!isCameraOpen ? (
                                  <>
                                    <button onClick={startCamera} className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                        <Camera className="w-4 h-4" /> <span>Use Camera</span>
                                    </button>
                                    <label className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  text-slate-200  rounded-lg hover:bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm dark:hover:bg-slate-600 transition-colors cursor-pointer">
                                        <Upload className="w-4 h-4" /> <span>Upload File</span>
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                                    </label>
                                  </>
                              ) : (
                                  <>
                                    <button onClick={captureImage} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">Capture</button>
                                    <button onClick={stopCamera} className="px-4 py-2.5 bg-gray-200  text-slate-200  rounded-lg">Cancel</button>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* Right: Details Form */}
                      <div className="space-y-4">
                          <h4 className="font-semibold text-slate-200  border-b border-gray-200 dark:border-slate-700  pb-2">Document Details</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-medium text-slate-400 mb-1">Document Type</label>
                                  <select 
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg text-sm outline-none"
                                    value={newInvoice.type}
                                    onChange={e => setNewInvoice({...newInvoice, type: e.target.value as any})}
                                  >
                                      <option value="invoice">Invoice</option>
                                      <option value="delivery">Delivery Slip</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                                  <input 
                                    type="date" 
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg text-sm outline-none"
                                    value={newInvoice.date ? newInvoice.date.toISOString().substr(0,10) : ''}
                                    onChange={e => setNewInvoice({...newInvoice, date: new Date(e.target.value)})}
                                  />
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Supplier Name</label>
                              <input 
                                type="text" 
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg text-sm outline-none"
                                placeholder="e.g. Gourmet Foods"
                                value={newInvoice.supplierName || ''}
                                onChange={e => setNewInvoice({...newInvoice, supplierName: e.target.value})}
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-medium text-slate-400 mb-1">Reference No.</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg text-sm outline-none"
                                    placeholder="INV-..."
                                    value={newInvoice.reference || ''}
                                    onChange={e => setNewInvoice({...newInvoice, reference: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-slate-400 mb-1">Total Amount ($)</label>
                                  <input 
                                    type="number" 
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg text-sm outline-none"
                                    placeholder="0.00"
                                    value={newInvoice.amount || ''}
                                    onChange={e => setNewInvoice({...newInvoice, amount: parseFloat(e.target.value)})}
                                  />
                              </div>
                          </div>

                          <button 
                            onClick={saveInvoice}
                            disabled={!capturedImage && !newInvoice.amount}
                            className="w-full py-2.5 bg-indigo-600 disabled:bg-gray-300 disabled: text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                          >
                              <Check className="w-4 h-4 mr-2" /> Save Record
                          </button>
                      </div>
                  </div>
              </div>

              {/* Invoices List */}
              <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  rounded-xl border border-gray-200 dark:border-slate-700  overflow-hidden shadow-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700  flex justify-between items-center">
                      <h3 className="font-bold text-slate-50 ">Recent Uploads</h3>
                      <button className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">View All</button>
                  </div>
                  <table className="w-full text-left">
                      <thead className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm text-xs uppercase text-slate-400 ">
                          <tr>
                              <th className="px-6 py-3">Date</th>
                              <th className="px-6 py-3">Type</th>
                              <th className="px-6 py-3">Supplier</th>
                              <th className="px-6 py-3">Reference</th>
                              <th className="px-6 py-3 text-right">Amount</th>
                              <th className="px-6 py-3 text-right">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                          {invoices.map(inv => (
                              <tr key={inv.id} className="hover:bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm dark:hover:bg-slate-700/30">
                                  <td className="px-6 py-3 text-sm text-slate-300 ">{formatDate(new Date(inv.date))}</td>
                                  <td className="px-6 py-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${inv.type === 'invoice' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                          {inv.type}
                                      </span>
                                  </td>
                                  <td className="px-6 py-3 text-sm font-medium text-slate-50 ">{inv.supplierName}</td>
                                  <td className="px-6 py-3 text-sm text-slate-400  font-mono">{inv.reference}</td>
                                  <td className="px-6 py-3 text-sm text-right font-medium text-slate-50 ">${inv.amount.toFixed(2)}</td>
                                  <td className="px-6 py-3 text-right">
                                      <span className={`text-xs font-semibold ${inv.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                          {inv.status.toUpperCase()}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                          {invoices.length === 0 && (
                              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No invoices scanned yet.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default FinanceView;
