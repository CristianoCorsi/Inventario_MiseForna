import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { SaveIcon, DatabaseIcon, UserIcon, CloudIcon, SettingsIcon } from "lucide-react";

export default function Settings() {
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
        title: "Settings saved",
        description: "Your settings have been saved successfully."
      });
      
      // Invalidate all settings queries
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveGeneralSettings = () => {
    // Save each setting individually
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
        <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your inventory management system preferences
        </p>
      </div>
      
      <Tabs defaultValue="general" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic organization and system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Organization Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input 
                      id="org-name" 
                      value={generalSettings.organizationName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org-email">Contact Email</Label>
                    <Input 
                      id="org-email" 
                      type="email"
                      value={generalSettings.email}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Loan Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan-duration">Default Loan Duration (days)</Label>
                    <Input 
                      id="loan-duration" 
                      type="number"
                      min="1"
                      value={generalSettings.loanDuration}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, loanDuration: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="send-reminders" className="block mb-1">Send Loan Reminders</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="send-reminders" 
                        checked={generalSettings.sendReminders}
                        onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, sendReminders: checked }))}
                      />
                      <Label htmlFor="send-reminders">
                        {generalSettings.sendReminders ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Send email reminders for upcoming and overdue loans
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-6">
              <Button onClick={handleSaveGeneralSettings}>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>
                Configure database settings and backup preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <DatabaseIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Database Settings
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="db-type">Database Type</Label>
                  <Select 
                    value={databaseSettings.type}
                    onValueChange={(value) => setDatabaseSettings(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="db-type">
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqlite">SQLite (Default)</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mssql">Microsoft SQL Server</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Warning: Changing database type will require a restart and may require additional configuration
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <CloudIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Backup Settings
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="backup-enabled" 
                      checked={databaseSettings.backupEnabled}
                      onCheckedChange={(checked) => setDatabaseSettings(prev => ({ ...prev, backupEnabled: checked }))}
                    />
                    <Label htmlFor="backup-enabled">Enable Automatic Backups</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select 
                      value={databaseSettings.backupFrequency}
                      onValueChange={(value) => setDatabaseSettings(prev => ({ ...prev, backupFrequency: value }))}
                      disabled={!databaseSettings.backupEnabled}
                    >
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backup-time">Backup Time</Label>
                    <Input 
                      id="backup-time" 
                      type="time"
                      value={databaseSettings.backupTime}
                      onChange={(e) => setDatabaseSettings(prev => ({ ...prev, backupTime: e.target.value }))}
                      disabled={!databaseSettings.backupEnabled || databaseSettings.backupFrequency === "hourly"}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-6">
              <Button variant="outline">
                Run Manual Backup
              </Button>
              <Button onClick={handleSaveDatabaseSettings}>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="qrcodes">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Settings</CardTitle>
              <CardDescription>
                Configure QR code and barcode generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ID Generation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id-prefix">ID Prefix</Label>
                    <Input 
                      id="id-prefix" 
                      value={qrCodeSettings.prefix}
                      onChange={(e) => setQrCodeSettings(prev => ({ ...prev, prefix: e.target.value }))}
                      placeholder="ITEM-"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Prefix added to all automatically generated IDs
                    </p>
                  </div>
                  
                  <div className="space-y-2 flex flex-col justify-end">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="auto-generate" 
                        checked={qrCodeSettings.autoGenerate}
                        onCheckedChange={(checked) => setQrCodeSettings(prev => ({ ...prev, autoGenerate: checked }))}
                      />
                      <Label htmlFor="auto-generate">Auto-generate IDs</Label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Automatically generate IDs for new items
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">QR Code Content</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="include-location" 
                      checked={qrCodeSettings.includeLocation}
                      onCheckedChange={(checked) => setQrCodeSettings(prev => ({ ...prev, includeLocation: checked }))}
                    />
                    <Label htmlFor="include-location">Include Location in QR Code</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Include item location information in QR code data
                  </p>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">QR Code Preview</h4>
                  <div className="bg-white border p-4 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto border rounded-md flex items-center justify-center">
                        <svg className="w-24 h-24 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 3H9V9H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 3H21V9H15V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 15H9V21H3V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 15H21V21H15V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="mt-2 text-sm font-medium">{qrCodeSettings.prefix}1234</p>
                      <p className="text-xs text-gray-500">Example Item</p>
                      {qrCodeSettings.includeLocation && <p className="text-xs text-gray-500">Storage A</p>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-6">
              <Button onClick={handleSaveQrCodeSettings}>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
