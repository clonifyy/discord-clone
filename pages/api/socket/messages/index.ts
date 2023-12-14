import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";
import { StringifyOptions } from "query-string";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIO
) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const profile = await currentProfilePages(req)
        if (!profile) return res.status(401).json({ error: 'Unauthorized' })

        const { content, fileUrl } = req.body
        const { serverId, channelId } = req.query

        if (!serverId) return res.status(400).json({ error: 'Server id is missing' })
        if (!channelId) return res.status(400).json({ error: 'Channel id is missing' })
        if (!content && !fileUrl) return res.status(400).json({ error: 'Content or file url is missing' })

        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true
            }
        })
        if (!server) return res.status(400).json({ error: 'Server not found' })
        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: server.id,
            }
        })
        if (!channel) {
            return res.status(400).json({ error: 'Channel not found' })
        }

        const member = server.members.find(member => member.profileId === profile.id)
        if (!member) return res.status(401).json({ error: 'Unauthorized' })

        const message = await db.message.create({
            data: {
                content,
                fileUrl,
                memberId: member.id,
                channelId: channel.id
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }

            }
        })
        const channelKey = `chat:${channelId}:messages`
        res?.socket?.server?.io.emit(channelKey, message)
        return res.status(200).json({ message })

    } catch (error) {
        console.log("[MESSAGE_POST]", error)
        return res.status(500).json({ error: 'Internal server error' })
    }

}