
import { useState } from "react";
import PageHeader from "@/components/ui/page-header";
import { Settings, Server, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import SeedDataButton from "@/components/admin/SeedDataButton";

const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div>
      <PageHeader 
        title="Settings" 
        description="Configure system settings and preferences"
        icon={Settings}
      />

      <Tabs defaultValue="general" className="mt-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="system">System</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your general account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">General settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage notification settings and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="system" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Administration</CardTitle>
                <CardDescription>
                  Manage system-wide settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Database Operations</h3>
                  <div className="flex items-center gap-4">
                    <SeedDataButton />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This will populate the database with dummy Indian student and teacher data,
                    courses, subjects, and attendance records for testing purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsPage;
