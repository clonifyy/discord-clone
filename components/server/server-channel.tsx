"use client";
import { cn } from "@/lib/utils";
import { Channel, MemberRole, Server } from "@prisma/client";
import { iconMap } from "./server-sidebar";
import { useParams } from "next/navigation";
import { ActionTooltip } from "@/components/action-tooltip";
import { Edit, Lock, Trash } from "lucide-react";

interface Props {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

export default function ServerChannel({ channel, server, role }: Props) {
  const params = useParams();
  return (
    <button
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      {iconMap[channel.type]}
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition ",
          params?.channelId === channel.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "General" && role !== MemberRole.GUEST && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              className="h-4 w-4 hidden group-hover:block text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300
                transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete">
            <Trash
              className="h-4 w-4 hidden group-hover:block text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300
                transition"
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "General" && (
        <Lock className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-300" />
      )}
    </button>
  );
}
