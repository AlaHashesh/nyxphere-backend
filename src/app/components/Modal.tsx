import React, { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

type Props = {
  children: ReactNode;
};

export type ModalRef = {
  open: () => void;
  close: () => void;
};

const Modal = forwardRef(({ children }: Props, ref) => {
  const localRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }));

  if (!isOpen) return null;

  return <Dialog ref={localRef} open={isOpen} onClose={setIsOpen} className="relative z-50">
    <DialogBackdrop
      transition
      className="fixed inset-0 bg-gray-900/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
    />

    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <DialogPanel
          transition
          className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
        >
          {children}
        </DialogPanel>
      </div>
    </div>
  </Dialog>;
});

Modal.displayName = "Modal";
export default Modal;