import React from 'react';
import { SearchIcon } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useContentStore } from '@/store/contentStore';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useContentStore();

  return (
    <InputGroup className="md:max-w-xs">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search notes"
      />
    </InputGroup>
  );
};

export default SearchBar;
