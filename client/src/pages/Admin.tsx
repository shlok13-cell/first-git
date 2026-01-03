import { useComplaints, useUpdateComplaintStatus, useUpdateComplaintDepartment } from "@/hooks/use-complaints";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, MapPin, Tag, Building2, Check, Lock, BrainCircuit, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPLAINT_STATUS } from "@shared/schema";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";

const DEPARTMENTS = [
  "General Administration",
  "Water & Sanitation",
  "Electricity Board",
  "Transport & Roads",
  "Public Health & Environment",
  "Finance & Revenue",
  "Emergency Response Unit",
  "Police (Traffic)",
  "Sanitation Department",
  "Urban Planning",
  "Public Works"
];

const STATUS_STEPS = ["Filed", "Under Review", "In Progress", "Resolved"];

function ResolutionAssistant({ id, urgency, status }: { id: number, urgency: number, status: string }) {
  const { data: plan, isLoading } = useQuery({
    queryKey: [`/api/admin/complaints/${id}/resolution-plan`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/complaints/${id}/resolution-plan`);
      if (!res.ok) throw new Error("Failed to fetch resolution plan");
      return res.json();
    }
  });

  if (isLoading || !plan) return <Skeleton className="h-24 w-full rounded-xl" />;

  const isResolved = status === "Resolved";

  return (
    <div className={cn(
      "rounded-xl p-4 border space-y-3 transition-colors",
      isResolved ? "bg-green-500/5 border-green-500/10" : "bg-primary/5 border-primary/10"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <BrainCircuit className="w-4 h-4" />
          {isResolved ? "Resolution Summary" : "AI Resolution Assistant"}
        </div>
        {!isResolved && (
          <Badge variant="outline" className="text-[10px] bg-background">
            <Clock className="w-3 h-3 mr-1" />
            {plan.expectedResolutionTime}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {isResolved ? "Steps Taken:" : "Suggested Steps:"}
        </div>
        <ul className="space-y-1.5">
          {plan.suggestedSteps.map((step: string, i: number) => (
            <li key={i} className="text-xs flex items-start gap-2 text-foreground/80">
              <div className={cn(
                "mt-1.5 w-1 h-1 rounded-full shrink-0",
                isResolved ? "bg-green-500/40" : "bg-primary/40"
              )} />
              {step}
            </li>
          ))}
        </ul>
      </div>

      {!isResolved && urgency >= 4 && (
        <div className="pt-2 border-t border-primary/10">
          <div className="text-[11px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Escalation Advice:
          </div>
          <div className="text-xs text-destructive/90 mt-1 font-medium italic">
            {plan.escalationAdvice}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-[9px] text-muted-foreground italic">
        <Info className="w-2.5 h-2.5" />
        Note: This guidance is AI-generated for assistive purposes only.
      </div>
    </div>
  );
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="w-full py-4 px-1">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
        />

        {STATUS_STEPS.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={status} className="relative z-10 flex flex-col items-center">
              <div 
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isCompleted ? "bg-primary border-primary" : 
                  isActive ? "bg-background border-primary scale-125 shadow-sm" : 
                  "bg-background border-muted"
                )}
              >
                {isCompleted && <Check className="w-2.5 h-2.5 text-primary-foreground stroke-[4]" />}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
              <span 
                className={cn(
                  "absolute -bottom-5 text-[10px] font-medium whitespace-nowrap transition-colors",
                  isActive ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PinModal({ onCorrectPin }: { onCorrectPin: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Correct PIN: 1234
    if (pin === "1234") {
      onCorrectPin();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => setLocation("/citizen")}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Access
          </DialogTitle>
          <DialogDescription>
            Please enter the admin PIN to access the dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              maxLength={4}
              className={cn("text-center text-2xl tracking-[1em]", error && "border-destructive")}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive text-center font-medium animate-shake">
                Incorrect PIN. Please try again.
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/citizen")}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Verify PIN
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: complaints, isLoading, error } = useComplaints(true);
  const updateStatus = useUpdateComplaintStatus();
  const updateDepartment = useUpdateComplaintDepartment();

  const handleCorrectPin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <PinModal onCorrectPin={handleCorrectPin} />;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate analytics from existing complaints data
  const stats = {
    total: complaints?.length || 0,
    filed: complaints?.filter(c => c.status === "Filed").length || 0,
    inProgress: complaints?.filter(c => c.status === "In Progress").length || 0,
    resolved: complaints?.filter(c => c.status === "Resolved").length || 0,
  };

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span className="font-semibold">Failed to load complaints</span>
      </div>
    );
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 4) return "bg-red-500/10 text-red-600 border-red-500/20 ring-2 ring-red-500/50";
    if (score === 3) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    return "bg-green-500/10 text-green-600 border-green-500/20";
  };

  const activeComplaints = complaints?.filter(c => c.status !== "Resolved").sort((a, b) => b.urgency - a.urgency);
  const resolvedComplaints = complaints?.filter(c => c.status === "Resolved").sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Overview of all active submitted grievances and their status.
        </p>
      </motion.div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="bg-card hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Total Grievances</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Filed</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.filed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">In Progress</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Resolved</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-12">
        {/* Active Grievances Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Active Grievances</h2>
            <Badge variant="secondary" className="ml-2">{activeComplaints?.length || 0}</Badge>
          </div>

          {!activeComplaints || activeComplaints.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
              <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground">No active complaints</h3>
              <p className="text-muted-foreground mt-1">All issues are currently resolved or haven't been filed yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300 group bg-card",
                    complaint.urgency >= 4 && "border-red-500/50 shadow-lg shadow-red-500/5"
                  )}>
                    <CardHeader className="space-y-3 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn("px-2.5 py-0.5 font-semibold text-xs transition-colors", getUrgencyColor(complaint.urgency))}
                        >
                          Urgency: {complaint.urgency}/5
                        </Badge>
                        <Select
                          defaultValue={complaint.status}
                          onValueChange={(value) => updateStatus.mutate({ id: complaint.id, status: value })}
                          disabled={updateStatus.isPending}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary/50 border-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPLAINT_STATUS.map((status) => (
                              <SelectItem key={status} value={status} className="text-xs">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <CardTitle className="font-display text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {complaint.category}
                      </CardTitle>
                      <StatusTimeline currentStatus={complaint.status} />
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm line-clamp-3 min-h-[60px] leading-relaxed">
                        {complaint.complaintText}
                      </p>
                      
                      {/* AI Routing Info */}
                      <div className="bg-secondary/30 rounded-xl p-3 border border-border/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                            <BrainCircuit className="w-3.5 h-3.5" />
                            AI Routing Details
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[10px] px-1.5 py-0",
                            complaint.routingConfidence === "High" ? "text-green-600 border-green-600/20" :
                            complaint.routingConfidence === "Medium" ? "text-orange-600 border-orange-600/20" :
                            "text-red-600 border-red-600/20"
                          )}>
                            {complaint.routingConfidence} Confidence
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-snug italic">
                          {complaint.routingReason}
                        </div>
                        {complaint.secondaryDepartment && (
                          <div className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Secondary: {complaint.secondaryDepartment}
                          </div>
                        )}
                      </div>

                      {/* AI Resolution Assistant */}
                      <ResolutionAssistant id={complaint.id} urgency={complaint.urgency} status={complaint.status} />

                      <div className="pt-4 border-t border-border/50 space-y-3">
                        <div className="flex items-center justify-between text-sm text-foreground/80">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2 text-primary/70" />
                            <span className="font-medium truncate max-w-[120px]">{complaint.department}</span>
                          </div>
                          <Select
                            defaultValue={complaint.department}
                            onValueChange={(value) => updateDepartment.mutate({ id: complaint.id, department: value })}
                            disabled={updateDepartment.isPending}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-[10px] bg-secondary/50 border-none">
                              <SelectValue placeholder="Reassign" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map((dept) => (
                                <SelectItem key={dept} value={dept} className="text-[10px]">
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground/70" />
                          <span className="truncate">{complaint.location}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground pt-2">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                                {complaint.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-foreground">{complaint.name}</span>
                            </span>
                            <span className="text-[10px] pl-7 opacity-70">
                              Mob: {complaint.mobileNumber || "Not provided"}
                            </span>
                          </div>
                          <span className="font-mono opacity-50">#{complaint.id}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Resolved Grievances Section */}
        <section className="pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold">Resolved Grievances</h2>
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              {resolvedComplaints?.length || 0}
            </Badge>
          </div>

          {!resolvedComplaints || resolvedComplaints.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
              <p className="text-muted-foreground italic text-sm">No resolved grievances to show yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {resolvedComplaints.map((complaint) => (
                <Card key={complaint.id} className="bg-muted/50 border-muted opacity-80 hover:opacity-100 transition-opacity">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground">ID: #{complaint.id}</span>
                      <Badge variant="secondary" className="text-[9px] h-4 bg-green-100 text-green-800 border-none">
                        Resolved
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      {complaint.category}
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                      "{complaint.complaintText}"
                    </p>
                    
                    {/* Resolution Summary for Resolved Grievances */}
                    <div className="mt-2">
                      <ResolutionAssistant id={complaint.id} urgency={complaint.urgency} status={complaint.status} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        {complaint.department}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {complaint.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
