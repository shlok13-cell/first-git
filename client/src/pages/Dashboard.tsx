import { useComplaints, useUpdateComplaintStatus } from "@/hooks/use-complaints";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, MapPin, Tag, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPLAINT_STATUS } from "@shared/schema";

export default function Dashboard() {
  const { data: complaints, isLoading, error } = useComplaints();
  const updateStatus = useUpdateComplaintStatus();

  // Calculate analytics from existing complaints data
  const stats = {
    total: complaints?.length || 0,
    filed: complaints?.filter(c => c.status === "Filed").length || 0,
    inProgress: complaints?.filter(c => c.status === "In Progress").length || 0,
    resolved: complaints?.filter(c => c.status === "Resolved").length || 0,
  };

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

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span className="font-semibold">Failed to load complaints</span>
      </div>
    );
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 4) return "bg-red-500/10 text-red-600 border-red-500/20";
    if (score === 3) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    return "bg-green-500/10 text-green-600 border-green-500/20";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Overview of all submitted grievances and their status.
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
          </2xl>
        </Card>
      </div>

      {complaints?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
          <CheckCircle2 className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground">No complaints yet</h3>
          <p className="text-muted-foreground mt-2">Everything seems to be running smoothly!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {complaints?.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300 group bg-card">
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
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-3 min-h-[60px] leading-relaxed">
                    {complaint.complaintText}
                  </p>
                  
                  <div className="pt-4 border-t border-border/50 space-y-3">
                    <div className="flex items-center text-sm text-foreground/80">
                      <Building2 className="w-4 h-4 mr-2 text-primary/70" />
                      <span className="font-medium truncate">{complaint.department}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground/70" />
                      <span className="truncate">{complaint.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                          {complaint.name.charAt(0).toUpperCase()}
                        </div>
                        {complaint.name}
                      </span>
                      <span className="font-mono opacity-50">#{complaint.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
