"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Donation {
  id: string;
  receiptNo: string;
  donorName: string;
  phone: string;
  amount: number;
  paymentMode: string | null;
  status: string | null;
  purpose?: string | null;
  date: string | null;
  gotram?: string | null;
}

interface EditDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
  onUpdate: (id: string, data: Partial<Donation>) => Promise<{ success: boolean; error?: string }>;
}

export function EditDonationModal({ isOpen, onClose, donation, onUpdate }: EditDonationModalProps) {
  const [formData, setFormData] = useState({
    donorName: "",
    phone: "",
    amount: 0,
    paymentMode: "UPI",
    status: "SUCCESS",
    purpose: "",
    gotram: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (donation) {
      setFormData({
        donorName: donation.donorName || "",
        phone: donation.phone || "",
        amount: donation.amount || 0,
        paymentMode: donation.paymentMode || "UPI",
        status: donation.status || "SUCCESS",
        purpose: donation.purpose || "",
        gotram: donation.gotram || "",
      });
    }
  }, [donation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donation) return;

    if (!formData.donorName.trim()) {
      toast.error("Please enter donor name");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      const result = await onUpdate(donation.id, {
        donorName: formData.donorName,
        phone: formData.phone,
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        status: formData.status,
        purpose: formData.purpose,
        gotram: formData.gotram,
      });

      if (result.success) {
        toast.success("Donation updated successfully!");
        onClose();
      } else {
        toast.error(result.error || "Failed to update donation");
      }
    } catch (error) {
      toast.error("An error occurred while updating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Donation</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Receipt: {donation?.receiptNo}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="donorName">Donor Name *</Label>
              <Input
                id="donorName"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                placeholder="Enter donor name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                placeholder="Amount"
                min={1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={(value) => setFormData({ ...formData, paymentMode: value })}
              >
                <SelectTrigger id="paymentMode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI / QR Code</SelectItem>
                  <SelectItem value="CASH">Cash Payment</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CARD">Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gotram">Gotram</Label>
              <Input
                id="gotram"
                value={formData.gotram}
                onChange={(e) => setFormData({ ...formData, gotram: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Donation purpose"
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Donation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
