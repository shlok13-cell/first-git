import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertComplaintSchema, type InsertComplaint, type Complaint } from "@shared/schema";
import { useCreateComplaint } from "@/hooks/use-complaints";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Building2, MapPin, Check, History, Search, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const STATUS_STEPS = ["Filed", "Under Review", "In Progress", "Resolved"];

function SLAStatus({ complaint }: { complaint: Complaint }) {
  const statusInfo = useMemo(() => {
    const created = new Date(complaint.createdAt || new Date());
    // Assume standard 3-day SLA (259200000 ms)
    const SLA_MS = 3 * 24 * 60 * 60 * 1000;
    const estimatedResolution = new Date(created.getTime() + SLA_MS);
    const now = new Date();

    if (complaint.status === "Resolved") {
      // In a real app, resolvedAt would be a field. Here we use current time for simulation.
      const resolved = now; 
      const duration = resolved.getTime() - created.getTime();
      
      let label = "Resolved On Time";
      let color = "text-green-600 bg-green-50";
      
      if (duration < SLA_MS * 0.8) {
        label = "Resolved Early";
        color = "text-emerald-600 bg-emerald-50";
      } else if (duration > SLA_MS) {
        label = "Resolved Delayed";
        color = "text-orange-600 bg-orange-50";
      }
      
      return { label, color, estimated: estimatedResolution };
    } else {
      const isDelayed = now.getTime() > estimatedResolution.getTime();
      return {
        label: isDelayed ? "Delayed" : "On Track",
        color: isDelayed ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50",
        estimated: estimatedResolution
      };
    }
  }, [complaint]);

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg border bg-muted/20 text-[11px] mb-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>Est. Resolution: {statusInfo.estimated.toLocaleDateString()}</span>
      </div>
      <Badge variant="outline" className={cn("border-none font-bold uppercase tracking-wider text-[9px] px-2 py-0.5", statusInfo.color)}>
        {statusInfo.label}
      </Badge>
    </div>
  );
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="w-full py-6 px-2">
      <div className="relative flex justify-between">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
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
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background",
                  isCompleted ? "bg-primary border-primary" : 
                  isActive ? "border-primary scale-110 shadow-sm" : 
                  "border-muted"
                )}
              >
                {isCompleted && <Check className="w-3 h-3 text-primary-foreground stroke-[3]" />}
                {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </div>
              <span 
                className={cn(
                  "absolute -bottom-6 text-[10px] font-medium whitespace-nowrap",
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

import { Star } from "lucide-react";

function SatisfactionFeedback({ status }: { status: string }) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (status !== "Resolved") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Feedback submission logic would go here
  };

  return (
    <Card className="mt-6 border-green-500/20 bg-green-50/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          Share Your Feedback
        </CardTitle>
        <CardDescription>
          How satisfied are you with the resolution of your grievance?
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-2"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-green-700">Thank you for your feedback!</p>
            <p className="text-sm text-green-600/80">Your input helps us improve our services.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={cn(
                    "p-1 rounded-full transition-all hover:scale-110",
                    rating >= star ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground hover:text-yellow-500/50"
                  )}
                >
                  <Star className={cn("w-8 h-8", rating >= star && "fill-current")} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Tell us more about your experience (optional)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none bg-white/50"
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!rating}
            >
              Submit Feedback
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function TrackingPanel() {
  const [isTracking, setIsTracking] = useState(false);
  const [results, setResults] = useState<Complaint[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: "",
      mobileNumber: "",
    },
  });

  async function onTrack(data: { name: string; mobileNumber: string }) {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/citizen/track", data);
      const complaints = await res.json();
      setResults(complaints);
      if (complaints.length === 0) {
        toast({
          title: "No grievances found",
          description: "We couldn't find any grievances matching the provided details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to track grievances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isTracking) {
    return (
      <div className="flex justify-center pt-8">
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => setIsTracking(true)}
          className="group hover:border-primary/50 transition-colors"
        >
          <History className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
          Track My Grievance
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-8 pt-8"
    >
      <Card className="border-primary/20 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Track Your Grievances</CardTitle>
              <CardDescription>Enter your details to see the status of your reported issues.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              setIsTracking(false);
              setResults(null);
            }}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onTrack)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input placeholder="Full Name" {...form.register("name", { required: true })} />
              </div>
              <div className="space-y-2">
                <Input placeholder="Mobile Number" {...form.register("mobileNumber", { required: true })} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search Grievances"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && results.length > 0 && (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {results.map((complaint) => (
              <motion.div
                key={complaint.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary/10 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
                        REF: #{complaint.id}
                      </Badge>
                      <Badge className={cn(
                        "capitalize",
                        complaint.status === "Resolved" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                        complaint.status === "In Progress" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                        "bg-orange-500/10 text-orange-600 border-orange-500/20"
                      )}>
                        {complaint.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{complaint.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SLAStatus complaint={complaint} />
                    <StatusTimeline currentStatus={complaint.status} />
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Reporting Person</span>
                        <div className="font-medium">{complaint.name}</div>
                        <div className="text-xs text-muted-foreground">{complaint.mobileNumber}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Location</span>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{complaint.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Satisfaction Feedback Section - Only shown when Resolved */}
                    <SatisfactionFeedback status={complaint.status} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default function Citizen() {
  const { mutate, isPending } = useCreateComplaint();
  const [submittedIds, setSubmittedIds] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("submitted_grievances");
    if (saved) {
      setSubmittedIds(JSON.parse(saved));
    }
  }, []);

  const form = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      location: "",
      complaintText: "",
    },
  });

  function onSubmit(data: InsertComplaint) {
    mutate(data, {
      onSuccess: (newComplaint) => {
        const updatedIds = [...submittedIds, newComplaint.id];
        setSubmittedIds(updatedIds);
        localStorage.setItem("submitted_grievances", JSON.stringify(updatedIds));
        form.reset();
      },
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-background to-secondary/20 space-y-12 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Voice Your Concern
          </h1>
          <p className="text-muted-foreground text-lg">
            We are here to listen. Submit your grievance and we'll ensure it reaches the right department immediately.
          </p>
        </div>

        <Card className="shadow-2xl shadow-primary/5 border-border/60 backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">New Grievance</CardTitle>
            <CardDescription>Fill in the details below to file a formal complaint.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                            className="h-11 bg-background/50 focus:bg-background transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Mobile Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+91 XXXXX XXXXX" 
                            {...field} 
                            className="h-11 bg-background/50 focus:bg-background transition-colors"
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
                        <FormLabel className="text-foreground/80">Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="City, District or Landmark" 
                            {...field}
                            className="h-11 bg-background/50 focus:bg-background transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="complaintText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Description of Issue</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe the issue in detail..." 
                          className="min-h-[160px] resize-none bg-background/50 focus:bg-background transition-colors text-base leading-relaxed"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing & Submitting...
                      </>
                    ) : (
                      <>
                        Submit Grievance
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <TrackingPanel />
      </motion.div>
    </div>
  );
}
