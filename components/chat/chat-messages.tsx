'use client'

import { Member, Message } from "@prisma/client"
import { ChatWelcome } from "./chat-welcome"
import { useChatQuery } from "@/hooks/use-chat-query"
import { Loader2, ServerCrash } from "lucide-react"
import { Fragment } from "react"
import { ChatItem } from "./chat-item"
import { format } from "date-fns"
import { useChatSocket } from "@/hooks/use-chat-socket"

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: {
      avatar: string
    }
  }
}
interface Props {
  name: string
  member: Member
  chatId: string
  apiUrl: string
  socketUrl: string
  socketQuery: Record<string, any>
  paramKey: 'channelId' | 'conversationId'
  type: 'channel' | 'conversation'
  paramValue: string
}

const DATE_FORMAT = 'd MMM yyyy, HH:mm'

export default function ChatMessages({
  apiUrl,
  chatId,
  member,
  name,
  paramKey,
  paramValue,
  socketQuery,
  socketUrl,
  type
}: Props) {
  const queryKey = `chat:${chatId}`
  const addKey = `chat:${chatId}:messages`
  const updateKey= `chat:${chatId}:messages:update`
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
    apiUrl,
    queryKey,
    paramKey,
    paramValue
  })
  useChatSocket({queryKey, addKey, updateKey})

  if (status === 'loading') return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading messages</p>
    </div>
  )
  if (status === 'error') return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Something went wrong</p>
    </div>
  )
  return (
    <div className="flex-1 flex flex-col py-4 overflow-y-auto">
      <div className="flex-1" />
      <ChatWelcome
        type={type}
        name={name}
      />
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((page, i) => (
          <Fragment key={i}>
            {page?.items.map((message: MessageWithMemberWithProfile) => (
              <div key={message.id}>
                <ChatItem
                  currentMember={member}
                  key={message.id}
                  id={message.id}
                  content={message.content}
                  deleted={message.deleted}
                  fileUrl={message.fileUrl}
                  timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                  isUpdated={message.updatedAt !== message.createdAt}
                  socketUrl={socketUrl}
                  socketQuery={socketQuery}
                  member={message.member as any}
                />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
