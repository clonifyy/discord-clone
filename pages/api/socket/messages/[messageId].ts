import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    if (req.method !== 'DELETE' && req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' })
    console.log(req.method, 'delete? ')
    try {
        const profile = await currentProfilePages(req)
        const { messageId, serverId, channelId } = req.query
        const { content } = req.body
        if (!profile) return res.status(401).json({ message: 'Unauthorized' })
        if (!serverId) return res.status(400).json({ message: 'Server ID is required' })
        if (!channelId) return res.status(400).json({ message: 'Channel ID is required' })

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
        if (!server) return res.status(404).json({ message: 'Server not found' })
        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string
            }
        })
        if (!channel) return res.status(404).json({ message: 'Channel not found' })

        const member = server.members.find(member => member.profileId === profile.id)
        if (!member) return res.status(401).json({ message: 'Member not found' })
        let message = await db.message.findFirst({
            where: {
                id: messageId as string,
                channelId: channelId as string
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        })
        if (!message) return res.status(404).json({ message: 'Message not found' })
        const isMessageOwner = message.memberId === member.id
        const isAdmin = member.role === MemberRole.ADMIN
        const isModerator = member.role === MemberRole.MODERATOR
        const canModify = isMessageOwner || isAdmin || isModerator
        if (!canModify) return res.status(401).json({ message: 'Unauthorized' })
        if (req.method === 'DELETE') {
            console.log('vo day ?')
            message = await db.message.update({
                where: {
                    id: messageId as string
                },
                data: {
                    fileUrl: null,
                    content: "This message has been deleted",
                    deleted: true
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }
        if (req.method === 'PATCH') {
            if (!isMessageOwner) {
                return res.status(401).json({ message: 'Unauthorized' })
            }
            message = await db.message.update({
                where: {
                    id: messageId as string
                },
                data: {
                    content,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        const updateKey = `chat:${channelId}:messages:update`
        res?.socket?.server?.io?.emit(updateKey, message)
        return res.status(200).json(message)
    } catch (error) {
        console.log('[ERROR]', error)
        return res.status(500).json({ message: 'Internal Error' })
    }

}