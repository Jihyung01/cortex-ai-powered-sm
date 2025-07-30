import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select items...",
  className
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter(item => item !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onSelectionChange(selected.filter(item => item !== value));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(item => (
            <Badge key={item} variant="secondary" className="pr-1">
              {item}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => handleRemove(item)}
              >
                <X size={12} />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length === 0 ? placeholder : `${selected.length} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option}
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}