import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface Props {
  params: {
    serverId: string;
  };
}
const ServerPage = async ({ params }: Props) => {
  const profile = await currentProfile();
  if (!profile) return redirectToSignIn();
  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: "General",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  const initialChannel = server?.channels[0];
  if (initialChannel?.name !== "General") return null;

  return redirect(
    `/servers/${params?.serverId}/channels/${initialChannel?.id}`
  );
};

export default ServerPage;
