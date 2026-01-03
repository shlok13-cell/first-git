import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertComplaintSchema, type InsertComplaint } from "@shared/schema";
import { useCreateComplaint, useComplaints } from "@/hooks/use-complaints";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Search, CheckCircle2, Clock, Building2, MapPin, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STEPS = ["Filed", "Under Review", "In Progress", "Resolved"];

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

export default function Citizen() {
  const { mutate, isPending } = useCreateComplaint();
  const { data: allComplaints } = useComplaints();
  const [submittedIds, setSubmittedIds] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("submitted_grievances");
    if (saved) {
      setSubmittedIds(JSON.parse(saved));
    }
  }, []);

  const myComplaints = allComplaints?.filter(c => submittedIds.includes(c.id)) || [];

  const form = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      name: "",
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
    <div className="min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-background to-secondary/20 space-y-12">
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
      </motion.div>

      {myComplaints.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="flex items-center gap-2 px-2">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Track Your Grievances</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {myComplaints.map((complaint) => (
                <motion.div
                  key={complaint.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="h-full border-primary/10 shadow-lg hover:shadow-xl transition-shadow bg-white/50 backdrop-blur-sm">
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
                      <StatusTimeline currentStatus={complaint.status} />
                      
                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4 mr-2" />
                          <span>{complaint.department}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{complaint.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
