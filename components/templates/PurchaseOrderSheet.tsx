import React from 'react';
import { PurchaseOrder, Supplier, StockItem } from '../../types';
import { formatDate } from '../../utils';

interface PurchaseOrderSheetProps {
  order: PurchaseOrder;
  supplier: Supplier;
  stockItems: StockItem[];
}

const PurchaseOrderSheet: React.FC<PurchaseOrderSheetProps> = ({ order, supplier, stockItems }) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-black print:p-0 print:max-w-none print:w-full">
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-wider text-slate-900">Purchase Order</h1>
          <p className="text-slate-500 font-bold tracking-widest mt-2 uppercase text-sm">PO Number: #{order.id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-slate-900">CTOS Venue Management</h2>
          <p className="text-slate-600 mt-1">123 Main Street</p>
          <p className="text-slate-600">Auckland, 1010</p>
          <p className="text-slate-600 mt-2 font-medium">orders@yourvenue.com</p>
        </div>
      </div>

      <div className="flex justify-between mb-12">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-1/2 mr-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Order To</h3>
          <p className="text-lg font-bold text-slate-900">{supplier.name}</p>
          {supplier.contactPerson && <p className="text-slate-700 mt-1">Attn: {supplier.contactPerson}</p>}
          <p className="text-slate-600 mt-1">{supplier.address}</p>
          <div className="mt-4 text-sm">
            <p><span className="font-semibold">Phone:</span> {supplier.phone}</p>
            <p><span className="font-semibold">Email:</span> {supplier.email}</p>
          </div>
        </div>
        
        <div className="w-1/2 ml-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 font-bold text-slate-600">Order Date:</td>
                <td className="py-2 text-right font-medium">{formatDate(order.date)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 font-bold text-slate-600">Requested Delivery:</td>
                <td className="py-2 text-right font-medium">ASAP</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 font-bold text-slate-600">Status:</td>
                <td className="py-2 text-right font-bold uppercase text-indigo-600">{order.status}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="py-3 px-4 font-bold uppercase text-xs tracking-wider rounded-tl-lg">Item Description</th>
            <th className="py-3 px-4 font-bold uppercase text-xs tracking-wider text-center">Quantity</th>
            <th className="py-3 px-4 font-bold uppercase text-xs tracking-wider text-right">Unit Price</th>
            <th className="py-3 px-4 font-bold uppercase text-xs tracking-wider text-right rounded-tr-lg">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => {
            const stock = stockItems.find(s => s.id === item.stockId);
            return (
              <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="py-4 px-4">
                  <div className="font-bold text-slate-900">{stock?.name || 'Unknown Item'}</div>
                  <div className="text-sm text-slate-500">{stock?.category}</div>
                </td>
                <td className="py-4 px-4 text-center font-medium">
                  {item.quantity} {stock?.unit || ''}
                </td>
                <td className="py-4 px-4 text-right text-slate-600">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right font-bold text-slate-900">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-600 font-bold">Subtotal</span>
            <span className="text-slate-900 font-medium">${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600 font-bold">Tax (15%)</span>
            <span className="text-slate-900 font-medium">${(order.total * 0.15).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-300 pt-4">
            <span className="text-lg font-black text-slate-900">Total</span>
            <span className="text-xl font-black text-slate-900">${(order.total * 1.15).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t-2 border-slate-200">
        <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-widest text-xs">Terms & Conditions</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          Please notify us immediately if you are unable to ship as specified. 
          Send all correspondence and invoices to the address above. All goods must be accompanied by a delivery docket.
        </p>
        
        <div className="mt-12 flex justify-between">
          <div className="w-1/3">
            <div className="border-b border-slate-400 mb-2"></div>
            <p className="text-xs text-slate-500 text-center uppercase tracking-wider font-bold">Authorized Signature</p>
          </div>
          <div className="w-1/3 text-right">
            <p className="text-xs text-slate-500">Page 1 of 1</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderSheet;
