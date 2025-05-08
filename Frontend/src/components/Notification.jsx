import React, { useState } from 'react';
import { AlertCircle, Bell, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        <span className="flex items-center">
          Notifications
          <span className="ml-2">
            <Bell className="h-4 w-4 text-red-500" />
          </span>
        </span>
        <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96">
        <div className="p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span>No notifications yet.</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
