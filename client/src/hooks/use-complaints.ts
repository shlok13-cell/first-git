import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertComplaint } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useComplaints(isAdmin = false) {
  const path = isAdmin ? "/api/admin/complaints" : "/api/citizen/complaints";
  return useQuery({
    queryKey: [path],
    queryFn: async () => {
      const res = await fetch(path);
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
      const res = await fetch("/api/citizen/complaints", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/citizen/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
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

export function useUpdateComplaintDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, department }: { id: number; department: string }) => {
      const res = await fetch(`/api/admin/complaints/${id}/department`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update department");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizen/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      toast({
        title: "Department Updated",
        description: "The complaint has been reassigned successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/complaints/${id}/status`, {
        method: api.complaints.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      
      return api.complaints.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizen/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      toast({
        title: "Status Updated",
        description: "The complaint status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
