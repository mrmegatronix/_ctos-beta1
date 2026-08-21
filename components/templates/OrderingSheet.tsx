import React from 'react';
import { StockItem, Supplier } from '../../types';
import { formatDate } from '../../utils';

interface OrderingSheetProps {
  stock: StockItem[];
  suppliers: Supplier[];
}

const OrderingSheet: React.FC<OrderingSheetProps> = ({ stock, suppliers }) => {
  // Group stock by supplier ID
  const grouped = stock.reduce((acc, item) => {
    if (item.supplierId) {
      if (!acc[item.supplierId]) acc[item.supplierId] = [];
      acc[item.supplierId].push(item);
    }
    return acc;
  }, {} as Record<string, StockItem[]>);

  return (
    <div className="p-8 font-sans text-black bg-white">
      <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Purchase Order Sheet</h1>
          <p className="text-gray-600 mt-1">Generated: {formatDate(new Date())}</p>
        </div>
        <div className="text-right">
          <p className="font-bold border-b border-black inline-block w-48 text-left mb-2">Authorized By:</p><br/>
          <p className="font-bold border-b border-black inline-block w-48 text-left">Signature:</p>
        </div>
      </div>

      {suppliers.filter(s => grouped[s.id] && grouped[s.id].length > 0).map(supplier => (
        <div key={supplier.id} className="mb-8 break-inside-avoid">
          <div className="bg-gray-200 p-3 mb-2 flex justify-between items-center border border-black">
            <h2 className="text-xl font-bold uppercase">{supplier.name}</h2>
            <div className="text-sm">
              <span className="font-bold">Contact:</span> {supplier.contactName} | <span className="font-bold">Email:</span> {supplier.email}
            </div>
          </div>
          
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 w-1/3">Item Name</th>
                <th className="border border-gray-300 p-2 w-1/6">Size/Unit</th>
                <th className="border border-gray-300 p-2 w-1/6">Par Level</th>
                <th className="border border-gray-300 p-2 w-1/6">Current Stock</th>
                <th className="border border-gray-300 p-2 text-center bg-indigo-50">Order Qty</th>
              </tr>
            </thead>
            <tbody>
              {grouped[supplier.id].map(item => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2 text-gray-600">{item.volumeMl ? `${item.volumeMl}ml` : item.unit}</td>
                  <td className="border border-gray-300 p-2 font-medium">{item.minLevel}</td>
                  <td className="border border-gray-300 p-2 text-red-600 font-medium">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 bg-indigo-50 border-x-2 border-indigo-200"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="mt-8 break-inside-avoid">
        <h2 className="text-xl font-bold bg-gray-200 p-2 mb-2 uppercase">Other Supplier / Notes</h2>
        <div className="border border-black p-2 min-h-[150px]"></div>
      </div>

      <div className="mt-8 text-xs text-center text-gray-400">
        CTOS Management System - Master Document
      </div>
    </div>
  );
};

export default OrderingSheet;
