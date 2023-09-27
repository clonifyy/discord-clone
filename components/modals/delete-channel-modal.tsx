"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import qs from "query-string";
import { useModal } from "@/hooks/use-modal-store";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";

export const DeleteChannelModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const { server, channel } = data;
  const isModalOpen = isOpen && type === "deleteChannel";

  const onClick = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.delete(url);
      onClose();
      router.refresh();
      router.push(`/servers/${server?.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-center  text-2xl font-bold">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this?
            <br />
            <span className="font-semibold text-indigo-500">
              {channel?.name}
            </span>{" "}
            will be permanently deleted
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="py-6 px-4 bg-gray-100">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={onClick} variant="primary">
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
