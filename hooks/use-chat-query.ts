import { useSocket } from '@/components/providers/socket-provider'
import { useInfiniteQuery } from '@tanstack/react-query'
import qs from 'query-string'


interface Props {
    queryKey: string
    apiUrl: string
    paramKey: "channelId" | "conversationId"
    paramValue: string
}

export const useChatQuery = ({ queryKey, apiUrl, paramKey, paramValue }: Props) => {
    const { isConnected } = useSocket()
    const fetchMessages = async ({ pageParam = undefined }) => {
        const url = qs.stringifyUrl({
            url: apiUrl,
            query: {
                [paramKey]: paramValue,
                cursor: pageParam
            }
        }, { skipNull: true })
        const res = await fetch(url)
        return res.json()
    }
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
        queryKey,
        queryFn: fetchMessages,
        getNextPageParam: (lastPage, allPages) => lastPage?.nextCursor,
        getPreviousPageParam: (firstPage, allPages) => firstPage?.prevCursor,
    })

    return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    }
}