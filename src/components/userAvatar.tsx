import Image from "next/image";
import { auth } from "src/app/auth";

export default async function UserAvatar() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <div>
      {session.user.image ? (<Image src={session.user.image} alt="User Avatar" />) : null}   
    </div>
  );
}
