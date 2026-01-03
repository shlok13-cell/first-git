import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertComplaint } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useComplaints() {
  return useQuery({
    queryKey: [api.complaints.list.path],
    queryFn: async () => {
      const res = await fetch(api.complaints.list.path);
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return api.complaints.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertComplaint) => {
      const res = await fetch(api.complaints.create.path, {
        method: api.complaints.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to submit complaint");
      }
      
      return api.complaints.create.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.complaints.list.path] });
      toast({
        title: "Complaint Submitted",
        description: `Reference ID: #${data.id} - Urgency: ${data.urgency}/5`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
