import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data found', message = 'There is nothing to show here yet.', action = null }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
