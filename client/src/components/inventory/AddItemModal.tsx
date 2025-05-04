import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { itemFormSchema, InsertItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { generateId } from "@/lib/qrUtils";
import { LocationAutoComplete } from "./LocationAutoComplete";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { t } = useTranslation();

  // Get QR code settings
  const { data: prefixSetting } = useQuery({
    queryKey: ["/api/settings/qrcode.prefix"],
  });
  const { data: autoGenerateSetting } = useQuery({
    queryKey: ["/api/settings/qrcode.autoGenerate"],
  });

  const form = useForm<InsertItem>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      itemId: "",
      name: "",
      description: "",
      location: "",
      photoUrl: "",
      origin: "purchased",
      donorName: "",
      status: "available",
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertItem) =>
      apiRequest("POST", "/api/items", data),
    onSuccess: () => {
      toast({
        title: t("toast.itemCreatedTitle"),
        description: t("toast.itemCreatedDescription"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: t("toast.errorTitle"),
        description: error.message || t("toast.errorDescription"),
        variant: "destructive",
      });
    },
  });

  const generateItemId = () => {
    const prefix = prefixSetting?.value || "ITEM-";
    form.setValue("itemId", generateId(prefix));
  };

  useState(() => {
    if (
      isOpen &&
      (autoGenerateSetting?.value === "true" ||
        autoGenerateSetting?.value === undefined)
    ) {
      generateItemId();
    }
  });

  const onSubmit = (data: InsertItem) => createItemMutation.mutate(data);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    setTimeout(() => {
      setIsImageUploading(false);
      toast({
        title: t("toast.imageUploadTitle"),
        description: t("toast.imageUploadDescription"),
      });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("item.addTitle")}</DialogTitle>
          <DialogDescription>{t("item.addDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("item.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("item.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("item.id")}</FormLabel>
                    <div className="flex">
                      <FormControl>
                        <Input
                          placeholder={t("item.idPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-2"
                        onClick={generateItemId}
                      >
                        {t("item.generate")}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("item.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("item.descriptionPlaceholder")}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t("item.location")}</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {t("app.optional")}
                    </span>
                  </div>
                  <FormControl>
                    <LocationAutoComplete
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("locations.select")}
                      isRequired={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="block text-sm font-medium text-gray-700">
                {t("item.photo")}
              </Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-secondary"
                    >
                      <span>{t("item.uploadFile")}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileUpload}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">{t("item.dragDrop")}</p>
                  </div>
                  <p className="text-xs text-gray-500">{t("item.imageNote")}</p>
                  {isImageUploading && (
                    <div className="mt-2 text-xs text-primary">
                      {t("item.uploading")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>{t("item.origin")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="purchased"
                          id="origin-purchased"
                        />
                        <Label htmlFor="origin-purchased">
                          {t("item.originPurchased")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="donated" id="origin-donated" />
                        <Label htmlFor="origin-donated">
                          {t("item.originDonated")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="origin-other" />
                        <Label htmlFor="origin-other">
                          {t("item.originOther")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch("origin") === "donated" ||
              form.watch("origin") === "other") && (
              <FormField
                control={form.control}
                name="donorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("item.donorName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("item.donorNamePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("app.cancel")}
              </Button>
              <Button type="submit" disabled={createItemMutation.isPending}>
                {createItemMutation.isPending
                  ? t("item.adding")
                  : t("item.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
