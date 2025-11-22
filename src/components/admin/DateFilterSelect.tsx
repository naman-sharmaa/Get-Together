import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export type DateFilter =
  | 'last_hour'
  | 'today'
  | 'yesterday'
  | 'this_month'
  | '3_months'
  | '6_months'
  | '1_year'
  | 'all_time';

interface DateFilterSelectProps {
  value: DateFilter;
  onChange: (value: DateFilter) => void;
}

const dateFilterOptions = [
  { value: 'last_hour' as DateFilter, label: 'Last Hour' },
  { value: 'today' as DateFilter, label: 'Today' },
  { value: 'yesterday' as DateFilter, label: 'Yesterday' },
  { value: 'this_month' as DateFilter, label: 'This Month' },
  { value: '3_months' as DateFilter, label: 'Last 3 Months' },
  { value: '6_months' as DateFilter, label: 'Last 6 Months' },
  { value: '1_year' as DateFilter, label: 'Last Year' },
  { value: 'all_time' as DateFilter, label: 'All Time' },
];

const DateFilterSelect = ({ value, onChange }: DateFilterSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <Calendar className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {dateFilterOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DateFilterSelect;
