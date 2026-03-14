
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Lock, Settings, FileText, Landmark, Search, Loader2, Eye, Download, CheckCircle2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("applications");
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const handleVerifyPayment = async (appId: number) => {
    try {
      const response = await fetch(`http://3.14.204.157/wp-json/faap/v1/applications/${appId}/payment-verified`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        // Refresh the applications list
        const appsResponse = await fetch("http://3.14.204.157/wp-json/faap/v1/applications");
        const data = await appsResponse.json();
        setApplications(data);
        
        // Show success message (you might want to add a toast here)
        alert('Payment verified successfully! Notifications sent to user and admin.');
      } else {
        alert('Failed to verify payment.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Error verifying payment.');
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("http://3.14.204.157/wp-json/faap/v1/applications");
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error("Failed to load applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#14284a] pb-20 font-body">
      <header className="bg-[#14284a] py-6 px-6 md:px-12 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center">
          <div className="bg-[#14284a] p-2 rounded-lg" style={{ boxShadow: '0 0 32px 8px #3ec6ff, 0 0 8px 2px #1a3a5d' }}>
            <Image
              src="/Prominence Bank.png"
              alt="Prominence Bank Logo"
              width={120}
              height={120}
              className="rounded"
              priority
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-[14px] text-white/80 font-bold uppercase tracking-widest">
          <Lock className="w-5 h-5 text-[#3ec6ff]" />
          Secure Application Portal
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white border shadow-sm h-12 p-1 rounded-full w-fit">
            <TabsTrigger value="applications" className="rounded-full gap-2 px-6"><FileText className="w-4 h-4" /> Submissions</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full gap-2 px-6"><Settings className="w-4 h-4" /> Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card className="border-none shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 p-6">
                <div>
                  <CardTitle className="text-primary text-lg font-bold">Application Records</CardTitle>
                  <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Secure submissions from local database</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search records..." className="pl-9 h-9 text-xs w-[250px] rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest pl-8">Date</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Application ID</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Type</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Client Name / Entity</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-right pr-8 font-bold text-[10px] uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted" /></TableCell></TableRow>
                    ) : applications.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">No applications found in system.</TableCell></TableRow>
                    ) : applications.map((app: any) => (
                      <TableRow key={app.id} className="hover:bg-slate-50/30 group">
                        <TableCell className="pl-8 text-xs font-medium">{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs font-bold text-primary">{app.applicationId}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter">{app.type}</Badge></TableCell>
                        <TableCell className="text-xs font-bold text-primary">{app.formData?.fullName || app.formData?.entityName || "Anonymous Request"}</TableCell>
                        <TableCell><Badge className={cn("text-[8px] uppercase tracking-widest", app.status === 'Payment Verified' ? "bg-emerald-500" : app.status === 'Approved' ? "bg-blue-500" : "bg-amber-500")}>{app.status || 'Pending'}</Badge></TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)} className="gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white rounded-full h-8 px-4">
                              <Eye className="w-3.5 h-3.5" /> View
                            </Button>
                            {app.status === 'Pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleVerifyPayment(app.id)} 
                                className="gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 hover:text-white rounded-full h-8 px-4"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verify Payment
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <Card className="border-none shadow-xl">
               <CardHeader>
                  <CardTitle className="text-primary text-lg">System Configuration</CardTitle>
                  <CardDescription>Manage database connection and admin preferences.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="p-10 border-2 border-dashed rounded-xl text-center space-y-4">
                     <p className="text-xs text-muted-foreground">Database settings are managed via the <strong>.env</strong> file on your EC2 instance.</p>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-body">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-3 font-headline text-2xl">
                <Landmark className="text-accent" />
                Submission Review
              </DialogTitle>
            </DialogHeader>
            <div className="py-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] border-l-2 border-accent pl-2">Client Identity Payload</h4>
                  <div className="bg-muted/30 p-5 rounded-2xl space-y-3">
                    {Object.entries(selectedApp?.formData || {}).filter(([key, val]) => typeof val !== 'object').map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-white/50 pb-1.5">
                        <span className="text-[9px] text-muted-foreground uppercase font-medium">{key}</span>
                        <span className="text-[11px] font-bold text-primary">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-6 gap-3">
              <Button variant="outline" className="rounded-full gap-2 text-[10px] uppercase font-bold px-8 h-10"><Download className="w-4 h-4" /> Download PDF</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
