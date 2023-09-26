import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    console.log(serverId, " log server id");
    if (!profile) throw new NextResponse("Unauthenticated", { status: 401 });
    if (!serverId)
      throw new NextResponse("Server ID is missing", { status: 400 });

    if (name === "General")
      return new NextResponse("Name can not be 'General'", { status: 400 });
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
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log("CHANNEL POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
