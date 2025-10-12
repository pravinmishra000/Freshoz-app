import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ReopenHintProps {
  onReopen: () => void;
}

export default function ReopenHint({ onReopen }: ReopenHintProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={onReopen}
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg px-3 py-2 text-xs font-semibold"
      >
        <Eye className="h-3 w-3 mr-1" />
        Tomorrow's Special
      </Button>
    </div>
  );
}