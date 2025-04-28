import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  SaveIcon,
  DatabaseIcon,
  UserIcon,
  CloudIcon,
  SettingsIcon
} from "lucide-react";

export default function Settings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Default settings state
  const [qrCodeSettings, setQrCodeSettings] = useState({
    prefix: "ITEM-",
    autoGenerate: true,
    includeLocation: true
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    type: "sqlite",
    backupEnabled: true,
    backupFrequency: "daily",
    backupTime: "00:00"
  });

  const [generalSettings, setGeneralSettings] = useState({
    organizationName: "Nonprofit Organization",
    email: "contact@example.org",
    loanDuration: "14",
    sendReminders: true
  });

  // Fetch actual settings if they exist
  const { data: dbTypeSetting } = useQuery({
    queryKey: ["/api/settings/database.type"],
  });

  const { data: orgNameSetting } = useQuery({
    queryKey: ["/api/settings/organization.name"],
  });

  // Update settings when data is fetched
  useState(() => {
    if (dbTypeSetting?.value) {
      setDatabaseSettings(prev => ({ ...prev, type: dbTypeSetting.value }));
    }
    if (orgNameSetting?.value) {
      setGeneralSettings(prev => ({ ...prev, organizationName: orgNameSetting.value }));
    }
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      return apiRequest("POST", `/api/settings/${key}`, { value });
    },
    onSuccess: () => {
      toast({
        title: t("settings.settingsSaved"),
        description: t("settings.settingsSavedDescription")
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("app.error"),
        description: error.message || t("settings.settingsSaveError"),
        variant: "destructive"
      });
    }
  });

  const handleSaveGeneralSettings = () => {
    saveSettingsMutation.mutate({
      key: "organization.name",
      value: generalSettings.organizationName
    });
    saveSettingsMutation.mutate({
      key: "organization.email",
      value: generalSettings.email
    });
    saveSettingsMutation.mutate({
      key: "loan.defaultDuration",
      value: generalSettings.loanDuration
    });
    saveSettingsMutation.mutate({
      key: "loan.sendReminders",
      value: generalSettings.sendReminders.toString()
    });
  };

  const handleSaveDatabaseSettings = () => {
    saveSettingsMutation.mutate({
      key: "database.type",
      value: databaseSettings.type
    });
    saveSettingsMutation.mutate({
      key: "backup.enabled",
      value: databaseSettings.backupEnabled.toString()
    });
    saveSettingsMutation.mutate({
      key: "backup.frequency",
      value: databaseSettings.backupFrequency
    });
    saveSettingsMutation.mutate({
      key: "backup.time",
      value: databaseSettings.backupTime
    });
  };

  const handleSaveQrCodeSettings = () => {
    saveSettingsMutation.mutate({
      key: "qrcode.prefix",
      value: qrCodeSettings.prefix
    });
    saveSettingsMutation.mutate({
      key: "qrcode.autoGenerate",
      value: qrCodeSettings.autoGenerate.toString()
    });
    saveSettingsMutation.mutate({
      key: "qrcode.includeLocation",
      value: qrCodeSettings.includeLocation.toString()
    });
  };

  return (
    <div className="py-6 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t("settings.systemSettings")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("settings.configurePreferences")}
        </p>
      </div>

      <Tabs defaultValue="general" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
          <TabsTrigger value="database">{t("settings.database")}</TabsTrigger>
          <TabsTrigger value="qrcodes">{t("settings.qrCodes")}</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.generalSettings")}</CardTitle>
              <CardDescription>{t("settings.generalDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2 text-gray-500" />
                  {t("settings.organizationInformation")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">{t("settings.organizationName")}</Label>
                    <Input
                      id="org-name"
                      value={generalSettings.organizationName}
                      onChange={(e) =>
                        setGeneralSettings(prev => ({
                          ...prev,
                          organizationName: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-email">{t("settings.contactEmail")}</Label>
                    <Input
                      id="org-email"
                      type="email"
                      value={generalSettings.email}
                      onChange={(e) =>
                        setGeneralSettings(prev => ({
                          ...prev,
                          email: e.target.value
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Loan Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                  {t("settings.loanSettings")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan-duration">{t("settings.defaultLoanDuration")}</Label>
                    <Input
                      id="loan-duration"
                      type="number"
                      min="1"
                      value={generalSettings.loanDuration}
                      onChange={(e) =>
                        setGeneralSettings(prev => ({
                          ...prev,
                          loanDuration: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="send-reminders" className="block mb-1">
                      {t("settings.sendLoanReminders")}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="send-reminders"
                        checked={generalSettings.sendReminders}
                        onCheckedChange={checked =>
                          setGeneralSettings(prev => ({
                            ...prev,
                            sendReminders: checked
                          }))
                        }
                      />
                      <Label htmlFor="send-reminders">
                        {generalSettings.sendReminders
                          ? t("settings.enabled")
                          : t("settings.disabled")}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("settings.sendRemindersDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-6">
              <Button onClick={handleSaveGeneralSettings}>
                <SaveIcon className="h-4 w-4 mr-2" />
                {t("settings.saveSettings")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* DATABASE */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.databaseConfiguration")}</CardTitle>
              <CardDescription>{t("settings.databaseDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Database Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <DatabaseIcon className="h-5 w-5 mr-2 text-gray-500" />
                  {t("settings.databaseSettings")}
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="db-type">{t("settings.databaseType")}</Label>
                  <Select
                    value={databaseSettings.type}
                    onValueChange={value =>
                      setDatabaseSettings(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger id="db-type">
                      <SelectValue placeholder={t("settings.selectDatabaseType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqlite">{t("settings.sqlite")}</SelectItem>
                      <SelectItem value="postgresql">{t("settings.postgresql")}</SelectItem>
                      <SelectItem value="mysql">{t("settings.mysql")}</SelectItem>
                      <SelectItem value="mssql">{t("settings.mssql")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("settings.changeDbWarning")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Backup Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <CloudIcon className="h-5 w-5 mr-2 text-gray-500" />
                  {t("settings.backupSettings")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="backup-enabled"
                      checked={databaseSettings.backupEnabled}
                      onCheckedChange={checked =>
                        setDatabaseSettings(prev => ({
                          ...prev,
                          backupEnabled: checked
                        }))
                      }
                    />
                    <Label htmlFor="backup-enabled">
                      {t("settings.enableAutomaticBackups")}
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">
                      {t("settings.backupFrequency")}
                    </Label>
                    <Select
                      value={databaseSettings.backupFrequency}
                      onValueChange={value =>
                        setDatabaseSettings(prev => ({
                          ...prev,
                          backupFrequency: value
                        }))
                      }
                      disabled={!databaseSettings.backupEnabled}
                    >
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder={t("settings.selectFrequency")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">{t("settings.hourly")}</SelectItem>
                        <SelectItem value="daily">{t("settings.daily")}</SelectItem>
                        <SelectItem value="weekly">{t("settings.weekly")}</SelectItem>
                        <SelectItem value="monthly">{t("settings.monthly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-time">{t("settings.backupTime")}</Label>
                    <Input
                      id="backup-time"
                      type="time"
                      value={databaseSettings.backupTime}
                      onChange={e =>
                        setDatabaseSettings(prev => ({
                          ...prev,
                          backupTime: e.target.value
                        }))
                      }
                      disabled={
                        !databaseSettings.backupEnabled ||
                        databaseSettings.backupFrequency === "hourly"
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-6">
              <Button variant="outline">
                {t("settings.runManualBackup")}
              </Button>
              <Button onClick={handleSaveDatabaseSettings}>
                <SaveIcon className="h-4 w-4 mr-2" />
                {t("settings.saveSettings")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* QR CODES */}
        <TabsContent value="qrcodes">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.qrCodeSettings")}</CardTitle>
              <CardDescription>{t("settings.qrCodeDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ID Generation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("settings.idGeneration")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id-prefix">{t("settings.idPrefix")}</Label>
                    <Input
                      id="id-prefix"
                      value={qrCodeSettings.prefix}
                      onChange={e =>
                        setQrCodeSettings(prev => ({
                          ...prev,
                          prefix: e.target.value
                        }))
                      }
                      placeholder={t("settings.idPrefixPlaceholder")}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {t("settings.prefixDescription")}
                    </p>
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-generate"
                        checked={qrCodeSettings.autoGenerate}
                        onCheckedChange={checked =>
                          setQrCodeSettings(prev => ({
                            ...prev,
                            autoGenerate: checked
                          }))
                        }
                      />
                      <Label htmlFor="auto-generate">
                        {t("settings.autoGenerateIds")}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("settings.autoGenerateDescription")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* QR Code Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("settings.qrCodeContent")}</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-location"
                      checked={qrCodeSettings.includeLocation}
                      onCheckedChange={checked =>
                        setQrCodeSettings(prev => ({
                          ...prev,
                          includeLocation: checked
                        }))
                      }
                    />
                    <Label htmlFor="include-location">
                      {t("settings.includeLocationInQr")}
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("settings.includeLocationDescription")}
                  </p>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">
                    {t("settings.qrCodePreview")}
                  </h4>
                  <div className="bg-white border p-4 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto border rounded-md flex items-center justify-center">
                        {/* SVG preview unchanged */}
                        <svg
                          className="w-24 h-24 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 3H9V9H3V3Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 3H21V9H15V3Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3 15H9V21H3V15Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 15H21V21H15V15Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className="mt-2 text-sm font-medium">
                        {qrCodeSettings.prefix}1234
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("settings.exampleItem")}
                      </p>
                      {qrCodeSettings.includeLocation && (
                        <p className="text-xs text-gray-500">
                          {t("settings.exampleLocation")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-6">
              <Button onClick={handleSaveQrCodeSettings}>
                <SaveIcon className="h-4 w-4 mr-2" />
                {t("settings.saveSettings")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
