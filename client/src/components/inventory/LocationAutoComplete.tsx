import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Location } from "@shared/schema";

interface LocationAutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isRequired?: boolean;
}

export function LocationAutoComplete({
  value,
  onChange,
  placeholder = "Seleziona posizione...",
  className,
  isRequired = false,
}: LocationAutoCompleteProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Se l'inputValue è vuoto e il valore arriva dal parent, aggiornalo
  useEffect(() => {
    if (value && !inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue]);

  // Recupera le locations esistenti
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Mutation per creare una nuova location
  const createLocationMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/locations", { name, description: "" });
      const data = await response.json();
      return data;
    },
    onSuccess: (data: Location) => {
      toast({
        title: t("notifications.success"),
        description: t("locations.createdSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      onChange(data.name);
      setInputValue(data.name);
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("notifications.error"),
        description: error.message || t("locations.creationError"),
        variant: "destructive",
      });
    },
  });

  // Mutation per eliminare una location
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/${id}`);
      return id;
    },
    onSuccess: (id: number) => {
      toast({
        title: t("notifications.success"),
        description: t("locations.deletedSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      
      // Trova la location eliminata
      const deletedLocation = locations.find(loc => loc.id === id);
      
      // Resetta il valore se la location selezionata è stata eliminata
      if (deletedLocation && deletedLocation.name === value) {
        onChange("");
        setInputValue("");
      }
    },
    onError: (error) => {
      toast({
        title: t("notifications.error"),
        description: error.message || t("locations.deletionError"),
        variant: "destructive",
      });
    },
  });

  // Funzione per creare una nuova location
  const handleCreateLocation = () => {
    if (!inputValue.trim()) return;
    
    // Controllo se esiste già
    const existingLocation = locations.find(loc => 
      loc.name.toLowerCase() === inputValue.toLowerCase()
    );
    
    if (existingLocation) {
      // Se esiste, selezionala
      onChange(existingLocation.name);
      setOpen(false);
      return;
    }
    
    // Altrimenti crea una nuova location
    createLocationMutation.mutate(inputValue.trim());
  };

  // Funzione per eliminare una location
  const handleDeleteLocation = (e: React.MouseEvent, locationId: number) => {
    e.stopPropagation();
    if (confirm(t("confirmations.delete"))) {
      deleteLocationMutation.mutate(locationId);
    }
  };

  // Filtra le locations in base all'input
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value || placeholder}
          <span className="ml-2 shrink-0 opacity-50">▼</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder={t("app.search")}
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9"
            autoFocus
          />
          {isLoadingLocations ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <CommandList>
              {!filteredLocations.length && inputValue && (
                <CommandEmpty>{t("app.noResults")}</CommandEmpty>
              )}
              <CommandGroup>
                {filteredLocations.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={location.name}
                    onSelect={() => {
                      onChange(location.name);
                      setInputValue(location.name);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{location.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleDeleteLocation(e, location.id)}
                      title={t("app.delete")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
              {inputValue.trim() && (
                <CommandItem
                  value={`add-${inputValue}`}
                  onSelect={handleCreateLocation}
                  className="flex items-center gap-2 text-primary"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>{`${t("locations.createNew")}: "${inputValue}"`}</span>
                </CommandItem>
              )}
            </CommandList>
          )}
          {!isRequired && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-muted-foreground"
                onClick={() => {
                  onChange("");
                  setInputValue("");
                  setOpen(false);
                }}
              >
                {t("app.clearSelection")}
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}