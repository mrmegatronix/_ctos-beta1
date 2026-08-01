import React from 'react';
import { AppModule } from '../types';
import { LucideIcon } from 'lucide-react';

export interface CategoryHubLink {
  id: AppModule;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface CategoryHubViewProps {
  title: string;
  description: string;
  links: CategoryHubLink[];
  onSelectModule: (module: AppModule) => void;
}

const CategoryHubView: React.FC<CategoryHubViewProps> = ({ title, description, links, onSelectModule }) => {
  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onSelectModule(link.id)}
            className="group flex flex-col items-start p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <link.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">{link.label}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{link.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryHubView;
