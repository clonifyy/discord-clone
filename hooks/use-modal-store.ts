import { Server } from "@prisma/client";
import { create } from "zustand";
export type ModalType =
  | "createServer"
  | "editServer"
  | "createChannel"
  | "invite";

interface ModalData {
  server?: Server;
}
interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  data: ModalData;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null }),
}));
