import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams?.get("serverId");
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });
    if (!serverId)
      return new NextResponse("Server id missing", { status: 400 });
    if (!params.channelId)
      return new NextResponse("Channel id missing", { status: 400 });

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: "General",
            },
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log("[DELETE_CHANNEL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams?.get("serverId");
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });
    if (!serverId)
      return new NextResponse("Server id missing", { status: 400 });
    if (!params.channelId)
      return new NextResponse("Channel id missing", { status: 400 });
    if (name === "General")
      return new NextResponse("Channel name can not be General");
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "General",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log("[DELETE_CHANNEL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
